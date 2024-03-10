const { Router } = require('express')

//CONEXION A LA BD
const pool = require('../db')

const { getBodegaMaterial } = require('../controllers/bodegas.controller')

const router = Router()

//BUSCAR BODEGAS QUE PERTENECE MATERIAL
router.get('/bodegas/find/:id',getBodegaMaterial)



module.exports = router