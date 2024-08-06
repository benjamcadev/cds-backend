

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
    '<p class="input"><b>Nro° Ticket de Trabajo: </b>' + json.ticketTrabajo + '</p>' +
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

    '</table>' +
    '</div>' +

    '<div class="footer">' +
    '<p class="text-firma">Firma quien retira</p>' +
    '<p class="text-firma">Firma responsable bodega</p>' +
    '<div class="firma">' +
    '<img width="120" alt="" src="' + json.firmaSolicitante + '">' +
    '</div>' +
    '<div class="firma">' +
    '<img width="120" alt="" src="' + json.firmaBodega + '">' +
    '</div>' +
    '<p class="text-firma">'+ json.responsableRetira +'</p>'+
    '<p class="text-firma">'+ json.responsableEntrega +'</p>'+

    '</div>' +

    '</body>' +
    '</html>'

  return html

}

const jsonToHtmlValeEntrada = async (json, idTicketEntrada) => {

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
  ' grid-template-columns: 1fr;' +
  '}' +
  '.footer-compra, .footer-devolucion {' +
  ' grid-template-columns: 1fr 1fr;' +
  '}' +
  '.firma {' +
  'border: 3px solid grey;' +
  ' width: 200px;' +
  'height: 160px;' +
  'align-self: center;' +
  'justify-self: center;' +
  ' margin: 0 auto;' +
  ' }' +
  '.firma-compra, .firma-devolucion {' +
  ' margin: 0 auto;' +
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
  '<title>VALE ENTRADA DE MATERIALES</title>' +
  '</head>' +
  '<body>' +
  ' <div class="header">' +
  '<img class="imgLogoPsinet " alt="Logo Psinet" width="130"  src="https://www.psinet.cl/wp-content/uploads/2022/10/cropped-Recurso-14Logo-PSINet.png">' +
  '<div class="titulo"><h1>VALE ENTRADA DE MATERIALES</h1></div>' +
  '<img class="imgLogoCodelco" alt="Logo Codelco" width="130" src="https://www.codelco.com/prontus_codelco/site/artic/20221125/imag/foto_0000000120221125121535/codelco_default640x360.png">' +
  '</div>' +
  ' <div class="text-ticket">' +
  ' <h2>Ticket N° ' + idTicketEntrada + '</h2>' +
  '</div>' +
  ' <div class="body-datos">' +
  '<p class="input"><b>Fecha: </b>' + json.fecha + '</p>' +
  '<p class="input"><b>Tipo De Entrada: </b>' + json.tipoTicket + '</p>'

  if (json.tipoTicket === 'Inventario') {
    // Add fields specific to "Inventario" tipoTicket
    html += '<p class="input"><b>Responsable Bodega: </b>' + json.responsableEntrega + '</p>';
    html += '<p class="input"><b>Observaciones: </b>' + json.descripcion + '</p>';
  } else if (json.tipoTicket === 'Compra') {
    // Add fields specific to "Compra" tipoTicket
    html += '<p class="input"><b>Tipo De Compra: </b>' + json.tipoCompra + '</p>';
    html += '<p class="input"><b>N° De Documento: </b>' + json.numeroDocumento + '</p>';
    html += '<p class="input"><b>Tipo De Recepción: </b>' + json.tipoRecepcion + '</p>';
    html += '<p class="input"><b>Responsable Bodega: </b>' + json.responsableEntrega + '</p>';
    html += '<p class="input"><b>Observaciones: </b>' + json.descripcion + '</p>';
  } else if ( json.tipoTicket	=== 'Devolucion') {
    html += '<p class="input"><b>Responsable Bodega: </b>' + json.responsableEntrega + '</p>';
    html += '<p class="input"><b>Responsable: </b>' + json.responsableRetira + '</p>';
    html += '<p class="input"><b>Observaciones: </b>' + json.descripcion + '</p>';
  }



  html += '</div>' +
    '<div class="body-descripcion">' +
    '</div>' +
    '<div class="tabla">' +
    '<table>' +
    '<tr>' +
    '<th>Item</th>' +
    '<th>Unidad</th>' +
    '<th>Descripcion</th>' +
    '<th>Cantidad</th>' +
    '<th>Bodega/Ubicación</th>';

  if (json.tipoTicket === 'Compra') {
    html += '<th>Reserva/OC</th>';
  }

  html += '</tr>';

  for (let i = 0; i < json.detalle.length; i++) {
    html +=
        '<tr>' +
        '<td>' + json.detalle[i].item + '</td>' +
        '<td>' + json.detalle[i].unidad + '</td>' +
        '<td>' + json.detalle[i].descripcion + '</td>' +
        '<td>' + json.detalle[i].cantidad + '</td>' +
        '<td>' + json.detalle[i].bodega + ' - ' + json.detalle[i].ubicacion + '</td>';

    if (json.tipoTicket === 'Compra') {
        html += '<td>' + json.detalle[i].reserva + '</td>';
    }

    html += '</tr>';
  }

  html +=
    ' </table>' +
    '</div>';

  if (json.tipoTicket === 'Compra') {

    html += '<div class="footer">';
    html += '<p class="text-firma">Firma responsable bodega</p>';
    html += '<div class="firma firma-compra">' +
        '<img width="120" alt="" src="' + json.firmaBodega + '">' +
        '</div>';
    html += '<p class="text-firma">' + json.responsableEntrega + '</p>';

  } else if (json.tipoTicket === 'Inventario') {
    html += '<div class="footer">';
    html += '<p class="text-firma">Firma responsable bodega</p>';
    html += '<div class="firma">' +
        '<img width="120" alt="" src="' + json.firmaBodega + '">' +
        '</div>';
    html += '<p class="text-firma">' + json.responsableEntrega + '</p>';

  } else if (json.tipoTicket === 'Devolucion') {
    html += '<div class="footer footer-devolucion">';
    html += '<div><p class="text-firma">Firma quien retira</p>' +
      '<div class="firma firma-devolucion">' +
      '<img width="120" alt="" src="' + (json.firmaSolicitante || '') + '">' +
      '</div>' +
      '<p class="text-firma">' + (json.responsableRetira || '') + '</p></div>';
    html += '<div><p class="text-firma">Firma responsable bodega</p>' +
      '<div class="firma firma-devolucion">' +
      '<img width="120" alt="" src="' + json.firmaBodega + '">' +
      '</div>' +
      '<p class="text-firma">' + json.responsableEntrega + '</p></div>';
  }

  html += '</div>' +
      '</body>' +
      '</html>';

  return html;


}



