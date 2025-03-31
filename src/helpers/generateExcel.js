const ExcelJS = require('exceljs');
const fs = require('fs').promises;



const jsonToExcelCotizacion = async (path, json, idCotizacion) => {

    let responseExcel = {
        base64Excel: '',
        pathExcel: '',
    }

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Cotizacion');

    // Combinar celdas y agregar texto en las primeras dos filas
    worksheet.mergeCells('A1:J1');
    const cellA1 = worksheet.getCell('A1');
    cellA1.value = json.descripcion;
    cellA1.font = { size: 16, bold: true };
    cellA1.border = {
        top: { style: 'thick' },
        left: { style: 'thick' },
        bottom: { style: 'thick' },
        right: { style: 'thick' }
    };

    worksheet.mergeCells('A2:J2');
    const cellA2 = worksheet.getCell('A2');
    cellA2.value = 'CECO ' + json.ceco;
    cellA2.font = { size: 16, bold: true };
    cellA2.border = {
        top: { style: 'thick' },
        left: { style: 'thick' },
        bottom: { style: 'thick' },
        right: { style: 'thick' }
    };


    // Agregar encabezados de tabla con color rojo
    const headers = ['Item', 'Descripción', 'Unidad', 'Cantidad', 'P. Unitario', 'P. Total', 'Ce Co', 'Cl Co', 'Via de Compra', 'Codigo'];
    headers.forEach((header, index) => {
        const cell = worksheet.getCell(4, index + 1);
        cell.value = header;
        cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'C70039' } // Rojo
        };
        cell.font = {
            color: { argb: 'FFFFFFFF' } // Blanco
        };
        cell.border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' }
        };
    });

    // Agregar datos de ejemplo a la tabla
    let d = 0; // contador del detalle del json
    for (let i = 5; i < json.detalle.length + 5; i++) { //filas

        for (let j = 1; j < 11; j++) {// columnas
            const cell = worksheet.getCell(i, j);
            if (j == 1) { cell.value = json.detalle[d].id; }
            if (j == 2) { cell.value = json.detalle[d].descripcion; }
            if (j == 3) { cell.value = json.detalle[d].unidad; }
            if (j == 4) { cell.value = json.detalle[d].cantidad; }
            if (j == 5) { cell.value = json.detalle[d].precio; }
            if (j == 6) { cell.value = json.detalle[d].precioTotal; }
            if (j == 7) { cell.value = json.ceco; }
            if (j == 8) { cell.value = ''; }
            if (j == 9) { cell.value = ''; }
            if (j == 10) { cell.value = json.detalle[d].codigo; }


            cell.border = {
                top: { style: 'thin' },
                left: { style: 'thin' },
                bottom: { style: 'thin' },
                right: { style: 'thin' }
            };
        }
        d++;
    }

    const lastRow = json.detalle.length + 4;

     // Escribiendo la palabra total
     worksheet.getCell(lastRow + 1, 5).value = 'Total: ';
     worksheet.getCell(lastRow + 1, 5).border = {
         top: { style: 'thin' },
         left: { style: 'thin' },
         bottom: { style: 'thin' },
         right: { style: 'thin' }
     };

    // Autosuma en la columna 6
    
    worksheet.getCell(lastRow + 1, 6).value = { formula: `SUM(F4:F${lastRow})` };
    worksheet.getCell(lastRow + 1, 6).border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
    };

   

    //CELDA DE OBSERVACIONES
    const cellObservaciones = worksheet.getCell(lastRow + 3, 1 );
    worksheet.mergeCells('A'+ cellObservaciones.row + ':J'+ cellObservaciones.row);
    cellObservaciones.value = 'Observaciones: ' + json.observaciones;
    cellObservaciones.font = { size: 11, bold: true };
    cellObservaciones.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
    };


    //Haciendo la ruta del excel
    responseExcel.pathExcel = path + '/Cotizacion_' + idCotizacion + '_' + json.descripcion + '.xlsx';

    // Guardar el archivo Excel
    await workbook.xlsx.writeFile(responseExcel.pathExcel);


    // Guardar el archivo Excel en un buffer
    const buffer = await workbook.xlsx.writeBuffer();

    // Convertir el buffer a Base64
    responseExcel.base64Excel = buffer.toString('base64');

    return responseExcel; // Devolver la cadena Base64

}

module.exports = {
    jsonToExcelCotizacion
}