//profile image upload
const readURL = function (input) {
  if (input.files && input.files[0]) {
    let reader = new FileReader();
    reader.readAsDataURL(input.files[0]);
    reader.onload = function (e) {
      document.querySelector('.profile_pic').setAttribute('src', e.target.result);
      const formData = new FormData();
      formData.append('image', input.files[0]);

      uploadImage(formData); // Call the function to upload the image to the server
    };
  }
};

async function uploadImage(formData) {
  try {
    let response = await fetch('/account/update/image', {
      method: 'POST',
      body: formData,
    });

    response = await response.json();

    if(response.success) {
      successMsg('Updated Profile Image!');
    } else {
      errMsg(response.reason);
    }
  } catch (error) {
    console.error('Error uploading image:', error);
  }
};

//update info

const updateInfoBtn = document.getElementById('updateProfile');

const nameWrapper = document.getElementById('name');
const emailWrapper = document.getElementById('email');
const emailConfirmWrapper = document.getElementById('email-confirm');
const languageWrapper = document.getElementById('choices-language');
const interestWrapper = document.getElementById('interest');

updateInfoBtn.addEventListener('click', async () => {
  const name = nameWrapper.value;
  const email = emailWrapper.value;
  const emailConfirm = emailConfirmWrapper.value;
  const language = languageWrapper.value;
  const interest = interestWrapper.value;

  let response = await fetch('/account/update/info', 
  {
    method : 'POST',
    headers : {
      'Content-Type': 'application/json'
    },
      body : JSON.stringify({ name: name, email: email, emailConfirm: emailConfirm, language: language, interest: interest })
    }
  );
  response = await response.json();
  if (response.success) {
    successMsg('Updated Info!');
  } else {
    errMsg(response.reason);
  }
  console.log(name, email, interest, emailConfirm, language)
})



document.querySelector(".file-upload").addEventListener('change', function () {
  readURL(this);
});

document.querySelector(".upload-button").addEventListener('click', function () {
  document.querySelector(".file-upload").click();
});

const addWebsiteBtn = document.getElementById('addWebsite');
const addWebsiteInput = document.getElementById('addWebsiteInput');

const notificationAlertSuccess = document.getElementById('notification-alert-success');
const notificationAlertFail = document.getElementById('notification-alert-fail');
const errMsgWrapper = document.getElementById('err-msg');
const successMsgWrapper = document.getElementById('success-msg');
const websitesWrapper = document.getElementById('extension-website-wrapper');

addWebsiteBtn.addEventListener('click', async () => {
  try {
    let response = await fetch('/update/extension-add', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ url: addWebsiteInput.value })
    })
    response = await response.json();
    if (response.success) {
      console.log(response.origin, response.domain)
      const tr = document.createElement('tr');
      tr.innerHTML = `
      <td class="ps-1" colspan="4">
        <div class="my-auto">
          <span class="text-dark d-block text-sm">${response.domain}</span>
          <span class="text-xs font-weight-normal">Notify when another user mentions you in a
            comment</span>
        </div>
      </td>
      <td>
        <div class="form-check form-switch mb-0 d-flex align-items-center justify-content-center">
          <input class="form-check-input" checked type="checkbox" id="flexSwitchCheckDefault11">
        </div>
      </td>
      <td>
        <div class="form-check form-switch mb-0 d-flex align-items-center justify-content-center">
          <input class="form-check-input" type="checkbox" id="flexSwitchCheckDefault12">
        </div>
      </td>
      `
      websitesWrapper.appendChild(tr);
      successMsg('Updated Profile Image!');
    } else {
      console.log(response)
      errMsg(response.reason)
    }
  } catch (error) {
    console.log(error)
    errMsg('Error')
  }
});

//bring extension setting

let activitySettings;

(async () => {
  let response = await fetch('/api//bring-activity-setting', {
    method: 'post',
    headers: {
      'Content-Type': 'application/json'
    }
  });

  response = await response.json();
  if (response.success) {
    console.log(JSON.parse(response.activitySetting))
    activitySettings = JSON.parse(response.activitySetting);
    activitySettings.map(activitySetting => {
      console.log(activitySetting.block ? 'checked' : '')
      const tr = document.createElement('tr');
      tr.innerHTML = `
      <td class="ps-1" colspan="4">
        <div class="my-auto">
          <span class="text-dark d-block text-sm">${activitySetting.domain}</span>
          <span class="text-xs font-weight-normal"></span>
        </div>
      </td>
      <td>
        <div class="form-check form-switch mb-0 d-flex align-items-center justify-content-center">
          <input class="form-check-input" type="checkbox" id="flexSwitchCheckDefault11" ${activitySetting.block ? 'checked' : ''}>
        </div>
      </td>
      <td>
        <div class="form-check form-switch mb-0 d-flex align-items-center justify-content-center">
          <input class="form-check-input" type="checkbox" id="flexSwitchCheckDefault12" ${activitySetting.timer ? 'checked' : ''}>
        </div>
      </td>
      `
      const blockOptBtn = tr.querySelector('#flexSwitchCheckDefault11');
      const timerOptBtn = tr.querySelector('#flexSwitchCheckDefault12');

      blockOptBtn.addEventListener('change', () => {
        if (blockOptBtn.checked) {
          activitySetting.block = true;
        } else {
          activitySetting.block = false;
        }
      });

      timerOptBtn.addEventListener('change', () => {
        if (timerOptBtn.checked) {
          activitySetting.timer = true;
        } else {
          activitySetting.timer = false;
        }
      })
      websitesWrapper.appendChild(tr);
    })
  };
})();

