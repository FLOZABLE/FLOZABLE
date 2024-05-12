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
    body: JSON.stringify({ email, password }),
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
  console.log(name, email, password);
  let response = await fetch('/account/signup-authentication', {
    method: 'post',
    body: JSON.stringify({ name, email, password, timeZone }),
    headers: {
      'Content-Type': 'application/json'
    }
  })
    .then((response) => response.json())
    .then((data) => {
      console.log(data)
      if (data.success) {
        window.location.href = window.location.origin + '/dashboard?tutorial=1';
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
  fetch('/account/reset-password-request', {
    method: 'post',
    body: JSON.stringify({ email }),
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

const closeBtnFront = document.querySelector("#accountModal .card-front .closeBtn");
const closeBtnBack = document.querySelector("#accountModal .card-back .closeBtn");

closeBtnFront.addEventListener('click', () => {
  dispBlock.classList.remove('visible');
  accountModal.classList.remove('visible');
});

closeBtnBack.addEventListener('click', () => {
  dispBlock.classList.remove('visible');
  accountModal.classList.remove('visible');
});

const oauthSignInBtns = document.getElementsByClassName("oauthSignIn");

oauthSignInBtns[0].addEventListener('click', oauthSignIn);
oauthSignInBtns[1].addEventListener('click', oauthSignIn);

function oauthSignIn() {
  // Google's OAuth 2.0 endpoint for requesting an access token
  const oauth2Endpoint = 'https://accounts.google.com/o/oauth2/v2/auth';
  // Create <form> element to submit parameters to OAuth 2.0 endpoint.
  let newForm = document.createElement('form');
  newForm.setAttribute('method', 'GET'); // Send as a GET request.
  newForm.setAttribute('action', oauth2Endpoint);

  // Parameters to pass to OAuth 2.0 endpoint.
  const formParams = {
    'client_id': '569997433857-a5jdjf2k8oa46dopid8tt7s1lbcv8129.apps.googleusercontent.com',
    'redirect_uri': 'https://flozable.com/account/google-signin',
    'response_type': 'token',
    'scope': 'https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile',
    'include_granted_scopes': 'true',
    'state': 'pass-through value'
  }

  // Add form parameters as hidden input values.
  for (let p in formParams) {
    const input = document.createElement('input');
    input.setAttribute('type', 'hidden');
    input.setAttribute('name', p);
    input.setAttribute('value', formParams[p]);
    newForm.appendChild(input);
  }

  // Add form to page and submit it to open the OAuth 2.0 endpoint.
  document.body.appendChild(newForm);
  newForm.submit();
}