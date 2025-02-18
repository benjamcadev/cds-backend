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


const createDirectoryTicketEntrada = async( idTicketEntrada ) => {

    let dir_public = join(__dirname, '../../public');
    let dir_uploads = join(__dirname, '../../public/uploads' );
    let dir_ticketsEntrada = join(__dirname, '../../public/uploads/ticket_entrada');
    let dir_ticketEntrada =  join(__dirname, '../../public/uploads/ticket_entrada/'+idTicketEntrada);

    try {
        if (!fs.existsSync(dir_public)){
            fs.mkdirSync(dir_public, { recursive: true });
        }

        if (!fs.existsSync(dir_uploads)){
            fs.mkdirSync(dir_uploads, { recursive: true });
        }

        if (!fs.existsSync(dir_ticketsEntrada)){
            fs.mkdirSync(dir_ticketsEntrada, { recursive: true });
        }

        if (!fs.existsSync(dir_ticketEntrada)){
            fs.mkdirSync(dir_ticketEntrada, { recursive: true }, err => { return err} );
            return dir_ticketEntrada
        }


    } catch (error) {
        return error
    }

}

const saveSignature = async(request, path, idTicket) => {
    let pathSignatures = {
        retira: '',
        entrega: ''
    }
    try {
        console.log(path);
        let base64DataFirmaBodega = request.firmaBodega.replace(/^data:image\/png;base64,/, "");
        fs.writeFileSync(path+ '/firma_bodega_'+idTicket+'.png', base64DataFirmaBodega , 'base64');
        pathSignatures.entrega = path.replaceAll("\\", "/")+ '/firma_bodega_'+idTicket+'.png';
        console.log(pathSignatures);
        

        if (!request.firmaSolicitante == '' ) {
            let base64DataFirmaResponsable = request.firmaSolicitante.replace(/^data:image\/png;base64,/, "");
            fs.writeFileSync(path+ '//firma_responsable_'+idTicket+'.png', base64DataFirmaResponsable , 'base64');
            pathSignatures.retira = path.replaceAll("//", "////")+ '////firma_responsable_'+idTicket+'.png';
        }
       return pathSignatures
        
    } catch (error) {
    return error;
    }

}

const saveImageEntrada = async (request, path, idTicket) => {
    let pathImages = {
        foto_documentos: '',
    };

    try {
        if (request.foto_documentos) {
            // Eliminar el prefijo base64
            let base64DataFotoDocumentos = request.foto_documentos.replace(/^data:image\/(png|jpg|jpeg|webp);base64,/, "");
            // Decodificar la cadena base64 y guardar el archivo
            fs.writeFileSync(join(path, `foto_documentos_${idTicket}.png`), Buffer.from(base64DataFotoDocumentos, 'base64'));
            pathImages.foto_documentos = join(path, `foto_documentos_${idTicket}.png`);
        }

        return pathImages;
    } catch (error) {
        console.error("Error al guardar la imagen:", error);
        return error;
    }
};


module.exports = { createDirectoryTicketSalida, saveSignature, createDirectoryTicketEntrada, saveImageEntrada }