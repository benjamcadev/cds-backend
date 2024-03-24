const fs = require('fs');
const {join} = require('path')

const createDirectoryTicketSalida = async(idTicket) => {

    let dir_public = join(__dirname, '../../public');
    let dir_uploads = join(__dirname, '../../public/uploads' );
    let dir_ticketsSalida = join(__dirname, '../../public/uploads/ticket_salida');
    let dir_ticketSalida =  join(__dirname, '../../public/uploads/ticket_salida/'+idTicket);

    //COMPROBAR SI EXISTE CARPETA PUBLIC

    try {
        if (!fs.existsSync(dir_public)){
            fs.mkdirSync(dir_public, { recursive: true });
        }

        if (!fs.existsSync(dir_uploads)){
            fs.mkdirSync(dir_uploads, { recursive: true });
        }

        if (!fs.existsSync(dir_ticketsSalida)){
            fs.mkdirSync(dir_ticketsSalida, { recursive: true });
        }

        if (!fs.existsSync(dir_ticketSalida)){
            fs.mkdirSync(dir_ticketSalida, { recursive: true }, err => { return err} );
            return dir_ticketSalida
        }


    } catch (error) {
        return error
    }

}

const saveSignature = async(request, path, idTicket) => {
    try {
        let base64DataFirmaBodega = request.firmaBodega.replace(/^data:image\/png;base64,/, "");
        fs.writeFileSync(path+ '/firma_bodega_'+idTicket+'.png', base64DataFirmaBodega , 'base64');

        if (!request.firmaSolicitante == '' ) {
            let base64DataFirmaResponsable = request.firmaSolicitante.replace(/^data:image\/png;base64,/, "");
            fs.writeFileSync(path+ '/firma_responsable_'+idTicket+'.png', base64DataFirmaResponsable , 'base64');
        }
       
        
    } catch (error) {
    return error;
    }

}

module.exports = { createDirectoryTicketSalida, saveSignature }