const pool = require('../db')
const { convertBigintToInt } = require('../helpers/convertBigintToInt')
const { htmlToPDF } = require('../helpers/generatePDF')
const { jsonToHtmlValeSalida } = require('../helpers/generateHtml')
const { createDirectoryTicketSalida, saveSignature, saveSignaturePendiente } = require('../helpers/directory')
const { sendEmailTicketSalida, sendEmailTicketPendiente } = require('../helpers/emails')
const fs = require('fs');
const dayjs = require('dayjs');

const createTicket = async (req, res) => {
    try {
        const conn = await pool.getConnection()
        const request = req.body

        let result = ''
        //PREGUNTAR SI VIENE ABIERTO O NO EL TICKET CON LA FIRMA DEL RESPONSABLE
        if (request.firmaSolicitante == '') {
            result = await conn.query('INSERT INTO ticket_salida (fecha_creacion, motivo, solicitante, cliente_trabajo, CC, ticketTrabajo, observaciones, estado_ticket_idestado_ticket, usuario_idusuario) ' +
                'VALUES (?, ?, ?, ?, ?, ?, ?, 1, ?)', [request.fecha, request.descripcion, request.responsableRetira, request.solCodelco, request.ceco, request.ticketTrabajo, request.observaciones, request.responsableEntrega])
        } else {
            result = await conn.query('INSERT INTO ticket_salida (fecha_creacion,fecha_cierre, motivo, solicitante, cliente_trabajo, CC, ticketTrabajo, observaciones, estado_ticket_idestado_ticket, usuario_idusuario) ' +
                'VALUES (?, ?, ?, ?, ?, ?, ?, ?, 2, ?)', [request.fecha, request.fechaCierre, request.descripcion, request.responsableRetira, request.solCodelco, request.ceco, request.ticketTrabajo, request.observaciones, request.responsableEntrega])
        }


        if (result.affectedRows == 1) {
            const lastIdTicketSalida = convertBigintToInt(result.insertId)

            for (let i = 0; i < request.detalle.length; i++) {
                const result2 = await conn.query('INSERT INTO detalle_ticket_salida (cantidad, articulo_idarticulo, ticket_salida_idticket_salida, bodegas_idbodegas, ubicacion_bodegas_id) ' +
                    'VALUES (?, ?, ?, ?, ?)',
                    [request.detalle[i].cantidad * -1, request.detalle[i].idArticulo, lastIdTicketSalida, request.detalle[i].bodega, request.detalle[i].ubicacion])

            }

            //CONSULTANDO NOMBRE DE BODEGUEROS
            const result_user = await conn.query('SELECT idusuario AS id,idusuario AS value, nombre AS label,correo,usuario FROM usuario')

            let nombreResponsableEntrega = result_user.map(function (responsable) {
                if (responsable.id === request.responsableEntrega) {
                    return responsable.label
                }
            })

            //SACANDO EL NOMBRE DEL BODEGUERO MEDIANTE EL ID
            nombreResponsableEntrega = nombreResponsableEntrega.filter(i => i)
            request.responsableEntrega = nombreResponsableEntrega

            //SACANDO NOMBRES DE BODEGAS
            const result_bodegas = await conn.query('SELECT idbodegas, nombre AS label_bodega FROM bodegas WHERE estado = 1')

            //RECORRER EL DETALLE DE DEL REQUEST PARA REMPLAZAR EL NUMERO DE LA BODEGA POR SU NOMBRE
            for (let i = 0; i < request.detalle.length; i++) {
                for (let o = 0; o < result_bodegas.length; o++) {

                    if (request.detalle[i].bodega == result_bodegas[o].idbodegas) {
                        request.detalle[i].bodega = result_bodegas[o].label_bodega
                    }
                }
            }

            //SACANDO NOMBRES DE UBICACION BODEGAS
            const result_ubicacion_bodegas = await conn.query('SELECT id_ubicacion_bodegas, ubicacion AS label_ubicacion_bodega FROM ubicacion_bodegas')

            //RECORRER EL DETALLE DE DEL REQUEST PARA REMPLAZAR EL NUMERO DE LA UBICACION BODEGA POR SU NOMBRE
            for (let i = 0; i < request.detalle.length; i++) {
                for (let o = 0; o < result_ubicacion_bodegas.length; o++) {

                    if (request.detalle[i].ubicacion == result_ubicacion_bodegas[o].id_ubicacion_bodegas) {
                        request.detalle[i].ubicacion = result_ubicacion_bodegas[o].label_ubicacion_bodega
                    }
                }
            }

            try {
                //GENERAR DIRECTORIO DONDE SE GUARDARA EL PDF Y LA FIRMA DEL TICKET
                const responsePath = await createDirectoryTicketSalida(lastIdTicketSalida)

                //GENERAR HTML A PARTIR DEL JSON
                const html = await jsonToHtmlValeSalida(request, lastIdTicketSalida)

                //GUARDAR FIRMAS
                let pathSignature = await saveSignature(request, responsePath, lastIdTicketSalida)

                //UPDATEAR PATH DE FIRMAS
                result = await conn.query('UPDATE ticket_salida SET signature_path_entrega="' + pathSignature.entrega + '" WHERE  idticket_salida = ' + lastIdTicketSalida)


                if (request.firmaSolicitante == '') {
                    //ENVIAR CORREO DE FIRMA PENDIENTE
                    console.log("Enviar correo de ticket abierto !!!")

                    await sendEmailTicketPendiente(responsePath, lastIdTicketSalida, request)

                    conn.end()

                    res.status(200).json({
                        idTicket: lastIdTicketSalida
                    })
                } else {
                    //GENERACION DEL PDF
                    await htmlToPDF(html, responsePath, lastIdTicketSalida)

                    //GUARDAR PDF EN BASE DE DATOS
                    let path_pdf = responsePath + '/ticket_salida_' + lastIdTicketSalida + '.pdf';
                    result = await conn.query('UPDATE ticket_salida SET pdf_path="' + path_pdf + '" WHERE  idticket_salida = ' + lastIdTicketSalida)
                    
                   
                    //ENVIAR PDF POR CORREO
                    await sendEmailTicketSalida(responsePath, lastIdTicketSalida, request)

                    //UPDATEAR FIRMA RETIRA
                    result = await conn.query('UPDATE ticket_salida SET signature_path_retira="' + pathSignature.retira + '" WHERE  idticket_salida = ' + lastIdTicketSalida)
                    conn.end()
                    res.status(200).json({
                        idTicket: lastIdTicketSalida
                    })
                }

            } catch (error) {
                conn.end()
                res.status(400).send('hubo un error ' + error)
            }
        } else {
            conn.end()
            res.status(400).send('hubo un error ' + result)
        }


    } catch (error) {
        res.status(400).send('hubo un error ' + error)
    }
}


