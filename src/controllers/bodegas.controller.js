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
            'GROUP BY ubicacion_bodegas.id_ubicacion_bodegas', [numero_material])

            

        const result_salidas = await conn.query('SELECT detalle_ticket_salida.articulo_idarticulo, articulo.nombre as nombreArticulo, bodegas.nombre AS nombreBodega, detalle_ticket_salida.bodegas_idbodegas, SUM(detalle_ticket_salida.cantidad) as cantidad, ubicacion_bodegas.id_ubicacion_bodegas as ubicacion_id, ubicacion_bodegas.ubicacion as nombreUbicacion ' +
            'FROM detalle_ticket_salida ' +
            'INNER JOIN ubicacion_bodegas '+
            'ON ubicacion_bodegas.id_ubicacion_bodegas = detalle_ticket_salida.ubicacion_bodegas_id '+
            'INNER JOIN articulo ' +
            'ON articulo.idarticulo = detalle_ticket_salida.articulo_idarticulo ' +
            'INNER JOIN bodegas ' +
            'ON detalle_ticket_salida.bodegas_idbodegas = bodegas.idbodegas ' +
            'WHERE detalle_ticket_salida.articulo_idarticulo = ? AND estado = 1  ' +
            'GROUP BY ubicacion_bodegas.id_ubicacion_bodegas', [numero_material])

            // for (var i = 0; i < result_entradas.length; i++) {
            //     if (result_salidas[i].bodegas_idbodegas == result_entradas[i].bodegas_idbodegas) {
            //         result_entradas[i].cantidad =  Number(result_entradas[i].cantidad) + Number(result_salidas[i].cantidad)
            //     }

            // }

            // SABER LAS LONGITUDES DEL ARRAY MAS GRANDE Y MAS PEQUEÑO
            let array_grande = 0;
            let array_pequeno = 0;

            if (result_salidas.length > result_entradas.length) {
                array_grande = result_salidas.length;
                array_pequeno = result_entradas.length;
            }else {
                array_grande = result_entradas.length;
                array_pequeno = result_salidas.length;
            }

           for (let i = 0; i < array_grande; i++) {

                for (let j = 0; j < array_pequeno; j++) {
                    // PREGUNTAR QUE ARRAY ES MAS PEQUEÑO

                    if (result_salidas.length > result_entradas.length) {
                        
                        if (result_entradas[j].bodegas_idbodegas == result_salidas[i].bodegas_idbodegas) {
                            //RESTAR CANTIDADES
                            result_entradas[j].cantidad = Number(result_entradas[j].cantidad) + Number(result_salidas[i].cantidad)
                            
                        }
                    }else {
                        if (result_salidas[j].bodegas_idbodegas == result_entradas[i].bodegas_idbodegas) {
                            //RESTAR CANTIDADES
                            result_entradas[i].cantidad = Number(result_entradas[i].cantidad) + Number(result_salidas[j].cantidad)
                        }
                    }
                    
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

