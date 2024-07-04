const pool = require('../db')
const { convertBigintToInt } = require('../helpers/convertBigintToInt')

// OBTENER TODOS LOS MATERIALES
const getMateriales = async (req, res) => {
   
    try {
          const conn = await pool.getConnection();
      
          const query = 'SELECT id, nombre, descripcion FROM materiales'; 
          const result = await conn.query(query); // Sin parámetros de búsqueda
      
          conn.release(); 
          res.status(200).json(result);
    } catch (error) {
        console.error('Error al obtener materiales:', error);
        res.status(500).send('Error interno del servidor'); 
    }
    
}

// BUSCAR UN MATERIAL

const getMaterial = async (req, res) => {
    const { search_value } = req.body


    try {
        const conn = await pool.getConnection()

        const result = await conn.query('SELECT articulo.idarticulo, articulo.nombre, articulo.sap, articulo.codigo_interno, articulo.sku, articulo.comentario, SUM(detalle_ticket_entrada.cantidad) AS cantidad ' +
            'FROM articulo left JOIN  detalle_ticket_entrada ON articulo.idarticulo = detalle_ticket_entrada.articulo_idarticulo ' +
            'WHERE nombre LIKE \'%\' ? \'%\' OR sku LIKE  \'%\' ? \'%\' OR sap  LIKE  \'%\' ? \'%\'' +
            'GROUP BY articulo.nombre ' +
            'UNION ' +
            'SELECT articulo.idarticulo,articulo.nombre, articulo.sap, articulo.codigo_interno, articulo.sku,articulo.comentario, SUM(detalle_ticket_salida.cantidad) AS cantidad ' +
            'FROM articulo RIGHT JOIN  detalle_ticket_salida ON articulo.idarticulo = detalle_ticket_salida.articulo_idarticulo ' +
            'WHERE nombre LIKE \'%\' ? \'%\' OR sku LIKE  \'%\' ? \'%\'  OR sap  LIKE  \'%\' ? \'%\'' +
            'GROUP BY articulo.nombre  LIMIT 0, 50 ', [search_value, search_value, search_value, search_value, search_value, search_value])


        let cantidades_positivas = []
        let cantidades_negativas = []



        for (var i = 0; i < result.length; i++) {
            if (result[i].cantidad >= 0) {
                cantidades_positivas.push({
                    id: Number(result[i].idarticulo),
                    Descripcion: result[i].nombre,
                    Codigo_SAP: result[i].sap,
                    Codigo_interno: result[i].codigo_interno,
                    SKU: result[i].sku,
                    Comentarios: result[i].comentario,
                    Stock: Number(result[i].cantidad)
                })

            }
            if (result[i].cantidad < 0) {
                cantidades_negativas.push({ id: Number(result[i].idarticulo), Stock: Number(result[i].cantidad) })
            }

        }

        

        var o = 0
        for (var j = 0; j < cantidades_positivas.length; j++) {
            if (cantidades_negativas.length > o) {
                if (cantidades_positivas[j].id == cantidades_negativas[o].id) {
                    cantidades_positivas[j].Stock = cantidades_positivas[j].Stock + cantidades_negativas[o].Stock
                    o++
                   
                }
            }
        }

        const result_final = cantidades_positivas;

        if (result_final.length === 0) { conn.end(); return res.status(404).json({ message: "Material no encontrado" }); }

        conn.end();
        res.status(200).json(convertBigintToInt(result_final))


    } catch (error) {
        res.status(400).send('hubo un error' + error)
    }


}



// CREAR UN MATERIAL

const createMaterial = async (req, res) => {
    res.send('creando un material')
}

// ELIMINAR UN MATERIAL

const deleteMaterial = async (req, res) => {
    res.send('eliminando un material')
}

// ACTUALIZAR UN MATERIAL

const updateMaterial = async (req, res) => {
    res.send('actualizando un material')
}

module.exports = {
    getMateriales,
    getMaterial,
    createMaterial,
    deleteMaterial,
    updateMaterial
}