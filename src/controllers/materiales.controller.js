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

        const result = await conn.query('SELECT * FROM articulo WHERE nombre LIKE \'%\' ? \'%\' OR sku LIKE  \'%\' ? \'%\'',[search_value, search_value])

        if (result.length === 0) { return res.status(404).json({ message: "Material no encontrado" }) }

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