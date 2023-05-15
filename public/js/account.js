const signUpButton = document.getElementById('signUp');
const signInButton = document.getElementById('signIn');
const container = document.getElementById('container');

console.log(signInButton)
signUpButton.addEventListener('click', () => {
	container.classList.add("right-panel-active");
  container.classList.remove("left-panel-active");
});

signInButton.addEventListener('click', () => {
  container.classList.add("left-panel-active");
	container.classList.remove("right-panel-active");
});

const signUpSubmitBtn = document.querySelector('#signup-submit');
const signInSubmitBtn = document.querySelector('#signin-submit');

signUpSubmitBtn.addEventListener('click', async() => {
  const name = document.querySelector(".signup input[name='name']").value;
  const email = document.querySelector(".signup input[name='email']").value;
  const password = document.querySelector(".signup input[name='password']").value;
  console.log(name, email, password);
  let redirectUrl = window.location.protocol + '//' + window.location.hostname;
  const match = window.location.href.match(/[\?&]redirect=([^&#]*)/);
  const parameterValue = match ? match[1] : null;
  console.log(parameterValue);
  if(parameterValue){
    redirectUrl += '/' + parameterValue;
  }
  let response = await fetch('/account/signup-authentication', {
    method: 'post',
    body: JSON.stringify({ name: name, email: email, password: password, redirectUrl: redirectUrl}),
    headers: {
      'Content-Type': 'application/json'
    }
  });
  const status  = await response.json();
  console.log(status);

  if(status.status == 200){
    setTimeout(function() {
      window.location.href = redirectUrl;
    }, 2000); 
  }
});

//signin button

signInSubmitBtn.addEventListener('click', async() => {
  const email = document.querySelector(".signin input[name='email']").value;
  const password = document.querySelector(".signin input[name='password']").value;
  console.log(email, password);
  let redirectUrl = window.location.protocol + '//' + window.location.hostname;
  const match = window.location.href.match(/[\?&]redirect=([^&#]*)/);
  const parameterValue = match ? match[1] : null;
  console.log(parameterValue);
  if(parameterValue){
    redirectUrl += '/' + parameterValue;
  }
  let response = await fetch('/account/signin-authentication', {
    method: 'post',
    body: JSON.stringify({email: email, password: password, redirectUrl: redirectUrl}),
    headers: {
      'Content-Type': 'application/json'
    }
  });
  const status  = await response.json();
  console.log(status);

  if(status.status == 200){
    setTimeout(function() {
      window.location.href = redirectUrl;
    }, 2000); 
  }
})