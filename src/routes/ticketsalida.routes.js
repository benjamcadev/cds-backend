const { Router } = require('express')

//CONEXION A LA BD
const pool = require('../db')

const { createTicket, getTicket, getSignature } = require('../controllers/ticketSalida.controller')

const router = Router()

//CREAR TICKET DE SALIDA
router.post('/ticket/salida/',createTicket)

//CONSULTAR TICKET DE SALIDA
router.get('/ticket/salida/:id',getTicket)

//CONSULTAR FIRMA, DEVUELVE EN IMAGEN PNG EN BASE64
router.get('/ticket/salida/signature/:id',getSignature)


module.exports = router