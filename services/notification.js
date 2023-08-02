const express = require('express');
const Router = express.Router();
const cron = require('node-cron');
const pool = require('../model/pool');
const io = require('../app');
const webpush = require('web-push');
const crypto = require('crypto');
const schedule = require('node-schedule');
const API_KEY = process.env.SENDINBLUE_API;
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY;
const VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY;
const sendInBlue = require('sib-api-v3-sdk');
const sendinBlueClient = sendInBlue.ApiClient.instance;
sendinBlueClient.authentications['api-key'].apiKey = API_KEY;

const apiInstance = new sendInBlue.TransactionalEmailsApi();

webpush.setVapidDetails('mailto: ', VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);


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

let notificationSettings;

async function notificationService () {
  const now = new Date().getTime();
  const connection = await (await pool).getConnection();
  const usersInfo = await connection.query('SELECT notification_setting, notifications, timezone, plan, user_id, name, key_salt, iv, subscription from users');
  
  usersInfo.map(async(userInfo, index) => {
    const userId = userInfo.user_id;
    /* const keySalt = userInfo.key_salt;
    const iv = userInfo.iv;
    const subscription = userInfo.subscription;

    if (subscription == 0) {
      console.log(subscription)
      return 0;
    }
    const encryptKey = await deriveKey(userId, keySalt);
    const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(encryptKey, 'hex'), Buffer.from(iv, 'hex'));
    let decryptedData = decipher.update(subscription, 'hex', 'utf8');
    decryptedData += decipher.final('utf8');
    
    decryptedData = JSON.parse(decryptedData); */
    const decryptedData = await getSubscription(userInfo);
    //webpush.sendNotification(decryptedData)
    if (userInfo.notification_setting == 'default_setting') {
      notificationSettings = [{id:0,name:'PlanNotifications',email:true,push:true,sms:false},{id:1,name:'AchievementCelebrations',email:true,push:true,sms:false},{id:2,name:'GroupStudyInvitations',email:true,push:true,sms:false},{id:3,name:'StudyProgressUpdates',email:true,push:true,sms:false},{id:4,name:'StudyChallengeNotifications',email:true,push:true,sms:false},{id:5,name:'RewardNotifications',email:true,push:true,sms:false},{id:6,name:'DeadlineReminders',email:true,push:true,sms:false},{id:7,name:'PersonalizedStudyRecommendations',email:true,push:true,sms:false},{id:8,name:'StudyBreakReminders',email:true,push:true,sms:false},{id:9,name:'TimeManagementTips',email:true,push:true,sms:false},{id:10,name:'DailyStudyReports',email:true,push:true,sms:false},{id:11,name:'WeeklyStudyReports',email:true,push:true,sms:false},{id:12,name:'MonthlyProgressReports',email:true,push:true,sms:false}];
    } else {
      notificationSettings = JSON.parse(userInfo.notification_setting);
    }

    const plans = JSON.parse(`[${userInfo.plan}]`);
    console.log(now)
    plans.map(async(plan) => {
      const startTime = (plan.date + plan.hr * 60 * 60 + plan.min * 60) * 1000;
      console.log(startTime);
      if (startTime < now) {
        console.log('past', startTime)
      } else {
        console.log('new', plan);
        let notifications = JSON.parse(userInfo.notifications);
        planNotification(plan, userInfo, startTime, decryptedData);
        notifications.push(plan.id);
        const updateInfo = [{ notifications: JSON.stringify(notifications) }, userId];
        connection.query('UPDATE users SET ? WHERE user_id = ?', updateInfo);
      }
    })
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
};

//const params = { date: '7/8', streak: '🔥Streak of 8 Days!🔥', ranking_compare: '+1', ranking: '#1', study_time_compare: '+1', study_time: '1', other_apps_compare: '1', other_apps: 'dd', focus_compare: '1hr', focus: '1hr', quote: 'gg' }; 

function planNotification(plan, userInfo, startTime, decryptedData) {
  console.log(userInfo.user_id)
  let schduleNotification = schedule.scheduleJob(plan.id, new Date(startTime), async() => {
    //remove notifications
    
    const notificationSettings = await removeNotification(userInfo.user_id, plan.id);
    //email
    if (notificationSettings[0].email) {
      const to = [{ email: 'junjason1126@gmail.com', name: 'Jason' }];
      let startHr = plan.hr;
      let startMin = plan.min;
      let ampm = 'am';
      if (startHr == 12) {
        ampm = 'pm';
      }

      while (startHr > 12) {
        ampm = 'pm';
        startHr -= 12;
      }

      const dispTime = `${startHr}:${startMin.toString().padStart(2, '0')}${ampm}`;
      const params = { plan_name: plan.name, plan_time: dispTime, plan_description: plan.description}; 
      const id = 2;
      sendEmail(to, params, id);
    };

    //push
    if (notificationSettings[0].push) {
      if (!decryptedData) {
        decryptedData = await getSubscription(userInfo);
      }

      let dispStartHr = plan.hr;
      let dispStartMin = plan.min;
      let endTime = plan.hr + plan.min * 60 + plan.length;
      let dispEndHr = Math.floor(endTime / 60);
      let dispEndMin = endTime % 60;
      let startampm = 'am';
      let endampm = 'am';

      if( dispStartHr == 12 ) {
        startampm = 'pm';
      }

      if (dispEndHr == 12) {
        endampm = 'pm';
      }

      while (dispStartHr > 12) {
        dispStartHr -= 12;
        startampm = 'pm'
      }
      
      while (dispEndHr > 12) {
        dispEndHr -= 12;
        endampm = 'pm';
      }

      const dispTime = `${dispStartHr}:${dispStartMin.toString().padStart(2, '0')}${startampm} - ${dispEndHr}:${dispEndMin.toString().padStart(2, 0)}${endampm}`;
      const payload = JSON.stringify({
        title: plan.name,
        body: dispTime,
        icon: '/img/logo.png',
        actions: [
          { action: 'reply', title: 'Reply' },
          { action: 'archive', title: 'Archive' }
        ],
        data: {
          link: 'https://flozable.com/study'
        }
      });
      webpush.sendNotification(decryptedData, payload);
    }

    //sms
  });
}

async function removeNotification(userId, planId) {
  const connection = await (await pool).getConnection();
  let userInfo = await connection.query('SELECT notification_setting, notifications from users where user_id = ?', [userId]);
  userInfo = userInfo[0];

  let notificationSettings;
  if (userInfo.notification_setting == 'default_setting') {
    notificationSettings = [{id:0,name:'PlanNotifications',email:true,push:true,sms:false},{id:1,name:'AchievementCelebrations',email:true,push:true,sms:false},{id:2,name:'GroupStudyInvitations',email:true,push:true,sms:false},{id:3,name:'StudyProgressUpdates',email:true,push:true,sms:false},{id:4,name:'StudyChallengeNotifications',email:true,push:true,sms:false},{id:5,name:'RewardNotifications',email:true,push:true,sms:false},{id:6,name:'DeadlineReminders',email:true,push:true,sms:false},{id:7,name:'PersonalizedStudyRecommendations',email:true,push:true,sms:false},{id:8,name:'StudyBreakReminders',email:true,push:true,sms:false},{id:9,name:'TimeManagementTips',email:true,push:true,sms:false},{id:10,name:'DailyStudyReports',email:true,push:true,sms:false},{id:11,name:'WeeklyStudyReports',email:true,push:true,sms:false},{id:12,name:'MonthlyProgressReports',email:true,push:true,sms:false}];
  } else {
    notificationSettings = JSON.parse(userInfo.notification_setting);
  }

  let notifications = JSON.parse(userInfo.notifications);
  notifications = notifications.filter(notification => notification !== planId);

  console.log(notifications)
  const updateInfo = [{ notifications: JSON.stringify(notifications) }, userInfo.userId];
  const update = await connection.query('UPDATE users SET ? WHERE user_id = ?', updateInfo);
  connection.release();
  return notificationSettings;
}

async function getSubscription(userInfo) {
  const userId = userInfo.user_id;
  const keySalt = userInfo.key_salt;
  const iv = userInfo.iv;
  const subscription = userInfo.subscription;

  if (subscription == 0) {
    console.log(subscription)
    return 0;
  }
  const encryptKey = await deriveKey(userId, keySalt);
  const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(encryptKey, 'hex'), Buffer.from(iv, 'hex'));
  let decryptedData = decipher.update(subscription, 'hex', 'utf8');
  decryptedData += decipher.final('utf8');
  
  decryptedData = JSON.parse(decryptedData); 

  return decryptedData;
}




function sendEmail(to, params, id) {
  const sendSmtpEmail = new sendInBlue.SendSmtpEmail();
  sendSmtpEmail.to = to;
  sendSmtpEmail.templateId = id;
  sendSmtpEmail.params = params;
  apiInstance.sendTransacEmail(sendSmtpEmail).then(function(data) {
    console.log('Email sent successfully:', data);
  }).catch(function(error) {
    console.error('Error sending email:', error);
  });
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
});

module.exports = {
  notificationService: notificationService,
  notificationRouter: Router,
  planNotification: planNotification
};

/* 
cron.schedule('* /60 * * * * *', async() => {
  console.log('d')
});
*/