const emailValeSalida = (idTicket, responsableRetira) => {

  const html = `<!doctype html>
  <html lang="en">
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
      <title>Simple Transactional Email</title>
      <style media="all" type="text/css">
      /* -------------------------------------
      GLOBAL RESETS
  ------------------------------------- */
      
      body {
        font-family: Helvetica, sans-serif;
        -webkit-font-smoothing: antialiased;
        font-size: 16px;
        line-height: 1.3;
        -ms-text-size-adjust: 100%;
        -webkit-text-size-adjust: 100%;
      }
      
      table {
        border-collapse: separate;
        mso-table-lspace: 0pt;
        mso-table-rspace: 0pt;
        width: 100%;
      }
      
      table td {
        font-family: Helvetica, sans-serif;
        font-size: 16px;
        vertical-align: top;
      }
      /* -------------------------------------
      BODY & CONTAINER
  ------------------------------------- */
      
      body {
        background-color: #f4f5f6;
        margin: 0;
        padding: 0;
      }
      
      .body {
        background-color: #f4f5f6;
        width: 100%;
      }
      
      .container {
        margin: 0 auto !important;
        max-width: 600px;
        padding: 0;
        padding-top: 24px;
        width: 600px;
      }
      
      .content {
        box-sizing: border-box;
        display: block;
        margin: 0 auto;
        max-width: 600px;
        padding: 0;
      }
      /* -------------------------------------
      HEADER, FOOTER, MAIN
  ------------------------------------- */
      
      .main {
        background: #ffffff;
        border: 1px solid #eaebed;
        border-radius: 16px;
        width: 100%;
      }
      
      .wrapper {
        box-sizing: border-box;
        padding: 24px;
      }
      
      .footer {
        clear: both;
        padding-top: 24px;
        text-align: center;
        width: 100%;
      }
      
      .footer td,
      .footer p,
      .footer span,
      .footer a {
        color: #9a9ea6;
        font-size: 16px;
        text-align: center;
      }
      /* -------------------------------------
      TYPOGRAPHY
  ------------------------------------- */
      
      p {
        font-family: Helvetica, sans-serif;
        font-size: 16px;
        font-weight: normal;
        margin: 0;
        margin-bottom: 16px;
      }
      
      a {
        color: #0867ec;
        text-decoration: underline;
      }
      /* -------------------------------------
      BUTTONS
  ------------------------------------- */
      
      .btn {
        box-sizing: border-box;
        min-width: 100% !important;
        width: 100%;
      }
      
      .btn > tbody > tr > td {
        padding-bottom: 16px;
      }
      
      .btn table {
        width: auto;
      }
      
      .btn table td {
        background-color: #ffffff;
        border-radius: 4px;
        text-align: center;
      }
      
      .btn a {
        background-color: #ffffff;
        border: solid 2px #0867ec;
        border-radius: 4px;
        box-sizing: border-box;
        color: #0867ec;
        cursor: pointer;
        display: inline-block;
        font-size: 16px;
        font-weight: bold;
        margin: 0;
        padding: 12px 24px;
        text-decoration: none;
        text-transform: capitalize;
      }
      
      .btn-primary table td {
        background-color: #0867ec;
      }
      
      .btn-primary a {
        background-color: #0867ec;
        border-color: #0867ec;
        color: #ffffff;
      }
      
      @media all {
        .btn-primary table td:hover {
          background-color: #ec0867 !important;
        }
        .btn-primary a:hover {
          background-color: #ec0867 !important;
          border-color: #ec0867 !important;
        }
      }
      
      /* -------------------------------------
      OTHER STYLES THAT MIGHT BE USEFUL
  ------------------------------------- */
      
      .last {
        margin-bottom: 0;
      }
      
      .first {
        margin-top: 0;
      }
      
      .align-center {
        text-align: center;
      }
      
      .align-right {
        text-align: right;
      }
      
      .align-left {
        text-align: left;
      }
      
      .text-link {
        color: #0867ec !important;
        text-decoration: underline !important;
      }
      
      .clear {
        clear: both;
      }
      
      .mt0 {
        margin-top: 0;
      }
      
      .mb0 {
        margin-bottom: 0;
      }
      
      .preheader {
        color: transparent;
        display: none;
        height: 0;
        max-height: 0;
        max-width: 0;
        opacity: 0;
        overflow: hidden;
        mso-hide: all;
        visibility: hidden;
        width: 0;
      }
      
      .powered-by a {
        text-decoration: none;
      }
      
      /* -------------------------------------
      RESPONSIVE AND MOBILE FRIENDLY STYLES
  ------------------------------------- */
      
      @media only screen and (max-width: 640px) {
        .main p,
        .main td,
        .main span {
          font-size: 16px !important;
        }
        .wrapper {
          padding: 8px !important;
        }
        .content {
          padding: 0 !important;
        }
        .container {
          padding: 0 !important;
          padding-top: 8px !important;
          width: 100% !important;
        }
        .main {
          border-left-width: 0 !important;
          border-radius: 0 !important;
          border-right-width: 0 !important;
        }
        .btn table {
          max-width: 100% !important;
          width: 100% !important;
        }
        .btn a {
          font-size: 16px !important;
          max-width: 100% !important;
          width: 100% !important;
        }
      }
      /* -------------------------------------
      PRESERVE THESE STYLES IN THE HEAD
  ------------------------------------- */
      
      @media all {
        .ExternalClass {
          width: 100%;
        }
        .ExternalClass,
        .ExternalClass p,
        .ExternalClass span,
        .ExternalClass font,
        .ExternalClass td,
        .ExternalClass div {
          line-height: 100%;
        }
        .apple-link a {
          color: inherit !important;
          font-family: inherit !important;
          font-size: inherit !important;
          font-weight: inherit !important;
          line-height: inherit !important;
          text-decoration: none !important;
        }
        #MessageViewBody a {
          color: inherit;
          text-decoration: none;
          font-size: inherit;
          font-family: inherit;
          font-weight: inherit;
          line-height: inherit;
        }
      }
      </style>
    </head>
    <body>
      <table role="presentation" border="0" cellpadding="0" cellspacing="0" class="body">
        <tr>
          <td>&nbsp;</td>
          <td class="container">
            <div class="content">
  
              <!-- START CENTERED WHITE CONTAINER -->
              <span class="preheader">Se ha generado Ticket N° ${idTicket}</span>
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" class="main">
  
                <!-- START MAIN CONTENT AREA -->
                <tr>
                  <td class="wrapper">
                    <p><b>Hola ${responsableRetira} !<b></p>
                    <p>Se ha generado el ticket N° ${idTicket}, por el cual has retirado materiales de las bodegas GOT, en este correo se adjunta en PDF el detalle del vale de salida de los materiales.</p>
                    
                    <p>Que tengas un buen dia.</p>
                   
                  </td>
                </tr>
  
                <!-- END MAIN CONTENT AREA -->
                </table>
  
              <!-- START FOOTER -->
              <div class="footer">
                <table role="presentation" border="0" cellpadding="0" cellspacing="0">
                  <tr>
                    <td class="content-block">
                      <span class="apple-link">Este correo ha sido generado automaticamente</span>
                      <br>
                       <span class="apple-link">Por sistema de control de stock Psinet</span>
                    </td>
                  </tr>
                  <tr>
                    <td class="content-block powered-by" style="font-size: 10px;">
                      Hecho con ❤️ <a  style="font-size: 10px;" href="https://github.com/benjamcadev">benjamcadev</a>
                    </td>
                  </tr>
                </table>
              </div>
  
              <!-- END FOOTER -->
              
  <!-- END CENTERED WHITE CONTAINER --></div>
          </td>
          <td>&nbsp;</td>
        </tr>
      </table>
    </body>
  </html>`

  return html
}

