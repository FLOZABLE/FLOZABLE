const sendInBlue = require('sib-api-v3-sdk');

const SENDINBLUE_API = process.env.SENDINBLUE_API;
const sendinBlueClient = sendInBlue.ApiClient.instance;
sendinBlueClient.authentications['api-key'].apiKey = SENDINBLUE_API;
const emailInstance = new sendInBlue.TransactionalEmailsApi();


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