

const signUpSubmitBtn = document.querySelector('#signup-submit');
const signInSubmitBtn = document.querySelector('#signin-submit');

const emailContainer = document.querySelector("input#email");
const passwordContainer = document.querySelector("input#password");

const errPrintArea = document.querySelectorAll('span#error_msg');

signInSubmitBtn.addEventListener('click', async() => {
  let redirectUrl = window.location.protocol + '//' + window.location.hostname;
  const match = window.location.href.match(/[\?&]redirect=([^&#]*)/);
  const parameterValue = match ? match[1] : null;
  console.log(parameterValue);
  if(parameterValue){
    redirectUrl += '/' + parameterValue;
  }
  let response = await fetch('/account/signin-authentication', {
    method: 'post',
    body: JSON.stringify({email: emailContainer.value, password: passwordContainer.value, redirectUrl: redirectUrl}),
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
    errPrintArea[0].innerText = response.signup_err_msg;
    errPrintArea[1].innerText = response.signin_err_msg;
  }
})