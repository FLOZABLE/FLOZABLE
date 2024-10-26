const sendInBlue = require("sib-api-v3-sdk");
const { RESPONSE_CODES } = require("./Constant");

const SENDINBLUE_API = process.env.SENDINBLUE_API;
const sendinBlueClient = sendInBlue.ApiClient.instance;
sendinBlueClient.authentications["api-key"].apiKey = SENDINBLUE_API;
const emailInstance = new sendInBlue.TransactionalEmailsApi();

async function sendEmail(to, params, id) {
  try {
    const sendSmtpEmail = new sendInBlue.SendSmtpEmail();
    sendSmtpEmail.to = to;
    sendSmtpEmail.templateId = id;
    sendSmtpEmail.params = params;

    const data = await emailInstance.sendTransacEmail(sendSmtpEmail);
    console.log("Email sent successfully:", data);
    return { success: true, data };
  } catch (err) {
    console.log(err);
    const response = err?.response?.text
      ? JSON.parse(err.response.text)
      : RESPONSE_CODES.error;
    return response;
  }
}

module.exports = { sendEmail };
