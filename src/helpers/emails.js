const nodemailer = require('nodemailer');
const {emailValeSalida} = require('./generateHtml')

const sendEmailTicketSalida = async (responsePath, idTicket, request) => {

    let path_pdf = responsePath + '/ticket_salida_' + idTicket + '.pdf'

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: "bodegatica.dsal@gmail.com",
          pass: process.env.PASS_EMAIL,
        },
      });

      const mailOptions = {
        from: '"Bodegas GOT" <bodegatica.dsal@gmail.com>',
        to: 'benjamin.cortes@psinet.cl',
        //cc: ''
        subject: 'Vale de Salida Materiales',
        text: 'Texto de correo',
        html: emailValeSalida(idTicket, request.responsableRetira),
        attachments: [
          {
            filename: '/ticket_salida_' + idTicket + '.pdf',
            path: path_pdf
          }
        ]
      };

      transporter.sendMail(mailOptions, function(error, info){
        if (error) {
          console.log(error);
        } else {
          console.log('Email sent: ' + info.response);
        }
      });

}

module.exports = { sendEmailTicketSalida }