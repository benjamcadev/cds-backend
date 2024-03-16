const pool = require('../db')

const getUsuarios = async(req, res) => {
    const tipo_usuario = req.params.id

    try {
        const conn = await pool.getConnection()
        const result = await conn.query('SELECT idusuario AS id,idusuario AS value, nombre AS label,correo,usuario FROM usuario WHERE estado_usuario_idestado_usuario = ?', [tipo_usuario])
        conn.end()

        res.status(200).json(result)


    } catch (error) {
        res.status(400).send('hubo un error en getUsuarios: ' + error)
    }
}

module.exports = {
getUsuarios
}