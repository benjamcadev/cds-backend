const pool = require('../db')

const createTicket = async (req, res) => {


    try {
        const conn = await pool.getConnection()
        const request = req.body

        const response = conn.query('INSERT INTO ticket_entrada (`fecha`, `usuario_idusuario`, `estado_ticket_idestado_ticket`) '+
        'VALUES (?, 1, 1)',[request.fecha])

        res.send(request)

    } catch (error) {
        res.status(400).send('hubo un error' + error)
    }
}


module.exports = {
    createTicket
}