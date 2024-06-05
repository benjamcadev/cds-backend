const pool = require('../db')
const { convertBigintToInt } = require('../helpers/convertBigintToInt')

// OBTENER BODEGA DE UN MATERIAL
const getBodegaMaterial = async (req, res) => {
    const numero_material = req.params.id

    try {
        const conn = await pool.getConnection()

        const result_entradas = await conn.query('SELECT detalle_ticket_entrada.articulo_idarticulo, articulo.nombre as nombreArticulo, bodegas.nombre AS nombreBodega, detalle_ticket_entrada.bodegas_idbodegas, CAST(SUM(detalle_ticket_entrada.cantidad) AS SIGNED) as cantidad, ubicacion_bodegas.id_ubicacion_bodegas as ubicacion_id, ubicacion_bodegas.ubicacion as nombreUbicacion ' +
            'FROM detalle_ticket_entrada ' +
            'INNER JOIN ubicacion_bodegas '+
            'ON ubicacion_bodegas.id_ubicacion_bodegas = detalle_ticket_entrada.ubicacion_bodegas_id '+
            'INNER JOIN articulo ' +
            'ON articulo.idarticulo = detalle_ticket_entrada.articulo_idarticulo ' +
            'INNER JOIN bodegas ' +
            'ON detalle_ticket_entrada.bodegas_idbodegas = bodegas.idbodegas ' +
            'WHERE detalle_ticket_entrada.articulo_idarticulo = ? AND estado = 1  ' +
            'GROUP BY bodegas.idbodegas', [numero_material])

        const result_salidas = await conn.query('SELECT detalle_ticket_salida.articulo_idarticulo, articulo.nombre as nombreArticulo, bodegas.nombre AS nombreBodega, detalle_ticket_salida.bodegas_idbodegas, SUM(detalle_ticket_salida.cantidad) as cantidad, ubicacion_bodegas.id_ubicacion_bodegas as ubicacion_id, ubicacion_bodegas.ubicacion as nombreUbicacion ' +
            'FROM detalle_ticket_salida ' +
            'INNER JOIN ubicacion_bodegas '+
            'ON ubicacion_bodegas.id_ubicacion_bodegas = detalle_ticket_salida.ubicacion_bodegas_id '+
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
        res.status(400).send('hubo un error en getBodegaMaterial: ' + error)
    }
    //res.json('obtener bodega de un material')
}


const getBodega = async (req,res) => {

    try {
        const conn = await pool.getConnection()
        const result = await conn.query('SELECT * FROM bodegas')
        conn.end()
        res.status(200).json(result)
    } catch (error) {
        res.status(400).send('hubo un error getBodega:  ' + error)
    }
}

const getUbicacion = async (req,res) => {

    try {
        const conn = await pool.getConnection()
        const result = await conn.query('SELECT * FROM ubicacion_bodegas')
        conn.end()
        res.status(200).json(result)
    } catch (error) {
        res.status(400).send('hubo un error getUbicacion:  ' + error)
    }
}



module.exports = {
    getBodegaMaterial,
    getBodega,
    getUbicacion
}