const emailValeEntrada = (idTicketEntrada, responsableRetira) => {

  const html = `<!doctype html>
  <html lang="en">
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
      <title>Simple Transactional Email</title>
      <style media="all" type="text/css">
      /* -------------------------------------
      GLOBAL RESETS
  ------------------------------------- */
      
      body {
        font-family: Helvetica, sans-serif;
        -webkit-font-smoothing: antialiased;
        font-size: 16px;
        line-height: 1.3;
        -ms-text-size-adjust: 100%;
        -webkit-text-size-adjust: 100%;
      }
      
      table {
        border-collapse: separate;
        mso-table-lspace: 0pt;
        mso-table-rspace: 0pt;
        width: 100%;
      }
      
      table td {
        font-family: Helvetica, sans-serif;
        font-size: 16px;
        vertical-align: top;
      }
      /* -------------------------------------
      BODY & CONTAINER
  ------------------------------------- */
      
      body {
        background-color: #f4f5f6;
        margin: 0;
        padding: 0;
      }
      
      .body {
        background-color: #f4f5f6;
        width: 100%;
      }
      
      .container {
        margin: 0 auto !important;
        max-width: 600px;
        padding: 0;
        padding-top: 24px;
        width: 600px;
      }
      
      .content {
        box-sizing: border-box;
        display: block;
        margin: 0 auto;
        max-width: 600px;
        padding: 0;
      }
      /* -------------------------------------
      HEADER, FOOTER, MAIN
  ------------------------------------- */
      
      .main {
        background: #ffffff;
        border: 1px solid #eaebed;
        border-radius: 16px;
        width: 100%;
      }
      
      .wrapper {
        box-sizing: border-box;
        padding: 24px;
      }
      
      .footer {
        clear: both;
        padding-top: 24px;
        text-align: center;
        width: 100%;
      }
      
      .footer td,
      .footer p,
      .footer span,
      .footer a {
        color: #9a9ea6;
        font-size: 16px;
        text-align: center;
      }
      /* -------------------------------------
      TYPOGRAPHY
  ------------------------------------- */
      
      p {
        font-family: Helvetica, sans-serif;
        font-size: 16px;
        font-weight: normal;
        margin: 0;
        margin-bottom: 16px;
      }
      
      a {
        color: #0867ec;
        text-decoration: underline;
      }
      /* -------------------------------------
      BUTTONS
  ------------------------------------- */
      
      .btn {
        box-sizing: border-box;
        min-width: 100% !important;
        width: 100%;
      }
      
      .btn > tbody > tr > td {
        padding-bottom: 16px;
      }
      
      .btn table {
        width: auto;
      }
      
      .btn table td {
        background-color: #ffffff;
        border-radius: 4px;
        text-align: center;
      }
      
      .btn a {
        background-color: #ffffff;
        border: solid 2px #0867ec;
        border-radius: 4px;
        box-sizing: border-box;
        color: #0867ec;
        cursor: pointer;
        display: inline-block;
        font-size: 16px;
        font-weight: bold;
        margin: 0;
        padding: 12px 24px;
        text-decoration: none;
        text-transform: capitalize;
      }
      
      .btn-primary table td {
        background-color: #0867ec;
      }
      
      .btn-primary a {
        background-color: #0867ec;
        border-color: #0867ec;
        color: #ffffff;
      }
      
      @media all {
        .btn-primary table td:hover {
          background-color: #ec0867 !important;
        }
        .btn-primary a:hover {
          background-color: #ec0867 !important;
          border-color: #ec0867 !important;
        }
      }
      
      /* -------------------------------------
      OTHER STYLES THAT MIGHT BE USEFUL
  ------------------------------------- */
      
      .last {
        margin-bottom: 0;
      }
      
      .first {
        margin-top: 0;
      }
      
      .align-center {
        text-align: center;
      }
      
      .align-right {
        text-align: right;
      }
      
      .align-left {
        text-align: left;
      }
      
      .text-link {
        color: #0867ec !important;
        text-decoration: underline !important;
      }
      
      .clear {
        clear: both;
      }
      
      .mt0 {
        margin-top: 0;
      }
      
      .mb0 {
        margin-bottom: 0;
      }
      
      .preheader {
        color: transparent;
        display: none;
        height: 0;
        max-height: 0;
        max-width: 0;
        opacity: 0;
        overflow: hidden;
        mso-hide: all;
        visibility: hidden;
        width: 0;
      }
      
      .powered-by a {
        text-decoration: none;
      }
      
      /* -------------------------------------
      RESPONSIVE AND MOBILE FRIENDLY STYLES
  ------------------------------------- */
      
      @media only screen and (max-width: 640px) {
        .main p,
        .main td,
        .main span {
          font-size: 16px !important;
        }
        .wrapper {
          padding: 8px !important;
        }
        .content {
          padding: 0 !important;
        }
        .container {
          padding: 0 !important;
          padding-top: 8px !important;
          width: 100% !important;
        }
        .main {
          border-left-width: 0 !important;
          border-radius: 0 !important;
          border-right-width: 0 !important;
        }
        .btn table {
          max-width: 100% !important;
          width: 100% !important;
        }
        .btn a {
          font-size: 16px !important;
          max-width: 100% !important;
          width: 100% !important;
        }
      }
      /* -------------------------------------
      PRESERVE THESE STYLES IN THE HEAD
  ------------------------------------- */
      
      @media all {
        .ExternalClass {
          width: 100%;
        }
        .ExternalClass,
        .ExternalClass p,
        .ExternalClass span,
        .ExternalClass font,
        .ExternalClass td,
        .ExternalClass div {
          line-height: 100%;
        }
        .apple-link a {
          color: inherit !important;
          font-family: inherit !important;
          font-size: inherit !important;
          font-weight: inherit !important;
          line-height: inherit !important;
          text-decoration: none !important;
        }
        #MessageViewBody a {
          color: inherit;
          text-decoration: none;
          font-size: inherit;
          font-family: inherit;
          font-weight: inherit;
          line-height: inherit;
        }
      }
      </style>
    </head>
    <body>
      <table role="presentation" border="0" cellpadding="0" cellspacing="0" class="body">
        <tr>
          <td>&nbsp;</td>
          <td class="container">
            <div class="content">
  
              <!-- START CENTERED WHITE CONTAINER -->
              <span class="preheader">Se ha generado Ticket N° ${idTicketEntrada}</span>
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" class="main">
  
                <!-- START MAIN CONTENT AREA -->
                <tr>
                  <td class="wrapper">
                    <p><b>Hola ${responsableRetira} !<b></p>
                    <p>Se ha generado el ticket N° ${idTicketEntrada}, por el cual se ha creado materiales de las bodegas GOT, en este correo se adjunta en PDF el detalle del vale de salida de los materiales.</p>
                    
                    <p>Que tengas un buen dia.</p>
                   
                  </td>
                </tr>
  
                <!-- END MAIN CONTENT AREA -->
                </table>
  
              <!-- START FOOTER -->
              <div class="footer">
                <table role="presentation" border="0" cellpadding="0" cellspacing="0">
                  <tr>
                    <td class="content-block">
                      <span class="apple-link">Este correo ha sido generado automaticamente</span>
                      <br>
                       <span class="apple-link">Por sistema de control de stock Psinet</span>
                    </td>
                  </tr>
                  <tr>
                    <td class="content-block powered-by" style="font-size: 10px;">
                      Hecho con ❤️ <a  style="font-size: 10px;" href="https://github.com/benjamcadev">benjamcadev</a>
                    </td>
                  </tr>
                </table>
              </div>
  
              <!-- END FOOTER -->
              
  <!-- END CENTERED WHITE CONTAINER --></div>
          </td>
          <td>&nbsp;</td>
        </tr>
      </table>
    </body>
  </html>`

  return html
}




module.exports = { jsonToHtmlValeSalida, emailValeSalida, jsonToHtmlValeEntrada, emailValeEntrada }