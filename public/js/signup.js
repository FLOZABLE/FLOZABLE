const notificationAlertSuccess = document.getElementById('notification-alert-success');
const notificationAlertFail = document.getElementById('notification-alert-fail');
const errMsgWrapper = document.getElementById('err-msg');
const successMsgWrapper = document.getElementById('success-msg');

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

const signUpSubmitBtn = document.querySelector('#signup-submit');

const nameContainer = document.querySelector("input#name");
const emailContainer = document.querySelector("input#email");
const passwordContainer = document.querySelector("input#password");

function getUserTimezone() {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch (error) {
    console.error('Intl.DateTimeFormat not supported:', error);
    return 'UTC';
  }
}

signUpSubmitBtn.addEventListener('click', async() => {
  let redirectUrl = window.location.protocol + '//' + window.location.hostname;
  const match = window.location.href.match(/[\?&]redirect=([^&#]*)/);
  const parameterValue = match ? match[1] : null;
  const timeZone = getUserTimezone();
  if(parameterValue){
    redirectUrl += '/' + parameterValue;
  }
  let response = await fetch('/account/signup-authentication', {
    method: 'post',
    body: JSON.stringify({name: nameContainer.value, email: emailContainer.value, password: passwordContainer.value, redirectUrl: redirectUrl, timeZone: timeZone}),
    headers: {
      'Content-Type': 'application/json'
    }
  });
  response  = await response.json();
  console.log(response);

  if(response.success == true){
    setTimeout(function() {
      window.location.href = redirectUrl;
    }, 500); 
  } else {
    errMsg(response.reason)
  }
})