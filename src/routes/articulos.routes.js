const { Router } = require('express')
const { authRequired } = require('../middlewares/validateToken')

//IMPORTANDO FUNCIONES
const { getListaArticulos, createArticulo, getFindArticulo, deleteArticulo, updateArticulo } = require('../controllers/articulos.controller')

const router = Router()

// CRUD ARTICULOS
//CREAR MATERIAL
router.post('/api/v1/materiales/create', createArticulo)

//LISTAR MATERIALES
router.get('/materiales/list', getListaArticulos)

//ACTUALIZAR MATERIAL
router.put('/api/v1/materiales/update', updateArticulo)

//ELIMINAR MATERIAL
router.delete('/api/v1/materiales/delete', deleteArticulo)

//BUSCAR MATERIALES
router.post('/api/v1/materiales/find', getFindArticulo)

module.exports = router