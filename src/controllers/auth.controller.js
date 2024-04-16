const pool = require('../db')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { convertBigintToInt } = require('../helpers/convertBigintToInt')

const register = async (req, res) => {

    const { nombre, correo, usuario, pass, tipo_usuario } = req.body

    try {
        const conn = await pool.getConnection()
        const result = await conn.query('SELECT * FROM usuario WHERE correo = ?', [correo])
        conn.end()

        if (result.length > 0) {
            //CORREO EXISTE
            res.status(400).json({
                message: 'Usuario ya esta registrado'
            })
        } else {
            //CORREO NO EXISTE, SE REGISTRA

            //ENCRIPTANDO PASS
            const passHash = await bcrypt.hash(pass, 10)

            //INSERTAMOS USUARIO
            const conn = await pool.getConnection()
            const resultNewUser = await conn.query(`INSERT INTO usuario (nombre, correo, usuario, pass, estado_usuario_idestado_usuario) 
            VALUES (?, ?, ?, ?, ?)`, [nombre, correo, usuario, passHash, tipo_usuario])
            conn.end()

            if (resultNewUser.affectedRows >= 1) {
                //CREAR TOKEN
                jwt.sign({
                    id: convertBigintToInt(resultNewUser.insertId)
                },
                    "secret123",
                    {
                        expiresIn: "1d"
                    },
                    (err, token) => {
                        if(err) console.log(err);
                        //GUARDAMOS EL TOKEN EN UNA COOKIE
                        res.cookie('token', token)
                        res.status(200).json({
                            message: 'Usuario creado exitosamente'
                         })
                    })
                
            } else {
                res.status(400).json({
                    message: 'No se pudo crear al usuario'
                })
            }


        }
    } catch (error) {
        res.send('Hubo un error al registrar usuario: ' + error)
    }

}

const login = (req, res) => { res.send('login') }

module.exports = {
    register,
    login
}