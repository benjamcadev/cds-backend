const pool = require('../db')
const { convertBigintToInt } = require('../helpers/convertBigintToInt')

// OBTENER BODEGA DE UN MATERIAL
const getBodegaMaterial = async (req, res) => {
    const numero_material = req.params.id

    try {
        const conn = await pool.getConnection()

        const result_entradas = await conn.query('SELECT detalle_ticket_entrada.articulo_idarticulo, articulo.nombre as nombreArticulo, bodegas.nombre AS nombreBodega, detalle_ticket_entrada.bodegas_idbodegas, CAST(SUM(detalle_ticket_entrada.cantidad) AS SIGNED) as cantidad ' +
            'FROM detalle_ticket_entrada ' +
            'INNER JOIN articulo ' +
            'ON articulo.idarticulo = detalle_ticket_entrada.articulo_idarticulo ' +
            'INNER JOIN bodegas ' +
            'ON detalle_ticket_entrada.bodegas_idbodegas = bodegas.idbodegas ' +
            'WHERE detalle_ticket_entrada.articulo_idarticulo = ? AND estado = 1  ' +
            'GROUP BY bodegas.idbodegas', [numero_material])

        const result_salidas = await conn.query('SELECT detalle_ticket_salida.articulo_idarticulo, articulo.nombre as nombreArticulo, bodegas.nombre AS nombreBodega, detalle_ticket_salida.bodegas_idbodegas, SUM(detalle_ticket_salida.cantidad) as cantidad ' +
            'FROM detalle_ticket_salida ' +
            'INNER JOIN articulo ' +
            'ON articulo.idarticulo = detalle_ticket_salida.articulo_idarticulo ' +
            'INNER JOIN bodegas ' +
            'ON detalle_ticket_salida.bodegas_idbodegas = bodegas.idbodegas ' +
            'WHERE detalle_ticket_salida.articulo_idarticulo = ? AND estado = 1  ' +
            'GROUP BY bodegas.idbodegas', [numero_material])

            for (var i = 0; i < result_salidas.length; i++) {
                if (result_salidas[i].bodegas_idbodegas == result_entradas[i].bodegas_idbodegas) {
                    result_entradas[i].cantidad =  Number(result_entradas[i].cantidad) + Number(result_salidas[i].cantidad)
                }

            }

        conn.end();

        res.status(200).json(convertBigintToInt(result_entradas))

    } catch (error) {
        res.status(400).send('hubo un error' + error)
    }
    //res.json('obtener bodega de un material')
}





module.exports = {
    getBodegaMaterial
}

