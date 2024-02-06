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

signInBtn.addEventListener('click', async () => {
  const password = document.querySelector('.card-front #logpass').value;
  const searchParams = new URLSearchParams(new URL(window.location.href).search);
  const email = searchParams.get('email');
  const resetId = searchParams.get('resetId');
  await fetch('/account/reset-password', {
    method: 'post',
    body: JSON.stringify({password, email, resetId}),
    headers: {
      'Content-Type': 'application/json'
    }
  })
  .then((response) => response.json())
  .then((data) => {
    console.log(data);
    if (data.success) {
      successMsg(data.msg);
      setTimeout(() => {
        window.location.href = window.location.origin + '/#signin';
      }, 3000);
    } else {
      errMsg(data.reason);
    };
  }) 
});