const { emailInstance } = require('./app');
const sendInBlue = require('sib-api-v3-sdk');

function sendEmail(to, params, id) {
  try {
    const sendSmtpEmail = new sendInBlue.SendSmtpEmail();
    sendSmtpEmail.to = to;
    sendSmtpEmail.templateId = id;
    sendSmtpEmail.params = params;
    emailInstance.sendTransacEmail(sendSmtpEmail).then(function (data) {
      console.log('Email sent successfully:', data);
    }).catch(function (error) {
      console.error('Error sending email:', error);
    });
  } catch (err) {
    console.log(err);
  };
};

module.exports = {sendEmail};