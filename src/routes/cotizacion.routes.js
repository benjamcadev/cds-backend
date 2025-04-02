const { Router } = require('express')
const { authRequired } = require('../middlewares/validateToken')

const { createCotizacion, getListCotizaciones, getExcelCotizacion } = require('../controllers/cotizacion.controller')

const router = Router()

//EMITIR COTIZACION
router.post('/api/v1/cotizacion/', authRequired, createCotizacion)

//LISTAR COTIZACIONES
router.post('/api/v1/cotizacion/list', authRequired, getListCotizaciones)

//TRAER EN BASE64 EL EXCEL SOLICITADO
router.post('/api/v1/cotizacion/get', getExcelCotizacion)


module.exports = router