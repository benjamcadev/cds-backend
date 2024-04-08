const { Router } = require('express')

//CONEXION A LA BD
const pool = require('../db')

const { createTicket, getTicket } = require('../controllers/ticketSalida.controller')

const router = Router()

//CREAR TICKET DE SALIDA
router.post('/ticket/salida/',createTicket)

//CONSULTAR TICKET DE SALIDA
router.get('/ticket/salida/:id',getTicket)


module.exports = router