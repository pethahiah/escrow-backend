const transporter = require('./mailconfig');

const Mail = (mailOptions) => {
    
    transporter.sendMail(mailOptions, function (err, info) {
        if(err) {}
        else
        {
            //console.log(info);
            return info;
        }
          
     });
}

module.exports = Mail;
