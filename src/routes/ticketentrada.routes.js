const { Router } = require('express')

//CONEXION A LA BD
const pool = require('../db')

const { createTicket } = require('../controllers/ticketEntrada.controller')

const router = Router()


//GUARDAR UN TICKET
router.post('/ticket/entrada', createTicket)



module.exports = router
