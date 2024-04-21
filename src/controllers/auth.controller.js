const pool = require('../db')
const bcrypt = require('bcryptjs')
const { createAccessToken } = require("../helpers/jwt")
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


            if (resultNewUser.affectedRows >= 1) {
                //CREAR TOKEN
                const token = await createAccessToken({ id: convertBigintToInt(resultNewUser.insertId) })
                
                const resultUser = await conn.query('SELECT * FROM usuario WHERE idusuario = ?', [resultNewUser.insertId])


                //GUARDAMOS EL TOKEN EN UNA COOKIE
                res.cookie('token', token)
                res.status(200).json({
                    message: 'Usuario creado exitosamente',
                    id: resultUser[0].idusuario,
                    nombre: resultUser[0].nombre,
                    correo: resultUser[0].correo,
                    usuario: resultUser[0].usuario
                })

                conn.end()

            } else {
                conn.end()
                res.status(500).json({
                    message: 'No se pudo crear al usuario'
                })
            }

            conn.end()


        }
    } catch (error) {
        res.status(500).json({
            message: 'Hubo un error al registrar usuario: ' + error
        })
    }

}

const login = async (req, res) => {

    const { correo, pass } = req.body

    try {
        const conn = await pool.getConnection()
        const resultUser = await conn.query('SELECT * FROM usuario WHERE correo = ?', [correo])
        conn.end()

        if (resultUser.length == 0) {
            //USUARIO NO EXISTE
           return res.status(400).json({
                message: 'Usuario no esta registrado.'
            })
        } else {
            //USUARIO EXISTE

            //COMPARANDO PASS
            const passMatch = await bcrypt.compare(pass, resultUser[0].pass)

            if (!passMatch) {  
               return res.status(400).json({
                    message: 'Contraseña incorrecta.'
                })
            }

             //CREAR TOKEN
             const token = await createAccessToken({ id: convertBigintToInt(resultUser[0].idusuario) })

             console.log(token)

           //GUARDAMOS EL TOKEN EN UNA COOKIE
           res.cookie('token', token)
           res.status(200).json({
               message: 'Usuario logeado exitosamente',
               id: resultUser[0].idusuario,
               nombre: resultUser[0].nombre,
               correo: resultUser[0].correo,
               usuario: resultUser[0].usuario
           })



        }
    } catch (error) {
        res.status(500).json({
            message: 'Hubo un error al logear usuario: ' + error
        })
    }
}

const logout = async (req, res) => {

    res.cookie('token', "", {
        expires: new Date(0)
    })
    res.status(200).json({
        message: 'Usuario cerro sesion existosamente'
    })
}

module.exports = {
    register,
    login,
    logout
}