const { Router } = require('express')
const { authRequired } = require('../middlewares/validateToken')

//IMPORTANDO FUNCIONES
const { getMateriales, getMaterial, createMaterial, deleteMaterial, updateMaterial } = require('../controllers/materiales.controller')

const router = Router()



//LISTAR MATERIALES
router.get('/materiales',authRequired, getMateriales)

//BUSCAR MATERIALES
router.post('/materiales/find',authRequired, getMaterial)


//CREAR MATERIAL
router.post('/materiales', authRequired, createMaterial)

//ELIMINAR MATERIAL
router.delete('/materiales',authRequired, deleteMaterial)

//ACTUALIZAR MATERIAL
router.put('/materiales', authRequired, updateMaterial)

module.exports = router