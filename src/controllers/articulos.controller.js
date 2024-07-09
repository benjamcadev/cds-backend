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
            conn.release();
            return res.status(404).json({ message: 'La tabla articulo no existe' });
        }
        
        // Consultar el número total de registros en la tabla 'articulo'
        const totalRegistrosQuery = 'SELECT COUNT(*) AS total FROM articulo WHERE activo = TRUE';
        const totalResult = await conn.query(totalRegistrosQuery);
        const totalArticulos = Number(totalResult[0].total); // Convertir el valor BigInt a Number
        
        // Consultar los registros de la tabla 'articulo' con paginación
        const query = 'SELECT * FROM articulo WHERE activo = TRUE LIMIT ? OFFSET ?';
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
            total_Articulos: totalArticulos, // Número total de artículos en la tabla
            Pagina_Actual: page, // Página actual solicitada
            articulosEnPagina: articulosConvertidos.length, // Número de artículos en la página actual
            total_Paginas: Math.ceil(totalArticulos / limit), // Número total de páginas
            articulos: articulosConvertidos, // Lista de artículos en la página actual
        };

        // Enviar la respuesta con los datos obtenidos al cliente
        res.status(200).json(respuesta);
        console.log('Materiales obtenidos correctamente');

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
const getFindArticulo = async (req, res) => {
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
            console.error('No se encontró el usuario o el resultado está vacío.');
            return false;
        }

        // Obtener el estado del usuario del resultado de la consulta
        const estadoUsuario = result[0].estado_usuario_idestado_usuario;

        // return true si el estado del usuario es 1 (ACTIVO_ADMIN) y false en caso contrario (no tiene permisos), 2: INACTIVO , 3: USUARIO_RETIRO_MATERIALES, 4: ACTIVO_SIN_PERMISOS
        return estadoUsuario === 1; // 1: (ACTIVO_ADMIN)

    } catch (error) {
        // Manejo de errores: imprimir el error en la consola y retornar false
        console.error('Error al verificar permisos:', error);
        return false;

    } finally {
        // Asegurarse de que la conexión siempre se libere en caso de error
        if (conn) conn.release();
    }
};

// CREAR UN Articulo en la base de datos
const createArticulo = async (req, res) => {

    let conn;

    // Obtener los datos del Articulo desde el cuerpo de la petición
    const { nombre, sap, sku, unidad_medida, comentario, categoria_idcategoria, precio, imagen_base64 } = req.body;
    const usuarioId = req.headers.usuarioid; // Me aseguro de que el usuarioId esté disponible en los headers de la petición

    // Verificar si todos los campos obligatorios están presentes
    if (!nombre || !sap || !sku || !unidad_medida || !categoria_idcategoria || precio === undefined || !imagen_base64) {
        return res.status(400).json({ message: 'Todos los campos son obligatorios' });
    }

    // Convertir el precio a un número de punto flotante y verificar si es válido
    const precioFloat = parseFloat(precio);
    if (isNaN(precioFloat)) {
        return res.status(400).json({ message: 'El precio debe ser un número válido' });
    }

    try {
        // Verificar permisos del usuario para crear Articulos por su idusuario
        const tienePermisos = await verificarPermisos(usuarioId);
        if (!tienePermisos) {
            console.log('No tiene permisos para crear un articulo idusuario:', usuarioId);
            return res.status(403).json({ message: 'No tiene permisos para crear un articulo' });
        }

        // Obtener una conexión a la base de datos
        conn = await pool.getConnection();

        // Verificar si se obtuvo la conexión a la base de datos
        if (!conn) {
            return res.status(500).json({ message: 'Error al conectar con la base de datos' });
        }

        // Eliminar el prefijo de datos de la cadena base64 de la imagen
        const base64Data = imagen_base64.replace(/^data:image\/\w+;base64,/, '');

        // Convertir la cadena base64 a un buffer de imagen
        const imagenBuffer = Buffer.from(base64Data, 'base64');
        const imagenNombre = `imagen_${nombre}.png`;
        const imagenRuta = path.join(__dirname, `../../public/uploads/imagenes_articulos/${imagenNombre}`);

        // Compruebo de que el directorio existe y si no lo creo
        if (!fs.existsSync(path.join(__dirname, '../../public/uploads/imagenes_articulos'))) {
            fs.mkdirSync(path.join(__dirname, '../../public/uploads/imagenes_articulos'), { recursive: true });
        }

        // Guardar la imagen en el servidor
        fs.writeFileSync(imagenRuta, imagenBuffer);

        // URL de la imagen almacenada
        const imagen_url = `/public/uploads/imagenes_articulos/${imagenNombre}`;

        // Consulta SQL para insertar un nuevo Articulo en la base de datos (sin codigo_interno)
        const queryInsert = `
            INSERT INTO articulo (nombre, sap, sku, unidad_medida, comentario, categoria_idcategoria, precio, imagen_url)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `;

        // Valores a insertar en la tabla Articulo (Asegúrate de incluir todos los campos)
        const valuesInsert = [nombre, sap, sku, unidad_medida, comentario, categoria_idcategoria, precioFloat, imagen_url];

        // Ejecutar la consulta SQL e insertar un nuevo Articulo en la base de datos
        const resultInsert = await conn.query(queryInsert, valuesInsert);

        // Verificar si el articulo fue creado exitosamente en la base de datos
        if (resultInsert.affectedRows === 1) {
            // Obtener el id del articulo creado
            const idarticulo = resultInsert.insertId;

            // Generar el codigo_interno basado en las características del artículo
            const codigoInterno = `${idarticulo.toString().slice(-2)}${nombre.slice(0, 2).toUpperCase()}${categoria_idcategoria}`;

            // Consulta SQL para actualizar el articulo con el codigo_interno generado
            const queryUpdate = `
                UPDATE articulo
                SET codigo_interno = ?
                WHERE idarticulo = ?
            `;
            const valuesUpdate = [codigoInterno, idarticulo];

            // Ejecutar la consulta SQL para actualizar el codigo_interno del Articulo en la base de datos
            const resultUpdate = await conn.query(queryUpdate, valuesUpdate);

            // Liberar la conexión a la base de datos
            conn.release();

            // Verificar si el codigo_interno fue actualizado exitosamente en la base de datos y enviar una respuesta de éxito
            if (resultUpdate.affectedRows === 1) {
                res.status(201).json({ message: 'Articulo creado exitosamente', codigo_interno: codigoInterno });
                console.log('Articulo creado exitosamente');
            } else {
                res.status(400).json({ message: 'No se pudo actualizar el codigo_interno del Articulo' });
            }
        } else {
            res.status(400).json({ message: 'No se pudo crear el Articulo' });
        }

    } catch (error) {
        // Manejo de errores: imprimir el error en la consola y enviar una respuesta de error al cliente
        console.error('Error al crear Articulo:', error);
        res.status(500).send('Error interno del servidor');

        // Asegurarse de que la conexión siempre se cierre en caso de error o éxito
        if (conn) {
            console.log('Conexión cerrada')
            conn.end();
        }

    } finally {
        // Asegurarse de que la conexión siempre se cierre en caso de error o éxito
        if (conn) {
            console.log('Conexión cerrada')
            conn.end();
        }
    }
};

