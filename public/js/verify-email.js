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

const verifyBtn = document.getElementById("verify");

verifyBtn.addEventListener('click', async () => {
    const searchParams = new URLSearchParams(new URL(window.location.href).search);
    const verifyId = searchParams.get('verifyId');
    await fetch('/account/verify-by-link', {
        method: 'post',
        body: JSON.stringify({ verifyId }),
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
                  window.location.href = window.location.origin + '/dashboard';
                }, 3000);
            } else {
                errMsg(data.reason);
            };
        })
});