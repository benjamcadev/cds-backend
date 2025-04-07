const pool = require('../db')
const { convertBigintToInt } = require('../helpers/convertBigintToInt')
const { htmlToPdfEntrada } = require('../helpers/generatePDF')
const { jsonToHtmlValeEntrada } = require('../helpers/generateHtml')
const { createDirectoryTicketEntrada, saveSignature, saveImageEntrada } = require('../helpers/directory')
const { sendEmailTicketEntrada } = require('../helpers/emails')
const { convertirABase64 } = require('../helpers/convertFileToBase64')


const createTicket = async (req, res) => {

    try {
        const conn = await pool.getConnection();
        const request = req.body;

        let result = '';

        result = await conn.query(
            'INSERT INTO ticket_entrada (fecha, motivo, responsable_bodega, foto_documentos, estado_ticket_idestado_ticket, usuario_idusuario, tipo_ticket_idtipo_ticket, signature_path_responsable, signature_path_entrega) ' +
            'VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [request.fecha, request.motivo, request.responsable_bodega, request.foto_documentos, 2, request.usuario_idusuario, request.tipo_ticket_idtipo_ticket, request.firmaBodega, request.firmaSolicitante]
        )


        if (result.affectedRows === 1) {
            const lastIdTicketEntrada = convertBigintToInt(result.insertId);

            for (let i = 0; i < request.detalle.length; i++) {
                const reservaOcValue = request.detalle[i].reserva
                    ? request.detalle[i].reserva
                    : null;

                await conn.query('INSERT INTO detalle_ticket_entrada (cantidad, articulo_idarticulo, ticket_entrada_idticket_entrada, bodegas_idbodegas, ubicacion_bodegas_id, reserva_oc) ' +
                    'VALUES (?, ?, ?, ?, ?, ?)',
                    [request.detalle[i].cantidad, request.detalle[i].idArticulo, lastIdTicketEntrada, request.detalle[i].bodega, request.detalle[i].ubicacion, reservaOcValue]
                );
            }


            const result_user = await conn.query('SELECT idusuario AS id, nombre AS label FROM usuario');

            let nombreResponsableBodega = result_user.map((responsable) => {
                if (responsable.id === request.responsable_bodega) {
                    return responsable.label;
                }
            }).filter(i => i);

            request.responsable_bodega = nombreResponsableBodega;

            const result_bodegas = await conn.query('SELECT idbodegas, nombre AS label_bodega FROM bodegas WHERE estado = 1');

            for (let i = 0; i < request.detalle.length; i++) {
                for (let o = 0; o < result_bodegas.length; o++) {
                    if (request.detalle[i].bodega === result_bodegas[o].idbodegas) {
                        request.detalle[i].bodega = result_bodegas[o].label_bodega;
                    }
                }
            }

            const result_ubicacion_bodegas = await conn.query('SELECT id_ubicacion_bodegas, ubicacion AS label_ubicacion_bodega FROM ubicacion_bodegas');

            for (let i = 0; i < request.detalle.length; i++) {
                for (let o = 0; o < result_ubicacion_bodegas.length; o++) {
                    if (request.detalle[i].ubicacion === result_ubicacion_bodegas[o].id_ubicacion_bodegas) {
                        request.detalle[i].ubicacion = result_ubicacion_bodegas[o].label_ubicacion_bodega;
                    }
                }
            }

            try {
                const html = await jsonToHtmlValeEntrada(request, lastIdTicketEntrada);

                const responsePath = await createDirectoryTicketEntrada(lastIdTicketEntrada);


                const imagenPath = await saveImageEntrada(request, responsePath, lastIdTicketEntrada)

                let pathSignature = await saveSignature(request, responsePath, lastIdTicketEntrada);

                // Guardar imagenPath en la base de datos

                await conn.query('UPDATE ticket_entrada SET foto_documentos = ? WHERE idticket_entrada = ?', [imagenPath.foto_documentos, lastIdTicketEntrada]);

                await conn.query('UPDATE ticket_entrada SET signature_path_entrega="' + pathSignature.entrega + '" WHERE idticket_entrada = ' + lastIdTicketEntrada);

                if (!request.firmaBodega) {
                    conn.end();
                    res.status(200).json({
                        idTicket: lastIdTicketEntrada
                    });
                } else {
                    await htmlToPdfEntrada(html, responsePath, lastIdTicketEntrada);
                    await sendEmailTicketEntrada(responsePath, lastIdTicketEntrada, request, imagenPath);
                    await conn.query('UPDATE ticket_entrada SET signature_path_responsable="' + pathSignature.retira + '" WHERE idticket_entrada = ' + lastIdTicketEntrada);
                    conn.end();
                    res.status(200).json({
                        idTicket: lastIdTicketEntrada
                    });
                }

            } catch (error) {
                conn.end();
                res.status(400).send('Hubo un error: ' + error);
            }

        } else {
            conn.end();
            res.status(400).send('Hubo un error: ' + result);
        }
    } catch (error) {
        res.status(400).send('Hubo un error: ' + error);
    }
};

