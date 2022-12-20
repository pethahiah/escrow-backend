const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    port: 465,  
    host: process.env.HOST,
       auth: {
            user: process.env.EMAIL,
            pass: process.env.PASS,
         },
         tls: {
            rejectUnauthorized: false
        },
    secure: true,
    });

module.exports = transporter;    