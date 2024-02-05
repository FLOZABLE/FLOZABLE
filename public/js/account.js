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

const accountButton = document.getElementById("account");
let isSignIn = true;
const accountModal = document.getElementById('accountModal');
const dispBlock = document.getElementById('dispBlock');

accountButton.addEventListener('click', async () => {
  if (typeof isLogged && isLogged) {
    await fetch('/account/logout', {
      method: 'get',
    })
    window.location.href = window.location.origin;
    /* .then((response) => response.json())
    .then((data) => {
      console.log(data);
    })  */
  } else {
    dispBlock.classList.toggle('visible');
    accountModal.classList.toggle('visible');
  }
});


const signInBtn = document.getElementById("signin");
const signUpBtn = document.getElementById("signup");

signInBtn.addEventListener('click', async () => {
  const email = document.querySelector('.card-front #logemail').value;
  const password = document.querySelector('.card-front #logpass').value;
  console.log(email, password);
  let response = await fetch('/account/signin-authentication', {
    method: 'post',
    body: JSON.stringify({email, password}),
    headers: {
      'Content-Type': 'application/json'
    }
  })
  .then((response) => response.json())
  .then((data) => {
    console.log(data);
    if (data.success) {
      //let redirectUrl = window.location.protocol + '//' + window.location.hostname;
      console.log(window.location.hostname, window.location.origin);
      window.location.href = window.location.origin + '/dashboard';
    } else {
      errMsg(data.reason);
    }
    /* if (data.success) {
      window.loca
    } */
  }) 
  /* response  = await response.json();
  console.log(response);

  if(response.success == true){
    //successMsg('')
    setTimeout(function() {
      window.location.href = redirectUrl;
    }, 500); 
  } else {
    errMsg(response.reason);
  } */
});

signUpBtn.addEventListener('click', async () => {
  const name = document.querySelector('.card-back #logname').value;
  const email = document.querySelector('.card-back #logemail').value;
  const password = document.querySelector('.card-back #logpass').value;
  const timeZone = getUserTimezone();
  console.log(name,email, password);
  let response = await fetch('/account/signup-authentication', {
    method: 'post',
    body: JSON.stringify({name, email, password, timeZone}),
    headers: {
      'Content-Type': 'application/json'
    }
  })
  .then((response) => response.json())
  .then((data) => {
    console.log(data)
    if (data.success) {
      window.location.href = window.location.origin + '/dashboard';
    } else {
      errMsg(data.reason);
    }
  })
});

function getUserTimezone() {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch (error) {
    console.error('Intl.DateTimeFormat not supported:', error);
    return 'UTC';
  }
}

const toSignInBtn = document.getElementById('tosignin');
const toSignUpBtn = document.getElementById('tosignup');

const isSignInBtn = document.getElementById('issignin');

toSignInBtn.addEventListener('click', () => {
  isSignInBtn.checked = false;
})

toSignUpBtn.addEventListener('click', () => {
  isSignInBtn.checked = true;
});

if (window.location.href.includes('signin')) {
  dispBlock.classList.add('visible');
  accountModal.classList.add('visible');
};

const pwResetBtn = document.getElementById("pwResetBtn");

pwResetBtn.addEventListener("click", async () => {
  const email = document.querySelector('.card-front #logemail').value;
  console.log(email);
  fetch('/account/reset-password', {
    method: 'post',
    body: JSON.stringify({email}),
    headers: {
      'Content-Type': 'application/json'
    }
  })
  .then((response) => response.json())
  .then((data) => {
    console.log(data);
    if (data.success) {
      successMsg(data.msg);
    } else {
      errMsg(data.reason);
    };
  }) 
});