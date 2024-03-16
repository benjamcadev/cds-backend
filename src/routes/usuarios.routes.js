const { Router } = require('express')

//CONEXION A LA BD
const pool = require('../db')

const { getUsuarios } = require('../controllers/usuarios.controller')

const router = Router()

//LISTAR USUARIOS POR TIPO DE USUARIO
router.get('/usuarios/:id',getUsuarios)

module.exports = router