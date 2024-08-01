
const jsonToHtmlValeSalida = async (json, idTicket) => {

  let html = '<html>' +
    '<head>' +
    '<style>' +

    '.header {' +
    ' display: grid;' +
    'grid-template-columns: 1fr 2fr 1fr;' +
    ' background-color: #0e0a1a;' +
    'padding: 5px;' +
    'border-radius: 10px;' +
    '}' +
    '.titulo {' +
    'font-family: Arial, Helvetica, sans-serif;' +
    'padding: 20px;' +
    'font-size: 10px;' +
    'text-align: center;' +
    'align-self: center;' +
    ' justify-self: center;' +
    ' color: white;' +
    '  }' +
    '.imgLogoPsinet {' +
    ' padding: 20px 20px 20px 20px;' +
    'align-self: center;' +
    'justify-self: center;' +
    '}' +
    '.imgLogoCodelco {' +
    'padding: 20px 20px 20px 20px;' +
    'align-self: center;' +
    'justify-self: center;' +
    'margin: -40px;' +
    '}' +
    '.body-datos {' +
    ' display: grid;' +
    'grid-template-columns: 1fr 1fr;' +
    ' margin: 30px 15px 0px 15px;' +
    'font-family: Arial, Helvetica, sans-serif;' +
    'font-size: 15px;' +
    'border: 3px solid grey;' +
    'border-radius: 10px;' +
    '}' +
    '.body-descripcion {' +
    ' padding: 15px 0px 0px 10px;' +
    'font-family: Arial, Helvetica, sans-serif;' +
    'font-size: 15px;' +
    ' }' +
    '.input {' +
    'margin: 0px;' +
    'align-self: center;' +
    'justify-self: left;' +
    'text-align: left;' +
    'padding: 10px;' +
    '}' +
    '.tabla {' +
    ' margin: 10px;' +
    '}' +
    'table {' +
    'font-family: arial, sans-serif;' +
    'border-collapse: collapse;' +
    ' width: 100%;' +
    'font-size: 12px;' +
    '}' +
    'th, td {' +
    'border: 1px solid #dddddd;' +
    'text-align: left;' +
    'padding: 8px;' +
    ' }' +

    ' .footer {' +
    ' position: fixed;' +
    ' left: 0;' +
    ' bottom: 10;' +
    ' width: 100%;' +
    ' text-align: center;' +
    ' display: grid;' +
    ' grid-template-columns: 1fr 1fr;' +
    '}' +
    '.firma {' +
    'border: 3px solid grey;' +
    ' width: 200px;' +
    'height: 160px;' +
    'align-self: center;' +
    'justify-self: center;' +
    ' }' +
    '.text-firma {' +
    ' font-weight: bold;' +
    '}' +
    ' .text-ticket {' +
    ' padding: 15px 0px 0px 15px;' +
    ' font-family: Arial, Helvetica, sans-serif;' +
    'font-size: 20px;' +
    '}' +

    ' </style>' +

    '<title>VALE SALIDA DE MATERIALES</title>' +
    '</head>' +

    '<body>' +
    ' <div class="header">' +

    '<img class="imgLogoPsinet " alt="Logo Psinet" width="130" 		src="https://www.psinet.cl/wp-content/uploads/2022/10/cropped-Recurso-14Logo-PSINet.png">' +

    '<div class="titulo"><h1>VALE SALIDA DE MATERIALES</h1></div>' +

    '<img class="imgLogoCodelco" alt="Logo Codelco" width="130" 		src="https://www.codelco.com/prontus_codelco/site/artic/20221125/imag/foto_0000000120221125121535/codelco_default640x360.png">' +

    '</div>' +

   ' <div class="text-ticket">'+
     ' <h2>Ticket N° '+ idTicket +'</h2>'+
    '</div>'+

  ' <div class="body-datos">' +
    '<p class="input"><b>Fecha: </b>' + json.fecha + '</p>' +
    '<p class="input"><b>Area Solicitante: </b>' + json.area + '</p>' +
    '<p class="input"><b>Solicitante Codelco: </b>' + json.solCodelco + '</p>' +
    '<p class="input"><b>Responsable: </b>' + json.responsableRetira + '</p>' +
    '<p class="input"><b>Responsable Bodega: </b>' + json.responsableEntrega + '</p>' +
    '<p class="input"><b>Ceco: </b>' + json.ceco + '</p>' +
    '</div>' +

    '<div class="body-descripcion">' +
    '<p class="input"><b>Descripcion del Trabajo: </b>' + json.descripcion + '</p>' +
    '<p class="input"><b>Observaciones: </b>' + json.observaciones + '</p>' +
    '</div>' +

    '<div class="tabla">' +
    ' <table>' +
    ' <tr>' +
    ' <th>Item</th>' +
    '<th>Unidad</th>' +
    '<th>Descripcion</th>' +
    '<th>Cantidad</th>' +
    '<th>Bodega</th>' +
    '</tr>';

  for (let i = 0; i < json.detalle.length; i++) {

    html = html +
      '<tr>' +
      '<td>' + json.detalle[i].item + '</td>' +
      '<td>' + json.detalle[i].unidad + '</td>' +
      '<td>' + json.detalle[i].descripcion + '</td>' +
      '<td>' + json.detalle[i].cantidad + '</td>' +
      '<td>' + json.detalle[i].bodega + ' - '+ json.detalle[i].ubicacion +'</td>' +
      '</tr>'

  }


  html = html +

    ' </table>' +
    '</div>' +

    ' <div class="footer">' +
    '<p class="text-firma">Firma quien retira</p>' +
    '<p class="text-firma">Firma responsable bodega</p>' +
    '<div class="firma">' +
    ' <img width="120" alt="" src="' + json.firmaSolicitante + '">' +
    ' </div>' +
    '<div class="firma">' +
    '  <img width="120" alt="" src="' + json.firmaBodega + '">' +
    '</div>' +
    '<p class="text-firma">'+ json.responsableRetira +'</p>'+
    '<p class="text-firma">'+ json.responsableEntrega +'</p>'+

    ' </div>' +

    '</body>' +
    '</html>'

  return html

}
