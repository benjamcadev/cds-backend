const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const pool = require('../db')

const { convertBigintToInt } = require('../helpers/convertBigintToInt')


// OBTENER TODOS LOS ARTICULOS
const getListaArticulos = async (req, res) => {

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
            conn.end();
            return res.status(404).json({ message: 'La tabla articulo no existe' });
        }
        
        // Consultar el número total de registros en la tabla 'articulo'

        const totalRegistrosQuery = 'SELECT COUNT(*) AS total FROM articulo WHERE activo = TRUE';
        const totalResult = await conn.query(totalRegistrosQuery);
        const totalArticulos = Number(totalResult[0].total); // Convertir el valor BigInt a Number
        
        // Consultar los registros de la tabla 'articulo' con paginación

        //const query = 'SELECT * FROM articulo  WHERE activo = TRUE LIMIT ? OFFSET ?';
        const query = `SELECT articulo.idarticulo, articulo.nombre AS Descripcion, articulo.sap AS Codigo_SAP, 
        articulo.codigo_interno AS Codigo_interno, articulo.sku AS SKU, articulo.comentario AS Comentarios, 
        articulo.unidad_medida, articulo.categoria_idcategoria, articulo.precio, articulo.imagen_url, 
        articulo.activo, IFNULL(SUM(detalle_ticket_entrada.cantidad), 0) AS Stock 
        FROM articulo 
        LEFT JOIN detalle_ticket_entrada ON articulo.idarticulo = detalle_ticket_entrada.articulo_idarticulo 
        WHERE articulo.activo = TRUE 
        GROUP BY articulo.idarticulo 
        LIMIT ? OFFSET ?`;
        const result = await conn.query(query, [limit, offset]);

        

        
        // Convertir valores BigInt a String durante la serialización
        const articulosConvertidos = result.map(articulo => {
            return {
                ...articulo,
                idarticulo: articulo.idarticulo ? articulo.idarticulo.toString() : null,
                SKU: articulo.sku ? articulo.sku.toString() : null,
                categoria_idcategoria: articulo.categoria_idcategoria ? articulo.categoria_idcategoria.toString() : null,
                Stock: articulo.Stock ? articulo.Stock.toString() : null,
            };
        });

        // Preparar la respuesta con los datos obtenidos con información de paginación y los artículos convertidos
        const respuesta = {
            total_Articulos: totalArticulos, // Número total de artículos en la tabla

            Pagina_Actual: page, // Página actual solicitada
            articulosEnPagina: articulosConvertidos.length, // Número de artículos en la página actual
            total_Paginas: Math.ceil(totalArticulos / limit), // Número total de páginas
            
            articulos: articulosConvertidos, // Lista de artículos en la página actual
        };

        // Enviar la respuesta con los datos obtenidos al cliente
        res.status(200).json(respuesta);
        //console.log('Materiales obtenidos correctamente');

    } catch (error) {
        // Manejo de errores: imprimir el error en la consola y enviar una respuesta de error al cliente
        //console.error('Error al obtener materiales:', error);
        res.status(500).send('Error interno del servidor');

    } finally {
        // Asegurarse de que la conexión siempre se cierre en caso de error
        if (conn) {
            conn.release();
            conn.end();
            //console.log('Conexión cerrada')
        }
    }
};

