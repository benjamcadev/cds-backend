const { Router } = require('express')
const { getCategorias, getMaterialSalidaCategoria } = require('../controllers/categoria.controller');


const router = Router()
// Ruta para obtener todas las categorías
router.get('/api/v1/categorias', getCategorias);

//obtener series data para grafico de dashboard
router.get('/api/v1/categorias/getChartData', getMaterialSalidaCategoria);

module.exports = router;