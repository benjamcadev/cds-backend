const pool = require('../db')
const { convertBigintToInt } = require('../helpers/convertBigintToInt')

// OBTENER TODOS LOS ARTICULOS
const getMateriales = async (req, res) => {
    // Obtener los parámetros de paginación de la consulta (query params en la URL (ejemplo: /materiales?page=1&limit=10))
    // Si no se envían los parámetros, se asignan valores por defecto (page=1, limit=10)
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit; // Calcular el offset para la consulta SQL

    //se declara fuera de los bloques try, catch y finally para que esté disponible en todos ellos.
    let conn; // Declarar la variable conn con let para poder reasignarla en el bloque finally

    try {
        // Obtener una conexión a la base de datos desde el pool de conexiones
        conn = await pool.getConnection();

        // Verificar si se obtuvo la conexión a la base de datos
        if (!conn) {
            return res.status(500).json({ message: 'Error al conectar con la base de datos' });
        }

        // Verificar si la tabla 'articulo' existe en la base de datos
        const verificarTabla = await conn.query('SHOW TABLES LIKE "articulo"');
        if (verificarTabla.length === 0) {
            return res.status(404).json({ message: 'La tabla articulo no existe' });
        }
        
        // Consultar el número total de registros en la tabla 'articulo'
        const totalRegistrosQuery = 'SELECT COUNT(*) AS total FROM articulo';
        const totalResult = await conn.query(totalRegistrosQuery);
        const totalArticulos = Number(totalResult[0].total); // Convertir el valor BigInt a Number
        
        // Consultar los registros de la tabla 'articulo' con paginación
        const query = 'SELECT * FROM articulo LIMIT ? OFFSET ?';
        const result = await conn.query(query, [limit, offset]);

        // Convertir valores BigInt a String durante la serialización
        const articulosConvertidos = result.map(articulo => {
            return {
                ...articulo,
                idarticulo: articulo.idarticulo ? articulo.idarticulo.toString() : null,
                sku: articulo.sku ? articulo.sku.toString() : null,
            };
        });

        // Preparar la respuesta con los datos obtenidos con información de paginación y los artículos convertidos
        const respuesta = {
            totalArticulos: totalArticulos, // Número total de artículos en la tabla
            currentPage: page, // Página actual solicitada
            articulosEnPagina: articulosConvertidos.length, // Número de artículos en la página actual
            totalPages: Math.ceil(totalArticulos / limit), // Número total de páginas
            articulos: articulosConvertidos, // Lista de artículos en la página actual
        };

        // Enviar la respuesta con los datos obtenidos al cliente
        res.status(200).json(respuesta);
        //console.log('Materiales obtenidos correctamente');

    } catch (error) {
        // Manejo de errores: imprimir el error en la consola y enviar una respuesta de error al cliente
        console.error('Error al obtener materiales:', error);
        res.status(500).send('Error interno del servidor');

         // Asegurarse de que la conexión siempre se cierre en caso de error
         if (conn) {
            conn.end();
            console.log('Conexión cerrada')
        }
        
    } finally {
        // Asegurarse de que la conexión siempre se cierre en caso de error
        if (conn) {
            conn.end();
            console.log('Conexión cerrada')
        }
    }
};

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

// CREAR UN Articulo en la base de datos
const createMaterial = async (req, res) => {
    const { nombre, sap, codigo_interno, sku, comentario, categoria_idcategoria } = req.body;

    if (!nombre || !sap || !codigo_interno || !sku || !categoria_idcategoria) {
        return res.status(400).json({ message: 'Todos los campos son obligatorios' });
    }

    try {
        const conn = await pool.getConnection();

        if (!conn) {
            return res.status(500).json({ message: 'Error al conectar con la base de datos' });
        }

        const query = `
            INSERT INTO articulo (nombre, sap, codigo_interno, sku, comentario, categoria_idcategoria)
            VALUES (?, ?, ?, ?, ?, ?)
        `;
        const values = [nombre, sap, codigo_interno, sku, comentario, categoria_idcategoria];

        const result = await conn.query(query, values);

        conn.release();

        if (result.affectedRows === 1) {
            res.status(201).json({ message: 'Material creado exitosamente' });
            //console.log('Material creado exitosamente')
        } else {
            res.status(400).json({ message: 'No se pudo crear el material' });
        }
    } catch (error) {
        console.error('Error al crear material:', error);
        res.status(500).send('Error interno del servidor');
    }
};

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