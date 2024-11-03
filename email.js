const sendInBlue = require("sib-api-v3-sdk");
const RESPONSE_MESSAGES = require("./utils/responses");

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
    return { success: true, status: 200, message: "Email Sent!" };
  } catch (err) {
    if (err?.response?.error?.text?.includes("email is not valid")) {
      return {
        success: false,
        message: "Invalid Email",
        status: err.response.error.status,
        error: err.response.error,
      };
    }

    return RESPONSE_MESSAGES.error();
  }
}

module.exports = { sendEmail };
