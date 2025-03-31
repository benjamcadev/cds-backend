
const pool = require('../db')
const { createDirectoryCotizacion } = require('../helpers/directory')
const { convertBigintToInt } = require('../helpers/convertBigintToInt')
const { jsonToExcelCotizacion } = require('../helpers/generateExcel')


const createCotizacion = async (req, res) => {
    const conn = await pool.getConnection()
    try {
        
        const request = req.body



        let result = '';

        result = await conn.query('INSERT INTO cotizacion (fecha, descripcion, ceco, observaciones, usuario_idusuario)' +
            'VALUES(?, ?, ?, ?, ?)', [request.fecha, request.descripcion, request.ceco, request.observaciones, request.usuario_idusuario])


        if (result.affectedRows == 1) {
            const lastIdCotizacion = convertBigintToInt(result.insertId)

            //GENERAR DIRECTORIO DONDE SE GUARDARA EL EXCEL
            const responsePath = await createDirectoryCotizacion(lastIdCotizacion)

            //CREAR EXCEL Y DEVOLVER EN BASE64
            const responseExcel = await jsonToExcelCotizacion(responsePath, request, lastIdCotizacion)

            //UPDATEAR PATH DE EXCEL
            result = await conn.query('UPDATE cotizacion SET path_excel="' + responseExcel.pathExcel + '" WHERE  id_cotizacion = ' + lastIdCotizacion)


            conn.end()
            res.status(200).json({
                idCotizacion: lastIdCotizacion,
                base64Excel: responseExcel.base64Excel
            })


        } else {
            conn.end()
            res.status(400).send('hubo un error ' + result)
        }



    } catch (error) {
        conn.end()
        res.status(400).send('hubo un error ' + error)
    }
}

module.exports = {
    createCotizacion
}