const getTicketEntrada = async (req, res) => {

    const id_ticket = req.params.id

    try {

        const conn = await pool.getConnection()
        //QUERY RESCATA DATOS DEL TICKET ENTRADA
        let result_ticket = await conn.query(`SELECT * FROM ticket_entrada WHERE idticket_entrada = ${id_ticket}`)
        //QUERY RESCATA EL DETALLE DEL TICKET DE ENTRADA
        let result_ticket_detalle = await conn.query(
            `SELECT detalle_ticket_entrada.bodegas_idbodegas AS bodega, detalle_ticket_entrada.ubicacion_bodegas_id AS ubicacion, (detalle_ticket_entrada.cantidad) * -1 as cantidad, 
                articulo.nombre AS descripcion,articulo.idarticulo AS id, articulo.unidad_medida AS unidad,
                articulo.idarticulo AS idArticulo
                FROM detalle_ticket_entrada 
                INNER JOIN articulo
                ON detalle_ticket_entrada.articulo_idarticulo = articulo.idarticulo
                WHERE ticket_entrada_idticket_entrada = ${id_ticket}
                GROUP BY articulo.nombre`
        )

        //var fecha_creacion = result_ticket[0].fecha_creacion.toISOString().substring(0, 19).replace("T", " ")
        //result_ticket[0].fecha_creacion = fecha_creacion;

        conn.end()
        if (result_ticket.length == 0) {
            return res.status(400).json({
                message: 'No existe datos para ticket consultado',
                title: 'Error'
            });
        }

        result_final = { ...result_ticket[0], detalle: result_ticket_detalle }

        res.status(200).json(convertBigintToInt(result_final))


    } catch (error) {
        res.status(400).send('hubo un error en getUsuarios: ' + error)
    }
}

const getSignatureEntrada = async (req, res) => {
    const id_ticket = req.params.id
    try {
        const conn = await pool.getConnection()
        const result = await conn.query(`SELECT signature_path_responsable, signature_path_entrega FROM ticket_entrada WHERE idticket_entrada = ${id_ticket}`)
        conn.end()

        if (result.length == 0) {
            return res.status(400).json({
                message: 'No existen firmas para ticket consultado',
                title: 'Error'
            });
        }


        //convertir a base64
        const base64_entrega = 'data:image/png;base64,' + fs.readFileSync(result[0].signature_path_entrega, { encoding: 'base64' });
        const base64_responsable = 'data:image/png;base64,' + fs.readFileSync(result[0].signature_path_responsable, { encoding: 'base64' });


        const result_final = {
            base64_entrega: base64_entrega,
            base64_responsable: base64_responsable
        }
        res.status(200).json(result_final)
    } catch (error) {
        res.status(400).send('hubo un error en getSignature: ' + error)
    }
}



//Traer campos de tabla tipo_ticket para mostrar en el front end 
const getTipoTicket = async (req, res) => {

    try {
        const conn = await pool.getConnection()
        const response = await conn.query('SELECT * FROM tipo_ticket')
        conn.end();
        res.send(response) // Enviar solo los resultados

    } catch (error) {
        res.status(400).send('hubo un error' + error)
    }

}

const getListValesEntrada = async (req, res) => {
    const conn = await pool.getConnection()

    try {
        const request = req.body
        let result = ''

        result = await conn.query('SELECT ticket_entrada.idticket_entrada as id, ticket_entrada.fecha, ticket_entrada.motivo, ' +
            'ticket_entrada.responsable_bodega, ticket_entrada.tipo_ticket_idtipo_ticket, ticket_entrada.estado_ticket_idestado_ticket, ' +
            'ticket_entrada.pdf_path ' +
            'FROM ticket_entrada ' +
            'INNER JOIN usuario ' +
            'WHERE usuario.idusuario = ticket_entrada.usuario_idusuario ' +
            'ORDER BY ticket_entrada.idticket_entrada DESC')

        // Convertir valores BigInt a String durante la serialización
        const valesEntradaConvertidos = result.map(valeEntrada => {
                return {
                    ...valeEntrada,
                    id: valeEntrada.id ? valeEntrada.id.toString() : null,
                };
            });


        conn.release();
        conn.end();


        // Enviar la respuesta con los datos obtenidos al cliente
        await res.status(200).json(valesEntradaConvertidos);

    } catch (error) {

    }
}

const getValeEntrada = async (req, res) => {

    const { pdf_path } = req.body;


    try {
        const fileBase64 = await convertirABase64(pdf_path)

        const response = {
            base64: fileBase64
        }

        res.status(200).json(response);
    } catch (error) {
        res.status(500).send('Error al consultar vale entrada pdf en base64 ' + error);
    }




}

const getTotalValeEntradaMensual = async (req, res) => {

      try {
            const conn = await pool.getConnection()
    
            const result = await conn.query("SELECT COUNT(*) as total FROM ticket_entrada " + 
                "WHERE fecha  >= DATE_FORMAT(CURDATE(), '%Y-%m-01') AND fecha  < CURDATE() + INTERVAL 1 DAY")
    
            // Convertir valores BigInt a String durante la serialización
            const valeEntradaConvertidos = result.map(vale => {
                return {
                    ...vale,
                   total: vale.total ? vale.total.toString() : 0,
                };
            });
    
            conn.release();
            conn.end();
            res.status(200).json(valeEntradaConvertidos);
    
        } catch (error) {
            res.status(500).send('Error interno del servidor' + error);
        }
}

module.exports = {
    createTicket,
    getTipoTicket,
    getTicketEntrada,
    getSignatureEntrada,
    getListValesEntrada,
    getValeEntrada,
    getTotalValeEntradaMensual
}