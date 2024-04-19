const { Router } = require('express')
const { authRequired } = require('../middlewares/validateToken')

const { getUsuarios } = require('../controllers/usuarios.controller')

const router = Router()

//LISTAR USUARIOS POR TIPO DE USUARIO
router.get('/usuarios/:id', authRequired, getUsuarios)

module.exports = router