// BUSCAR UN MATERIAL
const getFindArticulo = async (req, res) => {
    
    const { search_value } = req.body

    try {
        const conn = await pool.getConnection()

        const result = await conn.query('SELECT articulo.idarticulo, articulo.nombre, articulo.sap, articulo.codigo_interno, articulo.sku, articulo.unidad_medida, articulo.precio, articulo.comentario, SUM(detalle_ticket_entrada.cantidad) AS cantidad ' +
            'FROM articulo left JOIN  detalle_ticket_entrada ON articulo.idarticulo = detalle_ticket_entrada.articulo_idarticulo ' +
            'WHERE activo = \'1\' AND  nombre LIKE \'%\' ? \'%\' OR sku LIKE  \'%\' ? \'%\' OR sap  LIKE  \'%\' ? \'%\' ' +
            'GROUP BY articulo.nombre ' +
            'UNION ' +
            'SELECT articulo.idarticulo,articulo.nombre, articulo.sap, articulo.codigo_interno, articulo.sku, articulo.unidad_medida, articulo.precio, articulo.comentario, SUM(detalle_ticket_salida.cantidad) AS cantidad ' +
            'FROM articulo RIGHT JOIN  detalle_ticket_salida ON articulo.idarticulo = detalle_ticket_salida.articulo_idarticulo ' +
            'WHERE activo = \'1\' AND nombre LIKE \'%\' ? \'%\' OR sku LIKE  \'%\' ? \'%\'  OR sap  LIKE  \'%\' ? \'%\' ' +
            'GROUP BY articulo.nombre  LIMIT 0, 50 ', [search_value, search_value, search_value, search_value, search_value, search_value, search_value, search_value, search_value, search_value, search_value, search_value])


        let cantidades_positivas = []
        let cantidades_negativas = []


        for (var i = 0; i < result.length; i++) {
            if (result[i].cantidad >= 0) {
                cantidades_positivas.push({
                    id: Number(result[i].idarticulo),
                    Descripcion: result[i].nombre,
                    Codigo_SAP: result[i].sap,
                    Codigo_interno: result[i].codigo_interno,
                    unidad_medida: result[i].unidad_medida,
                    precio: Number(result[i].precio),
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


// Verificar permisos de usuario para crear un material y actualizar un material

const verificarPermisos = async (usuarioId) => {

   

    // Se declara como let conn para poder reasignarla en el bloque finally si es necesario cerrar la conexión a la base de datos
    let conn;

    // Verificar si el usuario tiene permisos para crear un material
    try {
        // Obtener una conexión a la base de datos desde el pool de conexiones
        conn = await pool.getConnection();
        
        // Consulta SQL para obtener el estado del usuario basado en su ID
        const query = 'SELECT estado_usuario_idestado_usuario FROM usuario WHERE idusuario = ?';

        // Ejecutar la consulta con el usuarioId como parámetro
        const result = await conn.query(query, [usuarioId]);

        

        // Verificar si el resultado de la consulta está vacío o no se encontró el usuario
        if (!result || result.length === 0) {
            //console.error('No se encontró el usuario o el resultado está vacío.');
            return false;
        }

        // Obtener el estado del usuario del resultado de la consulta
        const estadoUsuario = result[0].estado_usuario_idestado_usuario;

        // return true si el estado del usuario es 1 (ACTIVO_ADMIN) y false en caso contrario (no tiene permisos), 2: INACTIVO , 3: USUARIO_RETIRO_MATERIALES, 4: ACTIVO_SIN_PERMISOS
        return estadoUsuario === 1; // 1: (ACTIVO_ADMIN)

    } catch (error) {
        // Manejo de errores: imprimir el error en la consola y retornar false
        //console.error('Error al verificar permisos:', error);
        return false;

    } finally {
        // Asegurarse de que la conexión siempre se libere en caso de error
        if (conn) {
            conn.release();
            conn.end();
        }
    }
};


// Crear directorios necesarios para el artículo

const createDirectoryForArticle = async (idArticulo) => {
    let dir_public = path.join(__dirname, '../../public');
    let dir_uploads = path.join(__dirname, '../../public/uploads');
    let dir_imagenesArticulos = path.join(__dirname, '../../public/uploads/imagenes_articulos');
    let dir_articulo = path.join(__dirname, `../../public/uploads/imagenes_articulos/${idArticulo}`);

    try {
        if (!fs.existsSync(dir_public)){
            fs.mkdirSync(dir_public, { recursive: true });
        }

        if (!fs.existsSync(dir_uploads)){
            fs.mkdirSync(dir_uploads, { recursive: true });
        }

        if (!fs.existsSync(dir_imagenesArticulos)){
            fs.mkdirSync(dir_imagenesArticulos, { recursive: true });
        }

        if (!fs.existsSync(dir_articulo)){
            fs.mkdirSync(dir_articulo, { recursive: true });
        }

        return dir_articulo;
    } catch (error) {
        throw new Error('Error al crear los directorios para el artículo');
    }
};

// Guardar imagen del artículo
const saveArticleImage = async (base64Image, idarticulo) => {
    try {
        const base64Data = base64Image.replace(/^data:image\/\w+;base64,/, '');
        const imageBuffer = Buffer.from(base64Data, 'base64');
        const imageName = `imagen_${idarticulo}.png`;
        const dirPath = await createDirectoryForArticle(idarticulo);
        const imagePath = path.join(dirPath, imageName);
        //console.log(`Guardando imagen en: ${imagePath}`);
        fs.writeFileSync(imagePath, imageBuffer);

        // Devuelve la ruta relativa que será accesible a través de tu servidor Express
        return imagePath
    } catch (error) {
        //console.error('Error al guardar la imagen del artículo:', error);
        throw new Error('Error al guardar la imagen del artículo');
    }
};


// CREAR UN Articulo en la base de datos
const createArticulo = async (req, res) => {
    let conn;

    // Obtener los datos del Articulo desde el cuerpo de la petición
    const { nombre, sap, sku, unidad_medida, comentario, categoria_idcategoria, precio, imagen_base64 } = req.body;
    const usuarioId = req.headers.usuarioid; // Me aseguro de que el usuarioId esté disponible en los headers de la petición

    // Verificar si todos los campos obligatorios están presentes
    if (!nombre || !unidad_medida  || precio === undefined || !imagen_base64) {
        return res.status(400).json({ message: 'Todos los campos son obligatorios' });
    }

    // Asignar valores por defecto si no se proporcionan
    const sapValue = sap || 0;
    const skuValue = sku || 0;
    const comentarioValue = comentario || '';
    const precioFloat = parseFloat(precio);
    const categoria_idcategoriaValue = categoria_idcategoria || 0;

    // Convertir el precio a un número de punto flotante y verificar si es válido
    if (isNaN(precioFloat)) {
        return res.status(400).json({ message: 'El precio debe ser un número válido' });
    }

    try {
        // Verificar permisos del usuario para crear Articulos por su idusuario
        const tienePermisos = await verificarPermisos(usuarioId);


        if (!tienePermisos) {
            //console.log('No tiene permisos para crear un articulo idusuario:', usuarioId);
            return res.status(403).json({ message: 'No tiene permisos para crear un articulo' });
        }

        // Obtener una conexión a la base de datos
        conn = await pool.getConnection();

        // Verificar si se obtuvo la conexión a la base de datos
        if (!conn) {
            return res.status(500).json({ message: 'Error al conectar con la base de datos' });
        }

        // Insertar el artículo sin la URL de la imagen para obtener el idArticulo
        const queryInsert = `
            INSERT INTO articulo (nombre, sap, sku, unidad_medida, comentario, categoria_idcategoria, precio)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `;
        const valuesInsert = [nombre, sapValue, skuValue, unidad_medida, comentarioValue, categoria_idcategoriaValue, precioFloat];
        const resultInsert = await conn.query(queryInsert, valuesInsert);

        // Verificar si el articulo fue creado exitosamente en la base de datos
        if (resultInsert.affectedRows === 1) {
            const idarticulo = resultInsert.insertId;

            // Guardar la imagen en el servidor
            const imagenUrl = await saveArticleImage(imagen_base64, idarticulo);

            // Actualizar la URL de la imagen en la base de datos
            const queryUpdateImage = `
                UPDATE articulo
                SET imagen_url = ?
                WHERE idarticulo = ?
            `;
            await conn.query(queryUpdateImage, [imagenUrl, idarticulo]);

            // Generar el codigo_interno basado en las características del artículo
            const codigoInterno = `${idarticulo.toString().slice(-2)}${nombre.slice(0, 2).toUpperCase()}${categoria_idcategoria}`;

            // Consulta SQL para actualizar el articulo con el codigo_interno generado
            const queryUpdate = `
                UPDATE articulo
                SET codigo_interno = ?
                WHERE idarticulo = ?
            `;
            const valuesUpdate = [codigoInterno, idarticulo];
            const resultUpdate = await conn.query(queryUpdate, valuesUpdate);

            // Liberar la conexión a la base de datos
            conn.release();
            conn.end();

            // Verificar si el codigo_interno fue actualizado exitosamente en la base de datos y enviar una respuesta de éxito
            if (resultUpdate.affectedRows === 1) {
                res.status(201).json({ message: 'Articulo creado exitosamente', codigo_interno: codigoInterno });
                //console.log('Articulo creado exitosamente');
            } else {
                res.status(400).json({ message: 'No se pudo actualizar el codigo_interno del Articulo' });
            }
        } else {
            res.status(400).json({ message: 'No se pudo crear el Articulo' });
        }
    } catch (error) {
        // Manejo de errores: imprimir el error en la consola y enviar una respuesta de error al cliente
        //console.error('Error al crear Articulo:', error);
        res.status(500).send('Error interno del servidor');

        // Asegurarse de que la conexión siempre se cierre en caso de error o éxito
        if (conn) {
            //console.log('Conexión cerrada');
            conn.end();
        }
    } finally {
        // Asegurarse de que la conexión siempre se cierre en caso de error o éxito
        if (conn) {
            //console.log('Conexión cerrada');
            conn.end();
        }
    }
};


// ACTUALIZAR UN MATERIAL
const updateArticulo = async (req, res) => {
    let conn;

    const { id, Descripcion, Codigo_SAP, SKU, unidad_medida, comentario, categoria_idcategoria, precio, imagen_base64 } = req.body;
    const usuarioId = req.headers.usuarioid;

    if ( !Descripcion || !unidad_medida) {
        return res.status(400).json({ message: 'Todos los campos son obligatorios' });
    }

    const sapValue = Codigo_SAP || 0;
    const skuValue = SKU || 0;
    const comentarioValue = comentario || '';
    const precioFloat = parseFloat(precio);
    const categoria_idcategoriaValue = categoria_idcategoria || 1;

    if (isNaN(precioFloat)) {
        return res.status(400).json({ message: 'El precio debe ser un número válido' });
    }

    try {
        const tienePermisos = await verificarPermisos(usuarioId);
        if (!tienePermisos) {
            return res.status(403).json({ message: 'No tiene permisos para actualizar un artículo' });
        }

        conn = await pool.getConnection();
        if (!conn) {
            return res.status(500).json({ message: 'Error al conectar con la base de datos' });
        }

        let imagen_url = null;
        if (imagen_base64) {
            imagen_url = await saveArticleImage(imagen_base64, id);
        }

        const codigo_interno = `${id.toString().slice(-2)}${Descripcion.slice(0, 2).toUpperCase()}${categoria_idcategoria}`;

        const query = `
            UPDATE articulo
            SET nombre = ?, sap = ?, codigo_interno = ?, sku = ?, unidad_medida = ?, comentario = ?, categoria_idcategoria = ?, precio = ?, imagen_url = COALESCE(?, imagen_url)
            WHERE idarticulo = ?
        `;
        const values = [Descripcion, sapValue, codigo_interno, skuValue, unidad_medida, comentarioValue, categoria_idcategoriaValue, precioFloat, imagen_url, id];
        const result = await conn.query(query, values);

        conn.release();
        conn.end();

        if (result.affectedRows === 1) {
            res.status(200).json({ message: 'Artículo actualizado exitosamente', codigo_interno });
        } else {
            
            res.status(400).json({ message: 'No se pudo actualizar el artículo' });
        }

    } catch (error) {
        //console.error('Error al actualizar artículo:', error);
        res.status(500).send('Error interno del servidor');

        if (conn) {
            //console.log('Conexión cerrada');
            conn.end();
        }
    } finally {
        if (conn) {
            //console.log('Conexión cerrada');
            conn.end();
        }
    }
};

// OBTENER IMAGEN DE UN ARTICULO
const getImageBase64 = async (req, res) => {

    const idarticulo = req.params.id;

    try {
        const conn = await pool.getConnection();
        const result = await conn.query('SELECT imagen_url FROM articulo WHERE idarticulo = ?', [idarticulo]);
        conn.release();
        conn.end();

        if (result.length === 0) {
            return res.status(404).json({ 
                message: 'No existe imagen para el artículo' 
            });
        }
        //console.log(result);

        const imagePath = result[0].imagen_url;
        if (!fs.existsSync(imagePath)) {
            return res.status(404).json({ 
                message: 'El archivo de imagen no existe en el servidor' 
            });
        }

        const imageBase64 = 'data:image/png;base64,' + fs.readFileSync(imagePath, { encoding: 'base64' });

        res.status(200).json({ base64: imageBase64 });
    } catch (error) {
        res.status(400).send('hubo un error en getImageBase64: ' + error)
    }
};

// ELIMINAR UN ARTICULO (marcar como inactivo)
const deleteArticulo = async (req, res) => {

    // Declarar la variable conn con let para poder reasignarla en el bloque finally
    let conn;

    // Obtener el id del artículo a eliminar desde el cuerpo de la petición
    const { idarticulo } = req.body;

    // Obtener el id del usuario desde los headers de la petición
    const usuarioId = req.headers.usuarioid;

    // Verificar si el id del artículo está presente en la petición
    if (!idarticulo) {
        return res.status(400).json({ message: 'El id del articulo es obligatorio' });
    }

    try {
        // Verificar permisos del usuario para eliminar un artículo
        const tienePermisos = await verificarPermisos(usuarioId);
        if (!tienePermisos) {
            return res.status(403).json({ message: 'No tiene permisos para eliminar un Articulo' });
        }

        // Obtener una conexión a la base de datos
        conn = await pool.getConnection();
        if (!conn) {
            return res.status(500).json({ message: 'Error al conectar con la base de datos' });
        }

        // Consulta SQL para marcar el artículo como inactivo
        const query = 'UPDATE articulo SET activo = FALSE WHERE idarticulo = ?';
        const result = await conn.query(query, [idarticulo]);

        // Liberar la conexión a la base de datos
        conn.release();
        conn.end();

        // Verificar si el artículo fue marcado como inactivo exitosamente
        if (result.affectedRows === 1) {
            res.status(200).json({ message: 'Articulo eliminado exitosamente' });
            //console.log('Articulo eliminado exitosamente');
        } else {
            res.status(400).json({ message: 'No se pudo eliminar el Articulo' });
        }

    } catch (error) {
        // Manejo de errores: imprimir el error en la consola y enviar una respuesta de error al cliente
        //console.error('Error al eliminar Articulo:', error);
        res.status(500).send('Error interno del servidor');
    } finally {
        // Asegurarse de que la conexión siempre se cierre en caso de error o éxito
        if (conn) {
            //console.log('Conexión cerrada');
            conn.end();
        }
    }
};

// CRUD: Create, Read, Update, Delete
module.exports = {
    createArticulo,
    getListaArticulos,
    updateArticulo,
    deleteArticulo,
    getFindArticulo,
    getImageBase64

}