let notificationSettings;
let notificationsCont = document.querySelector('#notificationsCont');

(async() => {
  let response = await fetch('/account/notification-setting', {
    method : 'POST',
    headers : {
      'Content-Type' : 'application/json'
    }
  });

  response = await response.json();
  console.log(response)
  if (response.notification == 'default_setting') {
    notificationSettings = [{id:0,name:'PlanNotifications',email:true,push:true,sms:false},{id:1,name:'AchievementCelebrations',email:true,push:true,sms:false},{id:2,name:'GroupStudyInvitations',email:true,push:true,sms:false},{id:3,name:'StudyProgressUpdates',email:true,push:true,sms:false},{id:4,name:'StudyChallengeNotifications',email:true,push:true,sms:false},{id:5,name:'RewardNotifications',email:true,push:true,sms:false},{id:6,name:'DeadlineReminders',email:true,push:true,sms:false},{id:7,name:'PersonalizedStudyRecommendations',email:true,push:true,sms:false},{id:8,name:'StudyBreakReminders',email:true,push:true,sms:false},{id:9,name:'TimeManagementTips',email:true,push:true,sms:false},{id:10,name:'DailyStudyReports',email:true,push:true,sms:false},{id:11,name:'WeeklyStudyReports',email:true,push:true,sms:false},{id:12,name:'MonthlyProgressReports',email:true,push:true,sms:false}]
  } else {
    notificationSettings = JSON.parse(response.notification);
  }

  notificationSettings.map(notificationSetting => {
    const notificationSettingCont = notificationsCont.querySelector(`#notification-${notificationSetting.id}`);
    const emailBtn = notificationSettingCont.querySelector('#flexSwitchCheckDefault11');
    const pushBtn = notificationSettingCont.querySelector('#flexSwitchCheckDefault12');
    const smsBtn = notificationSettingCont.querySelector('#flexSwitchCheckDefault13');

    if (notificationSetting.email) {
      emailBtn.checked = true;
    } else {
      emailBtn.checked = false;
    };

    if (notificationSetting.push) {
      pushBtn.checked = true;
    } else {
      pushBtn.checked = false;
    };

    if (notificationSetting.sms) {
      smsBtn.checked = true;
    } else {
      smsBtn.checked = false;
    };

    emailBtn.addEventListener('change', () => {
      if (emailBtn.checked) {
        notificationSetting.email = true;
      } else {
        notificationSetting.email = false;
      }
    });

    pushBtn.addEventListener('change', () => {
      if (pushBtn.checked) {
        notificationSetting.push = true;
      } else {
        notificationSetting.push = false;
      }
    });

    smsBtn.addEventListener('change', () => {
      if (smsBtn.checked) {
        notificationSetting.sms = true;
      } else {
        notificationSetting.sms = false;
      }
    });
  });

})();

function successMsg(msg) {
  successMsgWrapper.innerText = msg;
  notificationAlertSuccess.classList.remove('notify');
  notificationAlertSuccess.offsetHeight;
  notificationAlertSuccess.classList.add('notify');
}

function errMsg(msg) {
  errMsgWrapper.innerText = msg;
  notificationAlertFail.classList.remove('notify');
  notificationAlertFail.offsetHeight;
  notificationAlertFail.classList.add('notify');
}

const extSettingBtn = document.getElementById('updateExtSetting');

extSettingBtn.addEventListener('click', async() => {
  
  let response = await fetch ('/account/update/extension-setting-update', {
    method : 'POST',
    headers: {
      'Content-Type' : 'application/json'
    },
    body: JSON.stringify({ activitySettings : activitySettings})
  });

  response = await response.json();

  if (response.success) {
    successMsg('Updated Extension Settings!');
  } else {
    errMsg(response.reason);
  }
});

const passwordInput = document.getElementById('password-input');
const passwordConfirmInput = document.getElementById('password-confirm');
const passwordUpdBtn = document.getElementById('updPwdBtn');

passwordUpdBtn.addEventListener('click', async() => {
  const password = passwordInput.value;
  const passwordConfirm = passwordConfirmInput.value;

  let response = await fetch('/account/update/password', {
    method : 'POST',
    headers : {
      'Content-Type' : 'application/json'
    },
    body : JSON.stringify({ password : password, passwordConfirm : passwordConfirm })
  });

  response = await response.json();

  if (response.success) {
    successMsg('Updated password!');
  } else {
    errMsg(response.reason);
  }
});

const notificationUpdBtn = document.getElementById('updNotificationSetting');

notificationUpdBtn.addEventListener('click', async() => {
  let response = await fetch('/account/update/notification', {
    method : 'POST',
    headers : {
      'Content-Type' : 'application/json'
    },
    body : JSON.stringify({ notificationSettings : notificationSettings })
  });

  response = await response.json();

  if (response.success) {
    successMsg('Updated Notifications!');
    if ('Notification' in window) {
      // Check if the browser supports notifications
    
      Notification.requestPermission().then(function (permission) {
        if (permission === 'granted') {
        } else if (permission === 'denied') {
          setTimeout(() => {
            errMsg('Enable Notifications to receive Push Notifications!');
          }, 3000);
        }
        console.log(permission)
      });
    }
  } else {
    errMsg(response.reason);
  }
});