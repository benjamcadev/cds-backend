const { Router } = require('express')
const { authRequired } = require('../middlewares/validateToken')

const { getUsuarios, getTypesUsuarios } = require('../controllers/usuarios.controller')

const router = Router()

//OBTENER TIPOS DE USUARIO
router.get('/usuarios/types', getTypesUsuarios)

//LISTAR USUARIOS POR TIPO DE USUARIO
router.get('/usuarios/:id', authRequired, getUsuarios)



module.exports = router