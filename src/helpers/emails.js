const nodemailer = require('nodemailer');
const fs = require('fs');
const { emailValeSalida, emailValeEntrada, emailForgetPass, emailNewPass } = require('./generateHtml')

const sendEmailTicketSalida = async (responsePath, idTicket, request) => {

    let path_pdf = responsePath + '/ticket_salida_' + idTicket + '.pdf'


    const transporter = nodemailer.createTransport({
      service: "Gmail",
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: "bodega.got@gmail.com",
        pass: "eubu dqiv heoy cipz",

      },
    });
  
    const mailOptions = {
      from: '"Bodegas GOT" <bodega.got@gmail.com>',
      to: `"${request.responsableRetira}" <${request.responsableRetiraCorreo}>`,
      cc: 'benjamin.cortes@psinet.cl',
      subject:`Ticket De Salida #${idTicket} - Bodegas GOT`,
      text: `Salida de Materiales en el Ticket ${idTicket}`,
      html: emailValeSalida(idTicket, request.responsableRetira),
      attachments: [
        {
          filename: '/ticket_salida_' + idTicket + '.pdf',
          path: path_pdf
        }
      ],
      //charset: 'UTF-8', // Equivalente a $mail->CharSet
      //encoding: 'base64', // Equivalente a $mail->Encoding
      //headers: {
        //"Content-Type": "text/html",
      //}
    };
  
    transporter.sendMail(mailOptions, function(error, info){
      if (error) {
        console.log(error);
      } else {
        console.log('Email sent: ' + info.response);
        //console.log( request.responsableRetiraCorreo)
        //console.log( request.responsableEntregaCorreo)
      }
    });
     
}

const sendEmailTicketEntrada = async (responsePath, idTicketEntrada, request, imagePath) => {
  
  let path_pdf = responsePath + '/ticket_entrada_' + idTicketEntrada + '.pdf'
  let path_image = responsePath + '/foto_documentos_' + idTicketEntrada + '.png'

  // const transporter = nodemailer.createTransport({
  //     service: 'gmail',
  //     auth: {
  //       user: "



  const transporter = nodemailer.createTransport({
    service: "Gmail",
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: "bodega.got@gmail.com",
      pass: "eubu dqiv heoy cipz",

    },
  });

  const attachments = [
    {
      filename: '/ticket_entrada_' + idTicketEntrada + '.pdf',
      path: path_pdf
    }
  ];

  // Verificar si la imagen existe antes de añadirla a los attachments
  if (fs.existsSync(path_image)) {
    attachments.push({
      filename: '/foto_documentos_' + idTicketEntrada + '.png',
      path: path_image
    });
  }


    
  const mailOptions = {
    from: '"Bodegas GOT" <bodega.got@gmail.com>',
    to: `"${request.responsableRetira}" <${request.responsableRetiraCorreo}>`,
    cc: 'benjamin.cortes@psinet.cl',
    subject:`Ticket De Entrada #${idTicketEntrada} - Bodegas GOT`,
    text: 'Texto de correo',
    html: emailValeEntrada(idTicketEntrada, request.responsableRetira),
    attachments: attachments
  };

  transporter.sendMail(mailOptions, function(error, info){
    if (error) {
      console.log(error);
    } else {
      console.log('Email sent: ' + info.response);
    }
  });
}

const sendEmailForgetPass = async (user) => {

  

  const transporter = nodemailer.createTransport({
    service: "Gmail",
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: "bodega.got@gmail.com",
      pass: "eubu dqiv heoy cipz",

    },
  });

  const mailOptions = {
    from: '"Bodegas GOT" <bodega.got@gmail.com>',
    to: `"${user[0].nombre}" <${user[0].correo}>`,
    cc: 'benjamin.cortes@psinet.cl',
    subject:`Recuperacion de cuenta - Sistema CDS`,
    text: 'Texto de correo',
    html: emailForgetPass(user)
  };

  transporter.sendMail(mailOptions, function(error, info){
    if (error) {
      console.log(error);
    } else {
      console.log('Email sent: ' + info.response);
    }
  });




}

const sendEmailNewPass = async (correo) => {
  const transporter = nodemailer.createTransport({
    service: "Gmail",
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: "bodega.got@gmail.com",
      pass: "eubu dqiv heoy cipz",

    },
  });

  const mailOptions = {
    from: '"Bodegas GOT" <bodega.got@gmail.com>',
    to: `<${correo}>`,
    cc: 'benjamin.cortes@psinet.cl',
    subject:`Contraseña Cambiada - Sistema CDS`,
    text: 'Texto de correo',
    html: emailNewPass(correo)
  };

  transporter.sendMail(mailOptions, function(error, info){
    if (error) {
      console.log(error);
    } else {
      console.log('Email sent: ' + info.response);
    }
  });


}
module.exports = { sendEmailTicketSalida, sendEmailTicketEntrada, sendEmailForgetPass, sendEmailNewPass }