const pool = require('../db')
const { convertBigintToInt } = require('../helpers/convertBigintToInt')
const { htmlToPDF } = require('../helpers/generatePDF')
const { jsonToHtmlValeSalida } = require('../helpers/generateHtml')
const { createDirectoryTicketSalida, saveSignature } = require('../helpers/directory')
const { sendEmailTicketSalida } = require('../helpers/emails')
const fs = require('fs');

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
            const lastIdTicketSalida = convertBigintToInt(result.insertId)

            for (let i = 0; i < request.detalle.length; i++) {
                const result2 = await conn.query('INSERT INTO detalle_ticket_salida (cantidad, articulo_idarticulo, ticket_salida_idticket_salida, bodegas_idbodegas) ' +
                    'VALUES (?, ?, ?, ?)',
                    [request.detalle[i].cantidad * -1, request.detalle[i].idArticulo, lastIdTicketSalida, request.detalle[i].bodega])

            }

            const result_user = await conn.query('SELECT idusuario AS id,idusuario AS value, nombre AS label,correo,usuario FROM usuario')



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
                const responsePath = await createDirectoryTicketSalida(lastIdTicketSalida)


                //GENERAR HTML A PARTIR DEL JSON
                const html = await jsonToHtmlValeSalida(request, lastIdTicketSalida)

                //GUARDAR FIRMAS
                let pathSignature = await saveSignature(request, responsePath, lastIdTicketSalida)


                //UPDATEAR PATH DE FIRMAS
                result = await conn.query('UPDATE ticket_salida SET signature_path_entrega="' + pathSignature.entrega + '" WHERE  idticket_salida = ' + lastIdTicketSalida)


                if (request.firmaSolicitante == '') {
                    //ENVIAR CORREO DE FIRMA PENDIENTE

                    conn.end()

                    res.status(200).json({
                        idTicket: lastIdTicketSalida
                    })
                } else {
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
       let result_ticket = await conn.query(`SELECT * FROM ticket_salida WHERE idticket_salida = ${id_ticket}`)
        //QUERY RESCATA EL DETALLE DEL TICKET DE ENTRADA
       let result_ticket_detalle = await conn.query(`SELECT * FROM detalle_ticket_salida WHERE ticket_salida_idticket_salida = ${id_ticket}`)

       conn.end()
        if (result_ticket.length == 0) {
            return res.status(400).json({
                message: 'No existe datos para ticket consultado',
                title: 'Error'
             });
        }
      
       result_final = {...result_ticket[0], detalle: result_ticket_detalle}
      
       
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

        console.log(result)
        //convertir a base64
        const base64_entrega = 'data:image/png;base64,' + fs.readFileSync(result[0].signature_path_entrega, {encoding: 'base64'});

        let base64_retira = ''
        if (result.signature_path_retira != null || result.signature_path_retira != '') {
         base64_retira = 'data:image/png;base64,' + fs.readFileSync(result[0].signature_path_retira, {encoding: 'base64'});
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

module.exports = {
    createTicket,
    getTicket,
    getSignature
}