const getTicket = async (req, res) => {
    const id_ticket = req.params.id
    try {

        const conn = await pool.getConnection()
        //QUERY RESCATA DATOS DEL TICKET ENTRADA
        let result_ticket = await conn.query(`SELECT ticket_salida.idticket_salida, ticket_salida.fecha_creacion, ticket_salida.motivo,
        ticket_salida.fecha_cierre, ticket_salida.solicitante, ticket_salida.cliente_trabajo,
        ticket_salida.CC, ticket_salida.ticketTrabajo, ticket_salida.observaciones, ticket_salida.signature_path_retira,
        ticket_salida.signature_path_entrega, ticket_salida.estado_ticket_idestado_ticket, ticket_salida.usuario_idusuario,
        usuario.correo AS responsableRetiraCorreo 
        FROM ticket_salida INNER JOIN usuario
        WHERE idticket_salida = ${id_ticket} AND ticket_salida.solicitante = usuario.nombre`)

        console.log(result_ticket)
        //QUERY RESCATA EL DETALLE DEL TICKET DE ENTRADA
        let result_ticket_detalle = await conn.query(`SELECT ROW_NUMBER() OVER (ORDER BY articulo.nombre) AS item, detalle_ticket_salida.bodegas_idbodegas AS bodega, detalle_ticket_salida.ubicacion_bodegas_id AS ubicacion, (detalle_ticket_salida.cantidad) * -1 as cantidad, 
        articulo.nombre AS descripcion,articulo.idarticulo AS id, articulo.unidad_medida AS unidad,
        articulo.idarticulo AS idArticulo
        FROM detalle_ticket_salida 
        INNER JOIN articulo
        ON detalle_ticket_salida.articulo_idarticulo = articulo.idarticulo
        WHERE ticket_salida_idticket_salida = ${id_ticket}
        GROUP BY articulo.nombre`)

        var fecha_creacion = result_ticket[0].fecha_creacion.toISOString().substring(0, 19).replace("T", " ")
        result_ticket[0].fecha_creacion = fecha_creacion;



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

const getSignature = async (req, res) => {
    const id_ticket = req.params.id
    try {
        const conn = await pool.getConnection()
        const result = await conn.query(`SELECT signature_path_retira, signature_path_entrega FROM ticket_salida WHERE idticket_salida = ${id_ticket}`)
        conn.end()

        if (result.length == 0) {
            return res.status(400).json({
                message: 'No existen firmas para ticket consultado',
                title: 'Error'
            });
        }


        //convertir a base64
        const base64_entrega = 'data:image/png;base64,' + fs.readFileSync(result[0].signature_path_entrega, { encoding: 'base64' });
        let base64_retira = '';
        if (result[0].signature_path_retira) {
            base64_retira = 'data:image/png;base64,' + fs.readFileSync(result[0].signature_path_retira, { encoding: 'base64' });
        }




        const result_final = {
            base64_entrega: base64_entrega,
            base64_retira: base64_retira
        }
        res.status(200).json(result_final)
    } catch (error) {
        res.status(400).send('hubo un error en getSignature: ' + error)
    }
}

const closeTicket = async (req, res) => {
    try {
        const conn = await pool.getConnection()
        const request = req.body

        let result = ''

        result = await conn.query('UPDATE ticket_salida SET fecha_cierre = ? , estado_ticket_idestado_ticket = ?  WHERE idticket_salida=?', [dayjs().format('YYYY-MM-DD HH:mm:ss'), 2, request.idTicketSalida])

        if (result.affectedRows == 1) {

            const lastIdTicketSalida = convertBigintToInt(request.idTicketSalida)



            //CONSULTANDO NOMBRE DE BODEGUEROS
            const result_user = await conn.query('SELECT idusuario AS id,idusuario AS value, nombre AS label,correo,usuario FROM usuario')

            let nombreResponsableEntrega = result_user.map(function (responsable) {
                if (responsable.id === request.responsableEntrega) {
                    return responsable.label
                }
            })

            //SACANDO EL NOMBRE DEL BODEGUERO MEDIANTE EL ID
            nombreResponsableEntrega = nombreResponsableEntrega.filter(i => i)
            request.responsableEntrega = nombreResponsableEntrega

            //SACANDO NOMBRES DE BODEGAS
            const result_bodegas = await conn.query('SELECT idbodegas, nombre AS label_bodega FROM bodegas WHERE estado = 1')

            //RECORRER EL DETALLE DE DEL REQUEST PARA REMPLAZAR EL NUMERO DE LA BODEGA POR SU NOMBRE
            for (let i = 0; i < request.detalle.length; i++) {
                for (let o = 0; o < result_bodegas.length; o++) {

                    if (request.detalle[i].bodega == result_bodegas[o].idbodegas) {
                        request.detalle[i].bodega = result_bodegas[o].label_bodega
                    }
                }
            }

            //SACANDO NOMBRES DE UBICACION BODEGAS
            const result_ubicacion_bodegas = await conn.query('SELECT id_ubicacion_bodegas, ubicacion AS label_ubicacion_bodega FROM ubicacion_bodegas')

            //RECORRER EL DETALLE DE DEL REQUEST PARA REMPLAZAR EL NUMERO DE LA UBICACION BODEGA POR SU NOMBRE
            for (let i = 0; i < request.detalle.length; i++) {
                for (let o = 0; o < result_ubicacion_bodegas.length; o++) {

                    if (request.detalle[i].ubicacion == result_ubicacion_bodegas[o].id_ubicacion_bodegas) {
                        request.detalle[i].ubicacion = result_ubicacion_bodegas[o].label_ubicacion_bodega
                    }
                }
            }



            try {
                //GENERAR DIRECTORIO DONDE SE GUARDARA EL PDF Y LA FIRMA DEL TICKET
                const responsePath = await createDirectoryTicketSalida(lastIdTicketSalida)


                //GENERAR HTML A PARTIR DEL JSON
                const html = await jsonToHtmlValeSalida(request, lastIdTicketSalida)


                //GUARDAR FIRMAS
                let pathSignature = await saveSignaturePendiente(request, responsePath, lastIdTicketSalida)

                //GENERACION DEL PDF
                await htmlToPDF(html, responsePath, lastIdTicketSalida)
                //ENVIAR PDF POR CORREO
                await sendEmailTicketSalida(responsePath, lastIdTicketSalida, request)

                //UPDATEAR FIRMA RETIRA
                result = await conn.query('UPDATE ticket_salida SET signature_path_retira="' + pathSignature.retira + '" WHERE  idticket_salida = ' + lastIdTicketSalida)


                conn.end()
                res.status(200).json({
                    idTicket: lastIdTicketSalida
                })

            } catch (error) {
                conn.end()
                res.status(400).send('hubo un error ' + error)

            }
        }

    } catch (error) {
        conn.end()
        res.status(400).send('hubo un error ' + error)
    }
}

const getListValesSalida = async (req, res) => {
    const conn = await pool.getConnection()

    try {
        const request = req.body
        let result = ''

        result = await conn.query('')
        
    } catch (error) {
        
    }
}

module.exports = {
    createTicket,
    getTicket,
    getSignature,
    closeTicket,
    getListValesSalida
}