const nodemailer = require('nodemailer');

const sendEmailTicketSalida = async () => {

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: "bodegatica.dsal@gmail.com",
          pass: process.env.PASS_EMAIL,
        },
      });

      const mailOptions = {
        from: 'bodegatica.dsal@gmail.com',
        to: 'benjamin.cortes@psinet.cl',
        subject: 'Correo de prueba',
        text: 'Este es un correo de prueba',
        //html: `
        //  <h1>Sample Heading Here</h1>
        //  <p>message here</p>
        //`,
        // attachments: [
        //   {
        //     filename: 'image.png',
        //     path: 'https://www.google.com/images/branding/googlelogo/1x/googlelogo_color_272x92dp.png>'
        //   }
        // ]
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