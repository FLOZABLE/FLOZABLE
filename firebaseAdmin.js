const admin = require("firebase-admin");
const serviceAccount = require("./config/flozable-firebase-adminsdk-ui07u-9acca495d9.json"); // Path to the downloaded JSON file

const firebase = admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

module.exports = firebase;
