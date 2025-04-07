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

const getMaterialSalidaCategoria = async (req, res) => {
  try {
    const conn = await pool.getConnection()

    const result = await conn.query(" SELECT SUM(bodega_tica.detalle_ticket_salida.cantidad) * -1 AS cantidad, " +
      "bodega_tica.categoria.nombre AS categoria, DATE_FORMAT(bodega_tica.ticket_salida.fecha_creacion, '%Y-%m') as mes " +
      "FROM bodega_tica.ticket_salida " +
      "INNER JOIN bodega_tica.detalle_ticket_salida " +
      "ON bodega_tica.ticket_salida.idticket_salida = bodega_tica.detalle_ticket_salida.ticket_salida_idticket_salida " +
      "INNER JOIN bodega_tica.articulo " +
      "ON bodega_tica.articulo.idarticulo = bodega_tica.detalle_ticket_salida.articulo_idarticulo " +
      "INNER JOIN bodega_tica.categoria " +
      "ON bodega_tica.categoria.idcategoria = bodega_tica.articulo.categoria_idcategoria " +
      "WHERE bodega_tica.ticket_salida.fecha_creacion >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH) " +
      "GROUP BY mes, categoria " +
      "ORDER BY mes, categoria")


    conn.release();
    conn.end();
    res.status(200).json(result);
  } catch (error) {
    console.log(error)
  }
}

module.exports = {
  getCategorias,
  getMaterialSalidaCategoria
};