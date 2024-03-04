require('dotenv').config()

const mariadb = require('mariadb')

const pool = mariadb.createPool({

    user: process.env.USER_DB,
    password: process.env.PASS_DB,
    host: process.env.HOST_DB,
    port: process.env.PORT_DB,
    database: process.env.DATABASE_DB
})

async function getConnection() {

    try {
        const connection = await pool.getConnection();
        return connection;
    } catch (error) {
        console.log(error);
    }
   
}

// const pool = new Pool({
//     user: 'postgres',
//     password: 'triper_93',
//     host: 'localhost',
//     port: '5433',
//     database: 'cds'
// })


module.exports = {getConnection};