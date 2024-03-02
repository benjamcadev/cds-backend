const pool = require('../db')

// OBTENER TODOS LOS MATERIALES
const getMateriales = async (req, res) => {
    res.json('obtener listado de todos los materiales')
}

// BUSCAR UN MATERIAL

const getMaterial = async (req, res) => {
    const { search_value } = req.body
    console.log(search_value)

    try {
        const result = await pool.query('SELECT * FROM material WHERE "Descripcion" LIKE UPPER(\'%\' || $1 || \'%\')', [search_value])

        if (result.rows.length === 0) { return res.status(404).json({ message: "Material no encontrado" }) }

        res.status(200).json(  result.rows)


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