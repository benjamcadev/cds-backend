const { Router } = require('express')

//CONEXION A LA BD
const pool = require('../db')

const { getBodegaMaterial, getBodega } = require('../controllers/bodegas.controller')

const router = Router()

//LISTAR TODAS LAS BODEGAS
router.get('/bodegas/',getBodega)

//BUSCAR BODEGAS QUE PERTENECE MATERIAL
router.get('/bodegas/find/:id',getBodegaMaterial)




module.exports = router