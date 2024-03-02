const express = require('express')
const morgan = require('morgan')

const materialesRoutes = require('./routes/materiales.routes')

const app = express()

app.use(morgan('dev'))
app.use(express.json())

app.use(materialesRoutes)

app.listen(3000)
console.log('Server listen in port 3000')