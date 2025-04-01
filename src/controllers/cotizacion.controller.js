
const pool = require('../db')
const { createDirectoryCotizacion } = require('../helpers/directory')
const { convertBigintToInt } = require('../helpers/convertBigintToInt')
const { convertirABase64 } = require('../helpers/convertFileToBase64')
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

const getListCotizaciones = async (req, res) => {
    const conn = await pool.getConnection()

    try {
        const request = req.body
        let result = ''

        result = await conn.query('SELECT ROW_NUMBER() OVER () AS id, cotizacion.descripcion, cotizacion.fecha, usuario.nombre AS usuario, cotizacion.path_excel ' +
            'FROM cotizacion INNER JOIN usuario WHERE cotizacion.usuario_idusuario = usuario.idusuario')

        // Convertir valores BigInt a String durante la serialización
        const cotizacionesConvertidos = result.map(cotizacion => {
            return {
                ...cotizacion,
                id: cotizacion.id ? cotizacion.id.toString() : null,
                descripcion: cotizacion.descripcion ? cotizacion.descripcion.toString() : null,
                fecha: cotizacion.fecha,
                usuario: cotizacion.usuario ? cotizacion.usuario.toString() : null,
                path_excel: cotizacion.path_excel,
            };
        });

        const claves = Object.keys(cotizacionesConvertidos); 

        console.log(claves)

        // CONVERTIR EXCEL A BASE64

        const resultados = await Promise.all(claves.map(async (clave) => {

            let excelBase64 = await convertirABase64(cotizacionesConvertidos[clave].path_excel);
      
         cotizacionesConvertidos[clave] = excelBase64;

            
        }))

        // Enviar la respuesta con los datos obtenidos al cliente
        await res.status(200).json(resultados);



    } catch (error) {
        res.status(500).send('Error al consultar cotizacion ' + error);
    } finally {
        // Asegurarse de que la conexión siempre se cierre en caso de error
        if (conn) {
            conn.release();
            conn.end();
            //console.log('Conexión cerrada')
        }
    }
}

module.exports = {
    createCotizacion,
    getListCotizaciones
}