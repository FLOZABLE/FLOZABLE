const express = require('express');
const Router = express.Router();
const cron = require('node-cron');
const pool = require('../model/pool');
const io = require('../app');
const webpush = require('web-push');
const crypto = require('crypto');
const API_KEY = process.env.SENDINBLUE_API;
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY;
const VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY;
const sendInBlue = require('sib-api-v3-sdk');
const sendinBlueClient = sendInBlue.ApiClient.instance;
sendinBlueClient.authentications['api-key'].apiKey = API_KEY;

const apiInstance = new sendInBlue.TransactionalEmailsApi();

const sendSmtpEmail = new sendInBlue.SendSmtpEmail();
sendSmtpEmail.from = { name: 'Flozable Study Reports', email: 'reports@flozable.com' };
sendSmtpEmail.to = [{ email: 'junjason1126@gmail.com', name: 'Jason' }];
sendSmtpEmail.templateId = 2;
//sendSmtpEmail.params = { 'date': '7/8', 'streak': '<p>🔥Streak of 8 Days!🔥</p>', 'ranking_compare': '+1', 'ranking': '#1', 'study_time_compare': '+1', 'study_time': '1', 'other_apps_compare': '1', 'other_apps': 'dd', 'focus_compare': '1hr', 'focus': '1hr', 'quote': 'gg' }; 
//sendSmtpEmail.dynamicTemplateData = { date: '7/8', 'streak': '<p>🔥Streak of 8 Days!🔥</p>', 'ranking_compare': '+1', 'ranking': '#1', 'study_time_compare': '+1', 'study_time': '1', 'other_apps_compare': '1', 'other_apps': 'dd', 'focus_compare': '1hr', 'focus': '1hr', 'quote': 'gg' }; 
sendSmtpEmail.dynamicTemplateData = {date : '7/8'}
/* apiInstance.sendTransacEmail(sendSmtpEmail).then(function(data) {
  console.log('Email sent successfully:', data);
}).catch(function(error) {
  console.error('Error sending email:', error);
}); */

//webpush
webpush.setVapidDetails('mailto: ', VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);
/* 
const payload = JSON.stringify({
  title: 'New Notification',
  body: 'Hello, you have a new notification!',
  // You can customize the notification payload as needed
});

// Here, you can loop through your list of subscribed users and send the notification to each one
// For demonstration purposes, we'll send to a single user:
const subscription = {
  endpoint: 'THE_ENDPOINT_URL_YOU_SAVED_FOR_THE_USER',
  keys: {
    auth: 'USER_AUTH_KEY',
    p256dh: 'USER_P256DH_KEY',
  },
};

webpush
.sendNotification(subscription, payload)
.then(() => {
  console.log('Notification sent successfully.');
  res.status(200).send('Notification sent successfully.');
})
.catch((error) => {
  console.error('Error sending push notification:', error);
  res.status(500).send('Error sending push notification.');
}); */

async function deriveKey(userId, key_salt) {
  return new Promise((resolve, reject) => {
    crypto.pbkdf2(userId, key_salt, 86736, 32, 'sha256', (err, derivedKey) => {
      if (err) {
        reject(err);
      } else {
        resolve(derivedKey.toString('hex'));
      }
    });
  });
}

const payload = JSON.stringify({
  title: 'New Notification',
  body: 'Hello, you have a new notification!',
  // You can customize the notification payload as needed
});

async function notificationService () {

  const connection = await (await pool).getConnection();
  a();
  const usersInfo = await connection.query('SELECT notification, timezone, plan, user_id, name, key_salt, iv, subscription from users');
  //console.log(io)
  io.emit('test', 'test');
  usersInfo.map(async(userInfo) => {
    const userId = userInfo.user_id;
    const keySalt = userInfo.key_salt;
    const iv = userInfo.iv;
    const subscription = userInfo.subscription;
    if (subscription == 0) {
      console.log(subscription)
      return 0;
    }
    const encryptKey = await deriveKey(userId, keySalt);
    //console.log(subscription);
    const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(encryptKey, 'hex'), Buffer.from(iv, 'hex'));
    let decryptedData = decipher.update(subscription, 'hex', 'utf8');
    decryptedData += decipher.final('utf8');
    
    decryptedData = JSON.parse(decryptedData);
    
    console.log(decryptedData);
    webpush.sendNotification(decryptedData)
    let notificationSettings;
    if (userInfo.notification == 'default_setting') {
      notificationSettings = [{id:0,name:'PlanNotifications',email:true,push:true,sms:false},{id:1,name:'AchievementCelebrations',email:true,push:true,sms:false},{id:2,name:'GroupStudyInvitations',email:true,push:true,sms:false},{id:3,name:'StudyProgressUpdates',email:true,push:true,sms:false},{id:4,name:'StudyChallengeNotifications',email:true,push:true,sms:false},{id:5,name:'RewardNotifications',email:true,push:true,sms:false},{id:6,name:'DeadlineReminders',email:true,push:true,sms:false},{id:7,name:'PersonalizedStudyRecommendations',email:true,push:true,sms:false},{id:8,name:'StudyBreakReminders',email:true,push:true,sms:false},{id:9,name:'TimeManagementTips',email:true,push:true,sms:false},{id:10,name:'DailyStudyReports',email:true,push:true,sms:false},{id:11,name:'WeeklyStudyReports',email:true,push:true,sms:false},{id:12,name:'MonthlyProgressReports',email:true,push:true,sms:false}];
    } else {
      notificationSettings = JSON.parse(userInfo.notification);
    }
    notificationSettings.map(notificationSetting => {
      if (notificationSetting.email) {

      }
      if (notificationSetting.push) {

      }

      if (notificationSetting.sms) {

      }
    })
    const timeZone = userInfo.timezone;
    const currentDate = new Date();
    const formattedTime = new Date(new Date().toLocaleString('en-US', { timeZone }));
    if(formattedTime.getHours() == 0) {
      
    }
  });
}

function a () {
  console.log('ddd')
}

Router.post('/subscribe', async(req, res) => {
  if (!req.session.loggedin) {
    return res.send({success: false, reason: 'no session'});
  }
  const userId = req.session.user_id;
  const subscriptionInfo = req.body.subscription;

  const connection = await (await pool).getConnection();

  let userInfo = await connection.query('SELECT user_id, key_salt, iv from users where user_id = ?', userId);
  userInfo = userInfo[0];

  const encryptKey = await deriveKey(userId, userInfo.key_salt);

  const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(encryptKey, 'hex'), Buffer.from(userInfo.iv, 'hex'));

  let encryptedData = cipher.update(JSON.stringify(subscriptionInfo), 'utf8', 'hex');
  encryptedData += cipher.final('hex');
  const update = connection.query('UPDATE users set ? where user_id = ?', [{subscription: encryptedData}, userId]);
  connection.release();
  console.log('Encrypted data:', encryptedData);
  res.send({success: true})
})

module.exports = {
  notificationService: notificationService,
  notificationRouter: Router
};

/* 
cron.schedule('* /60 * * * * *', async() => {
  console.log('d')
});
*/