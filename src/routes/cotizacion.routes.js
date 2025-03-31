const { Router } = require('express')
const { authRequired } = require('../middlewares/validateToken')

const { createCotizacion } = require('../controllers/cotizacion.controller')

const router = Router()

//EMITIR COTIZACION
router.post('/api/v1/cotizacion/', authRequired, createCotizacion)


module.exports = router