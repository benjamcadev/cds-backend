const fs = require('fs').promises; 
const path = require('path')

const convertirABase64 =  async (archivo) => {
    try {
        // Leer el archivo de forma asincrónica
        const data = await fs.readFile(archivo);
    
        // Convertir el archivo a Base64
        const base64 = data.toString('base64');
    
        // Puedes devolver el Base64 si lo necesitas
        return base64;
      } catch (err) {
        console.error('Error al leer el archivo:', err);
        return '';
      }
}

module.exports = { convertirABase64 }