const pool = require('../db')
const { convertBigintToInt } = require('../helpers/convertBigintToInt')

// OBTENER BODEGA DE UN MATERIAL
const getBodegaMaterial = async (req, res) => {
    const numero_material  = req.params.id

    try {
        const conn = await pool.getConnection()
        const result = await conn.query('SELECT detalle_ticket_entrada.articulo_idarticulo, articulo.nombre as nombreArticulo, bodegas.nombre AS nombreBodega, detalle_ticket_entrada.bodegas_idbodegas ' +
        'FROM detalle_ticket_entrada ' +
        'INNER JOIN articulo ' +
        'ON articulo.idarticulo = detalle_ticket_entrada.articulo_idarticulo '+
        'INNER JOIN bodegas ' + 
        'ON detalle_ticket_entrada.bodegas_idbodegas = bodegas.idbodegas ' +
        'WHERE detalle_ticket_entrada.articulo_idarticulo = ? AND estado = 1', [numero_material])

        conn.end();

        res.status(200).json(convertBigintToInt(result))

    } catch (error) {
        res.status(400).send('hubo un error' + error)
    }
    //res.json('obtener bodega de un material')
}





module.exports = {
    getBodegaMaterial
}

