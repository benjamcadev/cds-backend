const pool = require('../db')
const { convertBigintToInt } = require('../helpers/convertBigintToInt')
const { htmlToPDF } = require('../helpers/generatePDF')
const { jsonToHtmlValeSalida } = require('../helpers/generateHtml')
const { createDirectoryTicketSalida, saveSignature } = require('../helpers/directory')


const createTicket = async (req, res) => {
    try {
        const conn = await pool.getConnection()
        const request = req.body

        let result = ''
        //PREGUNTAR SI VIENE ABIERTO O NO EL TICKET CON LA FIRMA DEL RESPONSABLE
        if (request.firmaSolicitante == '') {
            result = await conn.query('INSERT INTO ticket_salida (fecha_creacion, motivo, solicitante, cliente_trabajo, CC, area_operacion, observaciones, estado_ticket_idestado_ticket, usuario_idusuario) ' +
                'VALUES (?, ?, ?, ?, ?, ?, ?, 1, ?)', [request.fecha, request.descripcion, request.responsableRetira, request.solCodelco, request.ceco, request.area, request.observaciones, request.responsableEntrega])
        } else {
            result = await conn.query('INSERT INTO ticket_salida (fecha_creacion,fecha_cierre, motivo, solicitante, cliente_trabajo, CC, area_operacion, observaciones, estado_ticket_idestado_ticket, usuario_idusuario) ' +
                'VALUES (?, ?, ?, ?, ?, ?, ?, ?, 2, ?)', [request.fecha, request.fechaCierre, request.descripcion, request.responsableRetira, request.solCodelco, request.ceco, request.area, request.observaciones, request.responsableEntrega])
        }


        if (result.affectedRows == 1) {
            const lastIdTicketEntrada = convertBigintToInt(result.insertId)

            for (let i = 0; i < request.detalle.length; i++) {
                const result2 = await conn.query('INSERT INTO detalle_ticket_salida (cantidad, articulo_idarticulo, ticket_salida_idticket_salida, bodegas_idbodegas) ' +
                    'VALUES (?, ?, ?, ?)',
                    [request.detalle[i].cantidad * -1, request.detalle[i].idArticulo, lastIdTicketEntrada, request.detalle[i].bodega])

            }

            const result_user = await conn.query('SELECT idusuario AS id,idusuario AS value, nombre AS label,correo,usuario FROM usuario')

            conn.end()

            let nombreResponsableEntrega = result_user.map(function (responsable) {
                if (responsable.id === request.responsableEntrega) {
                    return responsable.label
                }
            })

            //SACANDO EL NOMBRE DEL BODEGUERO MEDIANTE EL ID
            nombreResponsableEntrega = nombreResponsableEntrega.filter(i => i)
            request.responsableEntrega = nombreResponsableEntrega


            try {
                //GENERAR DIRECTORIO DONDE SE GUARDARA EL PDF Y LA FIRMA DEL TICKET
            const responsePath = await createDirectoryTicketSalida(lastIdTicketEntrada)


            //GENERAR HTML A PARTIR DEL JSON
            const html = await jsonToHtmlValeSalida(request, lastIdTicketEntrada)

            //GUARDAR FIRMAS
            await saveSignature(request, responsePath, lastIdTicketEntrada)

            if (!request.firmaSolicitante == '') {
                //GENERACION DEL PDF
                await htmlToPDF(html, responsePath, lastIdTicketEntrada)
                //ENVIAR PDF POR CORREO

            }

            } catch (error) {
                conn.end()
                res.status(400).send('hubo un error ' + error)
            }
            







            res.status(200).json({
                idTicket: lastIdTicketEntrada
            })

        } else {
            conn.end()
            res.status(400).send('hubo un error ' + result)
        }







    } catch (error) {
        res.status(400).send('hubo un error ' + error)
    }
}

module.exports = {
    createTicket
}