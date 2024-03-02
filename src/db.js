const { Pool } = require('pg')

const pool = new Pool({
    user: 'postgres',
    password: 'triper_93',
    host: 'localhost',
    port: '5433',
    database: 'cds'
})

module.exports = pool