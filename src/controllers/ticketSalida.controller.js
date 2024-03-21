const pool = require('../db')
const { convertBigintToInt } = require('../helpers/convertBigintToInt')
const { htmlToPDF } = require('../helpers/generatePDF')

const createTicket = async(req,res) => {
    try {
        const conn = await pool.getConnection()
        const request = req.body

        let result = ''
        //PREGUNTAR SI VIENE ABIERTO O NO EL TICKET CON LA FIRMA DEL RESPONSABLE
        if (request.firmaSolicitante == '') {
            result = await conn.query('INSERT INTO ticket_salida (fecha_creacion, motivo, solicitante, cliente_trabajo, CC, area_operacion, observaciones, estado_ticket_idestado_ticket, usuario_idusuario) '+
            'VALUES (?, ?, ?, ?, ?, ?, ?, 1, ?)',[request.fecha, request.descripcion, request.responsableRetira, request.solCodelco, request.ceco, request.area,request.observaciones, request.responsableEntrega])
        }else{
            result = await conn.query('INSERT INTO ticket_salida (fecha_creacion,fecha_cierre, motivo, solicitante, cliente_trabajo, CC, area_operacion, observaciones, estado_ticket_idestado_ticket, usuario_idusuario) '+
            'VALUES (?, ?, ?, ?, ?, ?, ?, ?, 2, ?)',[request.fecha, request.fechaCierre, request.descripcion, request.responsableRetira, request.solCodelco, request.ceco, request.area,request.observaciones, request.responsableEntrega])
        }


        if (result.affectedRows == 1) {
            const lastIdTicketEntrada = convertBigintToInt(result.insertId) 

            for (let i = 0; i < request.detalle.length; i++) {
                const result2 = await conn.query('INSERT INTO detalle_ticket_salida (cantidad, articulo_idarticulo, ticket_salida_idticket_salida, bodegas_idbodegas) '+ 
                'VALUES (?, ?, ?, ?)',
                [request.detalle[i].cantidad * -1, request.detalle[i].idArticulo, lastIdTicketEntrada,  request.detalle[i].bodega])
                
            }
           
            conn.end()

            //INVOCAR GENERACION DEL PDF
            htmlToPDF()
            
            res.status(200).json({
                idTicket: lastIdTicketEntrada
            })

        }else{
            conn.end()
            res.status(400).send('hubo un error ' + error)
        }

       

      

       

    } catch (error) {
        res.status(400).send('hubo un error ' + error)
    }
}

module.exports = {
    createTicket
}