const { Router } = require('express')
const { authRequired } = require('../middlewares/validateToken')



const { createTicket, getTicket, getSignature, closeTicket, getListValesSalida } = require('../controllers/ticketSalida.controller')

const router = Router()

//CREAR TICKET DE SALIDA
router.post('/api/v1/ticket/salida/', authRequired, createTicket)

//CONSULTAR TICKET DE SALIDA
router.get('/api/v1/ticket/salida/:id',authRequired ,getTicket)

//CONSULTAR FIRMA, DEVUELVE EN IMAGEN PNG EN BASE64
router.get('/api/v1/ticket/salida/signature/:id',authRequired, getSignature)

//CERRAR TICKET DE SALIDA
router.post('/api/v1/ticket/salida/close', authRequired, closeTicket)

//LISTAR TICKETS
router.post('/api/v1/ticket/salida/list', authRequired, getListValesSalida)


module.exports = router