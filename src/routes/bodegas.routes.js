const { Router } = require('express')
const { authRequired } = require('../middlewares/validateToken')

const { getBodegaMaterial, getBodega } = require('../controllers/bodegas.controller')

const router = Router()

//LISTAR TODAS LAS BODEGAS
router.get('/bodegas/',authRequired, getBodega)

//BUSCAR BODEGAS QUE PERTENECE MATERIAL
router.get('/bodegas/find/:id',authRequired, getBodegaMaterial)




module.exports = router