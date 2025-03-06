const nodemailer = require('nodemailer');
const axios = require('axios').default;
const fs = require('fs');
const { emailValeSalida, emailValeEntrada, emailForgetPass, emailNewPass, emailTicketAbierto } = require('./generateHtml')

const sendEmailTicketSalida = async (responsePath, idTicket, request) => {

  let path_pdf = responsePath + '/ticket_salida_' + idTicket + '.pdf';
  let base64pdf = '';

  //convertir pdf a base64
  try {
    base64pdf = 'data:application/pdf;base64,' + fs.readFileSync(path_pdf, { encoding: 'base64' });
  } catch (err) {
    console.error(err)
  }

  const mailOptions = {
    from: '"Bodegas GOT" <bodega.got@gmail.com>',
    to: `"${request.responsableRetira}" <${request.responsableRetiraCorreo}>`,
    cc: 'benjamin.cortes@psinet.cl',
    subject: `Ticket De Salida #${idTicket} - Bodegas GOT`,
    text: `Salida de Materiales en el Ticket ${idTicket}`,
    html: emailValeSalida(idTicket, request.responsableRetira),
    attachments: [
      {
        filename: '/ticket_salida_' + idTicket + '.pdf',
        content: base64pdf.split("base64,")[1],
        encoding: 'base64'
      }
    ],

  };

  //PARSEAR A JSON EL OBJETO
  const jsonEmailOptions = JSON.stringify(mailOptions);

  const response = await axios.post(process.env.HOST_EMAIL, jsonEmailOptions, {
    headers: {
      'Content-Type': 'application/json'
    }
  }).then((res) => {
    if (res.status == 200) {
      return res
    }
  }).catch((error) => {
    return error.response
  })

}

const sendEmailTicketEntrada = async (responsePath, idTicketEntrada, request, imagePath) => {

  let path_pdf = responsePath + '/ticket_entrada_' + idTicketEntrada + '.pdf'
  let path_image = responsePath + '/foto_documentos_' + idTicketEntrada + '.png'

  try {
    base64pdf = 'data:application/pdf;base64,' + fs.readFileSync(path_pdf, { encoding: 'base64' });
  } catch (err) {
    console.error(err)
  }

  const attachments = [
    {
      filename: '/ticket_entrada_' + idTicketEntrada + '.pdf',
      content: base64pdf.split("base64,")[1],
      encoding: 'base64'
    }
  ];

  // Verificar si la imagen existe antes de añadirla a los attachments
  if (fs.existsSync(path_image)) {
    base64png = 'data:image/png;base64,' + fs.readFileSync(path_pdf, { encoding: 'base64' });
    attachments.push({
      filename: '/foto_documentos_' + idTicketEntrada + '.png',
      content: base64png.split("base64,")[1],
      encoding: 'base64'
    });
  }

  const mailOptions = {
    from: '"Bodegas GOT" <bodega.got@gmail.com>',
    to: `"${request.responsableRetira}" <${request.responsableRetiraCorreo}>`,
    cc: 'benjamin.cortes@psinet.cl',
    subject: `Ticket De Entrada #${idTicketEntrada} - Bodegas GOT`,
    text: 'Texto de correo',
    html: emailValeEntrada(idTicketEntrada, request.responsableRetira),
    attachments: attachments
  };

  //PARSEAR A JSON EL OBJETO
  const jsonEmailOptions = JSON.stringify(mailOptions);

  const response = await axios.post(process.env.HOST_EMAIL, jsonEmailOptions, {
    headers: {
      'Content-Type': 'application/json'
    }
  }).then((res) => {
    if (res.status == 200) {
      return res
    }
  }).catch((error) => {
    return error.response
  })

 
}

const sendEmailForgetPass = async (user) => {

  const mailOptions = {
    from: '"Bodegas GOT" <bodega.got@gmail.com>',
    to: `"${user[0].nombre}" <${user[0].correo}>`,
    cc: 'benjamin.cortes@psinet.cl',
    subject: `Recuperacion de cuenta - Sistema CDS`,
    text: 'Texto de correo',
    html: emailForgetPass(user)
  };

  //PARSEAR A JSON EL OBJETO
  const jsonEmailOptions = JSON.stringify(mailOptions);

  const response = await axios.post(process.env.HOST_EMAIL, jsonEmailOptions, {
    headers: {
      'Content-Type': 'application/json'
    }
  }).then((res) => {
    if (res.status == 200) {
      return res
    }
  }).catch((error) => {
    return error.response
  })
}

const sendEmailNewPass = async (correo) => {
  

  const mailOptions = {
    from: '"Bodegas GOT" <bodega.got@gmail.com>',
    to: `<${correo}>`,
    cc: 'benjamin.cortes@psinet.cl',
    subject: `Contraseña Cambiada - Sistema CDS`,
    text: 'Texto de correo',
    html: emailNewPass(correo)
  };

  //PARSEAR A JSON EL OBJETO
  const jsonEmailOptions = JSON.stringify(mailOptions);

  const response = await axios.post(process.env.HOST_EMAIL, jsonEmailOptions, {
    headers: {
      'Content-Type': 'application/json'
    }
  }).then((res) => {
    if (res.status == 200) {
      return res
    }
  }).catch((error) => {
    return error.response
  })


}

const sendEmailTicketPendiente = async (responsePath, idTicket, request) => {

  const mailOptions = {
    from: '"Bodegas GOT" <bodega.got@gmail.com>',
    to: `"${request.responsableRetira}" <${request.responsableRetiraCorreo}>`,
    cc: 'benjamin.cortes@psinet.cl',
    subject: `Ticket Pendiente De Firma - Sistema CDS`,
    text: '',
    html: emailTicketAbierto(idTicket, request.responsableRetira,request.responsableRetiraCorreo)
  };

  //PARSEAR A JSON EL OBJETO
  const jsonEmailOptions = JSON.stringify(mailOptions);

  const response = await axios.post(process.env.HOST_EMAIL, jsonEmailOptions, {
    headers: {
      'Content-Type': 'application/json'
    }
  }).then((res) => {
    if (res.status == 200) {
      return res
    }
  }).catch((error) => {
    return error.response
  })
}


module.exports = { sendEmailTicketSalida, sendEmailTicketEntrada, sendEmailForgetPass, sendEmailNewPass, sendEmailTicketPendiente }