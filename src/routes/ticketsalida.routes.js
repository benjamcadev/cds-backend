const { Router } = require('express')

//CONEXION A LA BD
const pool = require('../db')

const { createTicket } = require('../controllers/ticketSalida.controller')

const router = Router()

//CREAR TICKET DE SALIDA
router.post('/ticket/salida/',createTicket)


module.exports = router