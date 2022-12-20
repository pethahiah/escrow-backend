const Mail = require('./sendmail');
const GetMessage = require('./mail_message');
const Mailbuilder = require('./mailbuilder');

 const ProcessMail = (type,email,code,firstname, invite) =>  {
    const message = GetMessage(type,code,invite, firstname); 
    const mailData = Mailbuilder(email,type,message)
    const response = Mail(mailData);
    return response;
}

module.exports = ProcessMail;
