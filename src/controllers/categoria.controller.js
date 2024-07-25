const pool = require('../db')

// Obtener todas las categorías
const getCategorias = async (req, res) => {
  try {
    const conn = await pool.getConnection();
    const categorias = await conn.query('SELECT * FROM categoria');
    conn.end();
    res.status(200).json(categorias);
  } catch (error) {
    res.status(400).send('Error al obtener las categorías: ' + error);
  }
};

module.exports = {
  getCategorias,
};