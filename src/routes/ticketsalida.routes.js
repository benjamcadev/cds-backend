const { Router } = require('express')
const { authRequired } = require('../middlewares/validateToken')



const { createTicket, getTicket, getSignature } = require('../controllers/ticketSalida.controller')

const router = Router()

//CREAR TICKET DE SALIDA
router.post('/ticket/salida/', authRequired, createTicket)

//CONSULTAR TICKET DE SALIDA
router.get('/ticket/salida/:id',authRequired ,getTicket)

//CONSULTAR FIRMA, DEVUELVE EN IMAGEN PNG EN BASE64
router.get('/ticket/salida/signature/:id',authRequired,getSignature)


module.exports = router