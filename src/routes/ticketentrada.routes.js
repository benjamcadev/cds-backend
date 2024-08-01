const express = require('express');
const router = express.Router();
const { createTicket, getTipoTicket, getTicketEntrada, getSignatureEntrada } = require('../controllers/ticketEntrada.controller')

//GUARDAR UN TICKET
router.post ('/api/v1/ticket/entrada', createTicket  )
//CONSULTAR TICKET DE SALIDA
router.get  ('/api/v1/ticket/entrada/:id', getTicketEntrada )

router.get  ('/api/v1/tipo_ticket', getTipoTicket )

router.get('/api/v1/ticket/entrada/signature/:id', getSignatureEntrada)

module.exports = router
