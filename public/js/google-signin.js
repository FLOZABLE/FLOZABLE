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
    const queryString = window.location.href;
    let access_token;
    try {
        access_token = queryString.split('access_token=')[1].split("&")[0];
    } catch (err) {
        console.log(err);
        errMsg("An error occured");
        //window.location.href = "/";
    }

    fetch(`https://localhost:3000/account/signin-with-google`, {
        method: 'POST',
        body: JSON.stringify({ access_token, timezone: Intl.DateTimeFormat().resolvedOptions().timeZone }),
        headers: {
            'Content-Type': 'application/json'
        }
    }).then((response) => response.json())
        .then((data) => {
            if (data.success) {
                successMsg(data.msg); //if browser is slow and the loading takes long
                if (data.newUser) {
                    window.location.href = "/dashboard";
                }
                else {
                    window.location.href = "/dashboard";
                }
            }
            else {
                errMsg(data.reason);
                function redirect() {
                    window.location.href = "/";
                }
                setTimeout(redirect, 3000);
            }
        })
}

window.addEventListener('load', googleLogin);