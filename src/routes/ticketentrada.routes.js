const express = require('express');
const router = express.Router();

const { authRequired } = require('../middlewares/validateToken')

const { createTicket, getTipoTicket, getTicketEntrada, getSignatureEntrada, getListValesEntrada, getValeEntrada, getTotalValeEntradaMensual } = require('../controllers/ticketEntrada.controller')

//GUARDAR UN TICKET
router.post ('/api/v1/ticket/entrada', createTicket  )
//CONSULTAR TICKET DE SALIDA
router.get  ('/api/v1/ticket/entrada/:id', getTicketEntrada )

router.get  ('/api/v1/tipo_ticket', getTipoTicket )

router.get('/api/v1/ticket/entrada/signature/:id', getSignatureEntrada)

//LISTAR TICKETS
router.post('/api/v1/ticket/entrada/list', authRequired, getListValesEntrada)

//TRAER EN BASE64 EL PDF SOLICITADO
router.post('/api/v1/ticket/entrada/get', getValeEntrada)

//TRAER CANTIDAD DE VALES ENTRADA DEL MES ACTUAL
router.get('/api/v1/ticket/entrada-total', getTotalValeEntradaMensual)


module.exports = router
