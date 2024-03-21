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

function googleLogin() {
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const access_token = urlParams.get('access_token')
    alert(access_token);

    fetch(`https://super-duper-goldfish-699p4pr75rrxfr45x-3000.app.github.dev/account/signin-with-google`, {
        method: 'POST',
        body: JSON.stringify({ access_token, timezone: Intl.DateTimeFormat().resolvedOptions().timeZone }),
        headers: {
            'Content-Type': 'application/json'
        }
    }).then((response) => response.json())
    .then((data) => {
        if (data.success){
            successMsg(data.msg);
        }
        else{
            errMsg(data.reason);
        }
    })
}

window.addEventListener('load', googleLogin);