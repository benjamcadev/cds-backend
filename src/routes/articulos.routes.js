const { Router } = require('express')
const { authRequired } = require('../middlewares/validateToken')

//IMPORTANDO FUNCIONES
const { getMateriales, getMaterial, createMaterial, deleteMaterial, updateMaterial } = require('../controllers/materiales.controller')

const router = Router()


//LISTAR MATERIALES
router.get('/materiales', getMateriales)

//BUSCAR MATERIALES
router.post('/api/v1/materiales/find',authRequired, getMaterial)


//CREAR MATERIAL
router.post('/api/v1/materiales', createMaterial)

//ELIMINAR MATERIAL
router.delete('/api/v1/materiales',authRequired, deleteMaterial)

//ACTUALIZAR MATERIAL
router.put('/api/v1/materiales', authRequired, updateMaterial)

module.exports = router