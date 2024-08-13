const { Router } = require('express')
const { authRequired } = require('../middlewares/validateToken')

//IMPORTANDO FUNCIONES

const { getListaArticulos, createArticulo, getFindArticulo, deleteArticulo, updateArticulo } = require('../controllers/articulos.controller')
const { getImageBase64 } = require('../controllers/articulos.controller')


// CRUD ARTICULOS

const router = Router()


//CREAR MATERIAL
router.post('/api/v1/materiales/create', createArticulo)

// Ruta para obtener la imagen del artículo
//router.get('/api/v1/imagenes/:idarticulo/:imageName', getArticleImage);

// Consultar imagen de un artículo devuelve en imagen png en base64
router.get('/api/v1/materiales/imagen/:id', getImageBase64)

//LISTAR MATERIALES
router.get('/api/v1/materiales/list', getListaArticulos)

//ACTUALIZAR MATERIAL
router.put('/api/v1/materiales/update', updateArticulo)

//ELIMINAR MATERIAL
router.delete('/api/v1/materiales/delete', deleteArticulo)

//BUSCAR MATERIALES
router.post('/api/v1/materiales/find', getFindArticulo)


module.exports = router