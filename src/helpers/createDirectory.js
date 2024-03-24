const fs = require('fs');


const createDirectoryTicketSalida = async(idTicket) => {

    let dir_public = './public';
    let dir_uploads = './public/uploads'
    let dir_ticketsSalida = './public/uploads/ticket_salida'
    let dir_ticketSalida = './public/uploads/ticket_salida/'+idTicket;

    //COMPROBAR SI EXISTE CARPETA PUBLIC

    try {
        if (!fs.existsSync(dir_public)){
            fs.mkdirSync(dir_public);
        }

        if (!fs.existsSync(dir_uploads)){
            fs.mkdirSync(dir_uploads);
        }

        if (!fs.existsSync(dir_ticketsSalida)){
            fs.mkdirSync(dir_ticketsSalida);
        }

        if (!fs.existsSync(dir_ticketSalida)){
            fs.mkdirSync(dir_ticketSalida);
            return dir_ticketSalida
        }


    } catch (error) {
        return error
    }




}

module.exports = { createDirectoryTicketSalida }