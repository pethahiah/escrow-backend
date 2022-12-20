const html = require('./email_template');
const MailData = (to,subject,message) => {
    const data = {
      from: 'omotayodeveloper@gmail.com',  // sender address
      to: to,   // list of receivers
      subject: subject,
      text: '',
      html: html(message)
    }

    return data;
}   
    
module.exports = MailData;