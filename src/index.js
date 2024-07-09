const express = require('express')
require('dotenv').config()

const morgan = require('morgan')
const cors = require('cors')
const cookieParser = require('cookie-parser')
const { articulosRoutes, bodegasRoutes, ticketEntradaRoutes, usuariosRoutes, ticketSalidaRoutes, authRoutes } = require('./routes')

const app = express()

app.get ('/', (req, res) => {
    res.send('Bienvenido a la API')
})

app.use(cors({credentials: true, origin: true}))
app.use(morgan('dev'))
app.use(express.json())
app.use(cookieParser())

app.use(articulosRoutes)
app.use(bodegasRoutes)
app.use(ticketEntradaRoutes)
app.use(usuariosRoutes)
app.use(ticketSalidaRoutes)
app.use(authRoutes)

// iniciar el servidor
app.listen(process.env.PORT, () => {
    console.log(`Servidor corriendo  http://localhost:${process.env.PORT}`)
})