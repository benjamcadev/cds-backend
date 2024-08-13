const express = require('express')

const dotenv = require('dotenv').config()
const morgan = require('morgan')
const cors = require('cors')
const cookieParser = require('cookie-parser')
const path = require('path')



const { articulosRoutes, bodegasRoutes, ticketEntradaRoutes, usuariosRoutes, ticketSalidaRoutes, authRoutes, categoriasRoutes } = require('./routes')

const app = express()



// Configurar el límite de tamaño del cuerpo de la solicitud
app.use(express.json({ limit: '8mb' }));
app.use(express.urlencoded({ limit: '8mb', extended: true }));



app.get ('/', (req, res) => {
    res.send('Bienvenido a la API')
})


app.use(cors({credentials: true, origin: true}))
app.use(morgan('dev'))
app.use(express.json())
app.use(cookieParser())

app.use(articulosRoutes)
app.use(bodegasRoutes)
app.use(categoriasRoutes)
app.use(ticketEntradaRoutes)
app.use(usuariosRoutes)
app.use(ticketSalidaRoutes)
app.use(authRoutes)


// Configura la ruta para servir archivos estáticos desde la carpeta de imágenes
// Configura la ruta para servir archivos estáticos desde la carpeta de imágenes
app.use('/imagenes', express.static(path.join(__dirname, 'public', 'uploads', 'imagenes_articulos')));


const PORT = process.env.PORT || 4000;

app.listen(process.env.PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`)
})