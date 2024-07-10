const { Router } = require('express')
const { authRequired } = require('../middlewares/validateToken')

//IMPORTANDO FUNCIONES

const { createArticulo, deleteArticulo, updateArticulo, getFindArticulo, getListaArticulos } = require('../controllers/articulos.controller')





// CRUD ARTICULOS 

const router = Router()


//CREAR MATERIAL
router.post('/api/v1/materiales/create', createArticulo) // falta agregar auth

//LISTAR MATERIALES
router.get('/materiales/list', getListaArticulos) // falta agregar auth

//BUSCAR MATERIALES
router.post('/api/v1/materiales/find',authRequired, getFindArticulo)

//ACTUALIZAR MATERIAL
router.put('/api/v1/materiales/update', updateArticulo) // falta agregar auth

//ELIMINAR MATERIAL
router.delete('/api/v1/materiales/delete', deleteArticulo) // falta agregar auth

module.exports = router