// ACTUALIZAR UN MATERIAL
const updateArticulo = async (req, res) => {
    // Declarar la variable conn con let para poder reasignarla en el bloque finally
    let conn;

    // Obtener los datos del material desde el cuerpo de la petición para actualizar un artículo en la base de datos
    const { idarticulo, nombre, sap, sku, unidad_medida, comentario, categoria_idcategoria, precio, imagen_base64 } = req.body;

    // Obtener el id del usuario de los headers de la petición para verificar permisos de actualización de un artículo en la base de datos
    const usuarioId = req.headers.usuarioid;

    // Verificar si todos los campos obligatorios están presentes en la petición para actualizar un artículo
    if (!idarticulo || !nombre || !sap || !sku || !unidad_medida || !categoria_idcategoria || precio === undefined) {
        return res.status(400).json({ message: 'Todos los campos son obligatorios' });
    }

    // Convertir el precio a un número de punto flotante y verificar si es válido
    const precioFloat = parseFloat(precio);
    if (isNaN(precioFloat)) {
        return res.status(400).json({ message: 'El precio debe ser un número válido' });
    }

    // Actualizar un artículo en la base de datos
    try {
        // Verificar permisos del usuario para actualizar un artículo por su idusuario
        const tienePermisos = await verificarPermisos(usuarioId);

        // Verificar si el usuario tiene permisos para actualizar un artículo
        if (!tienePermisos) {
            return res.status(403).json({ message: 'No tiene permisos para actualizar un artículo' });
        }

        // Obtener una conexión a la base de datos desde el pool de conexiones
        conn = await pool.getConnection();

        // Verificar si se obtuvo la conexión a la base de datos
        if (!conn) {
            return res.status(500).json({ message: 'Error al conectar con la base de datos' });
        }

        // Manejar la imagen del artículo base64 si esta presente en la petición para actualizarla en la base de datos
        // Obtener el nombre del archivo de la imagen del artículo basado en el código interno del artículo para verificar si la imagen es la misma o no
        let imagen_url = null;

        // Verificar si la imagen del artículo está presente en la petición y si es diferente a la imagen actual del artículo
        if (imagen_base64) {
            const base64Data = imagen_base64.replace(/^data:image\/\w+;base64,/, '');
            const imagenBuffer = Buffer.from(base64Data, 'base64');

            // verificar si la imagen coincide con el codigo interno del articulo y para ver si es la misma imagen o no 
            const queryImagen = 'SELECT imagen_url FROM articulo WHERE idarticulo = ?';
            const resultImagen = await conn.query(queryImagen, [idarticulo]);
            const imagenAnterior = resultImagen[0]?.imagen_url;
       
            if (imagenAnterior) {
                const imagenRutaAnterior = path.join(__dirname, `../../public/uploads/imagenes_articulos/${path.basename(imagenAnterior)}`);
       
                if (fs.existsSync(imagenRutaAnterior)) {
                    const imagenBufferAnterior = fs.readFileSync(imagenRutaAnterior);
                    const hashImagenAnterior = crypto.createHash('md5').update(imagenBufferAnterior).digest('hex');
                    const hashImagenNueva = crypto.createHash('md5').update(imagenBuffer).digest('hex');
        
                    if (hashImagenAnterior === hashImagenNueva) {
                        // Si las imágenes son iguales, no se sube la nueva imagen
                        imagen_url = imagenAnterior;
                    } else {
                        // Si las imágenes son diferentes, se guarda la nueva imagen
                        const imagenNombre = `imagen_${idarticulo}_${Date.now()}.png`;
                        const imagenRuta = path.join(__dirname, `../../public/uploads/imagenes_articulos/${imagenNombre}`);
        
                        // Compruebo de que el directorio existe y si no se crea
                        if (!fs.existsSync(path.join(__dirname, '../../public/uploads/imagenes_articulos'))) {
                            fs.mkdirSync(path.join(__dirname, '../../public/uploads/imagenes_articulos'), { recursive: true });
                        }
        
                        // Guardar la imagen en el servidor y obtener la URL de la imagen almacenada en el servidor para actualizarla en la base de datos
                        fs.writeFileSync(imagenRuta, imagenBuffer);
                        imagen_url = `/public/uploads/imagenes_articulos/${imagenNombre}`;
                    }
                }
            } else {
                // Si no hay imagen anterior, se guarda la nueva imagen
                const imagenNombre = `imagen_${idarticulo}_${Date.now()}.png`;
                const imagenRuta = path.join(__dirname, `../../public/uploads/imagenes_articulos/${imagenNombre}`);
       
                // Compruebo de que el directorio existe y si no se crea
                if (!fs.existsSync(path.join(__dirname, '../../public/uploads/imagenes_articulos'))) {
                    fs.mkdirSync(path.join(__dirname, '../../public/uploads/imagenes_articulos'), { recursive: true });
                }
       
                // Guardar la imagen en el servidor y obtener la URL de la imagen almacenada en el servidor para actualizarla en la base de datos
                fs.writeFileSync(imagenRuta, imagenBuffer);
                imagen_url = `/public/uploads/imagenes_articulos/${imagenNombre}`;
            }
        }

        // Generar el nuevo codigo_interno basado en las características actualizadas del artículo
        const codigo_interno = `${idarticulo.toString().slice(-2)}${nombre.slice(0, 2).toUpperCase()}${categoria_idcategoria}`;

        // Consulta SQL para actualizar un artículo en la base de datos con los nuevos valores recibidos en la petición (req.body)
        const query = `
            UPDATE articulo
            SET nombre = ?, sap = ?, codigo_interno = ?, sku = ?, unidad_medida = ?, comentario = ?, categoria_idcategoria = ?, precio = ?, imagen_url = COALESCE(?, imagen_url)
            WHERE idarticulo = ?
        `;
        const values = [nombre, sap, codigo_interno, sku, unidad_medida, comentario, categoria_idcategoria, precioFloat, imagen_url, idarticulo];

        // Ejectuar la consulta SQL para actualizar un artículo en la base de datos
        const result = await conn.query(query, values);

        // Liberar la conexión a la base de datos
        conn.release();

        // Verificar si el artículo fue actualizado exitosamente en la base de datos y enviar una respuesta al cliente
        if (result.affectedRows === 1) {
            res.status(200).json({ message: 'Artículo actualizado exitosamente', codigo_interno });
            console.log('Artículo actualizado exitosamente');
        } else {
            res.status(400).json({ message: 'No se pudo actualizar el artículo' });
        }

    } catch (error) {
        // Manejo de errores: imprimir el error en la consola y enviar una respuesta de error al cliente
        console.error('Error al actualizar artículo:', error);
        res.status(500).send('Error interno del servidor');

    } finally {
        // Asegurarse de que la conexión siempre se cierre en caso de error o éxito
        if (conn) {
            console.log('Conexión cerrada')
            conn.end();
        }
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

        // Verificar si el artículo fue marcado como inactivo exitosamente
        if (result.affectedRows === 1) {
            res.status(200).json({ message: 'Articulo eliminado exitosamente' });
            console.log('Articulo eliminado exitosamente');
        } else {
            res.status(400).json({ message: 'No se pudo eliminar el Articulo' });
        }

    } catch (error) {
        // Manejo de errores: imprimir el error en la consola y enviar una respuesta de error al cliente
        console.error('Error al eliminar Articulo:', error);
        res.status(500).send('Error interno del servidor');
    } finally {
        // Asegurarse de que la conexión siempre se cierre en caso de error o éxito
        if (conn) {
            console.log('Conexión cerrada');
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
}