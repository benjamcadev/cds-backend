const pool = require('../db')


const getUsuarios = async(req, res) => {
    const tipo_usuario = req.params.id

    try {
        const conn = await pool.getConnection()
        const result = await conn.query('SELECT idusuario AS id,idusuario AS value, nombre AS label,correo,usuario FROM usuario WHERE estado_usuario_idestado_usuario = ?', [tipo_usuario])
        conn.end()

        res.status(200).json(result)


    } catch (error) {
        conn.end()
        return res.status(400).send('hubo un error en getUsuarios: ' + error)
    }
}

const getTypesUsuarios = async(req, res) => {
   
    try {
        const conn = await pool.getConnection()
        const result = await conn.query('SELECT * FROM estado_usuario')
      
        conn.end()

        res.status(200).json(result)
    } catch (error) {
       
        return res.status(400).send('hubo un error en getTypesUsuarios: ' + error)
       
    }

}

module.exports = {
    getUsuarios,
    getTypesUsuarios
}