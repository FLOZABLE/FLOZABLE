const submitbtn = document.querySelector(".u-btn-submit");
const success_msg = document.querySelector(".u-form-send-successes");
const err_msg = document.querySelector(".u-form-send-errors");

submitbtn.addEventListener("click", () => {
  const name = document.querySelector("input#name-2137").value;
  const email = document.querySelector("input#email-2137").value;
  if(name.length <= 0 || email.length <= 0){
    err_msg.style = "block";
    console.log(err)
  } else {
    (async() => {
      const response = await fetch('/email/post-register', {
        method: 'post',
        headers: {
          'name': name,
          'email': email,
          'Content-Type': 'application/json'
        }
      })

      const result = await response.json();
      console.log(result);
      if(result.result == "success"){
        success_msg.style = "display: block";
        err_msg.style = "display: none";
      } else {
        success_msg.style = "display: none";
        err_msg.style = "display: block";
      }
        /* .then()
        .then(data => console.log(data))
        .catch(error => console.error(error)); */
    })();
  }
})