const express = require('express')
const morgan = require('morgan')
const cors = require('cors')

const materialesRoutes = require('./routes/materiales.routes')
const bodegasRoutes = require('./routes/bodegas.routes')
const ticketEntradaRoutes = require('./routes/ticketentrada.routes')
const usuariosRoutes = require('./routes/usuarios.routes')




const app = express()

app.use(cors({credentials: true, origin: true}))
app.use(morgan('dev'))
app.use(express.json())

app.use(materialesRoutes)
app.use(bodegasRoutes)
app.use(ticketEntradaRoutes)
app.use(usuariosRoutes)

app.listen(3000)
console.log('Server listen in port 3000')