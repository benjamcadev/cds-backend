const pool = require('../db')
const {toObject} = require('../helpers/convertToObject')

// OBTENER TODOS LOS MATERIALES
const getMateriales = async (req, res) => {
    res.json('obtener listado de todos los materiales')
}

// BUSCAR UN MATERIAL

const getMaterial = async (req, res) => {
    const { search_value } = req.body


    try {
        const conn = await pool.getConnection()

        const result_entrada = await conn.query('SELECT articulo.nombre, articulo.sap, articulo.codigo_interno, articulo.sku, SUM(detalle_ticket_entrada.cantidad) AS cantidad_entrada '+ 
        'FROM articulo INNER JOIN  detalle_ticket_entrada ON articulo.idarticulo = detalle_ticket_entrada.articulo_idarticulo '+
        'WHERE nombre LIKE \'%\' ? \'%\' OR sku LIKE  \'%\' ? \'%\'',[search_value, search_value])

        const result_salida = await conn.query('SELECT articulo.nombre, articulo.sap, articulo.codigo_interno, articulo.sku, SUM(detalle_ticket_salida.cantidad) AS cantidad_salida '+ 
        'FROM articulo INNER JOIN detalle_ticket_salida ON articulo.idarticulo = detalle_ticket_salida.articulo_idarticulo '+
        'WHERE nombre LIKE \'%\' ? \'%\' OR sku LIKE  \'%\' ? \'%\'',[search_value, search_value])

        console.log(result_salida)

        const result =  {
        nombre: result_entrada.nombre,
        sap: result_entrada.sap,
        codigo_interno: result_entrada.codigo_interno,
        sku: result_entrada.sku,
        cantidad: result_entrada.cantidad + result_salida.cantidad}

        console.log(result)

        if (result.length === 0) { conn.end(); return res.status(404).json({ message: "Material no encontrado" });   }

        conn.end();
        res.status(200).json(toObject(result))


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