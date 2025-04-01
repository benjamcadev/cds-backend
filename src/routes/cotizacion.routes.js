const { Router } = require('express')
const { authRequired } = require('../middlewares/validateToken')

const { createCotizacion, getListCotizaciones } = require('../controllers/cotizacion.controller')

const router = Router()

//EMITIR COTIZACION
router.post('/api/v1/cotizacion/', authRequired, createCotizacion)

//LISTAR COTIZACIONES
router.post('/api/v1/cotizacion/list', authRequired, getListCotizaciones)


module.exports = router