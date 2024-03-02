const { Router } = require('express')

//CONEXION A LA BD
const pool = require('../db')

//IMPORTANDO FUNCIONES
const { getMateriales, getMaterial, createMaterial, deleteMaterial, updateMaterial } = require('../controllers/materiales.controller')

const router = Router()



//LISTAR MATERIALES
router.get('/materiales', getMateriales)

//BUSCAR MATERIALES
router.post('/materiales/find', getMaterial)

//CREAR MATERIAL
router.post('/materiales', createMaterial)

//ELIMINAR MATERIAL
router.delete('/materiales', deleteMaterial)

//ACTUALIZAR MATERIAL
router.put('/materiales', updateMaterial)

module.exports = router