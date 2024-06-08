const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const cookieParser = require('cookie-parser')

const materialesRoutes = require('./routes/materiales.routes')
const bodegasRoutes = require('./routes/bodegas.routes')
const ticketEntradaRoutes = require('./routes/ticketentrada.routes')
const usuariosRoutes = require('./routes/usuarios.routes')
const ticketSalidaRoutes = require('./routes/ticketsalida.routes')
const authRoutes = require('./routes/auth.routes')




const app = express()

app.use(cors({credentials: true, origin: true}))
app.use(morgan('dev'))
app.use(express.json())
app.use(cookieParser())

app.use('/api/v1/',materialesRoutes)
app.use('/api/v1/',bodegasRoutes)
app.use('/api/v1/',ticketEntradaRoutes)
app.use('/api/v1/',usuariosRoutes)
app.use('/api/v1/',ticketSalidaRoutes)
app.use('/api/v1/',authRoutes)

app.listen(3000)
console.log('Server listen in port 3000')