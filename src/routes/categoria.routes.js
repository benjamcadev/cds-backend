const { Router } = require('express')
const { getCategorias } = require('../controllers/categoria.controller');


const router = Router()
// Ruta para obtener todas las categorías
router.get('/api/v1/categorias', getCategorias);

module.exports = router;