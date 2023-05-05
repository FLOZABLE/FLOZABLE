//Vanilla JS time
let current_fs, next_fs, previous_fs; //fieldsets
let left, opacity, scale; //fieldset properties which we will animate
let animating; //flag to prevent quick multi-click glitches

document.querySelectorAll(".next").forEach(function(button) {
button.addEventListener("click", function() {
if (animating) return false;
animating = true;
current_fs = this.parentNode;
next_fs = this.parentNode.nextElementSibling;

//activate next step on progressbar using the index of next_fs
document.querySelectorAll("fieldset").forEach(function(fieldset, index) {
  if (fieldset === next_fs) {
    document.querySelectorAll("#progressbar li")[index].classList.add("active");
  }
});

//show the next fieldset
next_fs.style.display = "block";
//hide the current fieldset with style
let animationInterval = setInterval(function() {
  current_fs.style.opacity -= 0.01;
  scale = 1 - (1 - current_fs.style.opacity) * 0.2;
  left = (current_fs.style.opacity * 50) + "%";
  opacity = 1 - current_fs.style.opacity;
  current_fs.style.transform = "scale(" + scale + ")";
  current_fs.style.position = "absolute";
  next_fs.style.left = left;
  next_fs.style.opacity = opacity;
  if (current_fs.style.opacity <= 0) {
    clearInterval(animationInterval);
    current_fs.style.display = "none";
    animating = false;
  }
}, 8);
});
});

document.querySelectorAll(".previous").forEach(function(button) {
button.addEventListener("click", function() {
if (animating) return false;
animating = true;

current_fs = this.parentNode;
previous_fs = this.parentNode.previousElementSibling;

//de-activate current step on progressbar
document.querySelectorAll("fieldset").forEach(function(fieldset, index) {
  if (fieldset === current_fs) {
    document.querySelectorAll("#progressbar li")[index].classList.remove("active");
  }
});

//show the previous fieldset
previous_fs.style.display = "block";
//hide the current fieldset with style
let animationInterval = setInterval(function() {
  current_fs.style.opacity -= 0.01;
  scale = 0.8 + (1 - current_fs.style.opacity) * 0.2;
  left = ((1 - current_fs.style.opacity) * 50) + "%";
  opacity = 1 - current_fs.style.opacity;
  current_fs.style.left = left;
  previous_fs.style.transform = "scale(" + scale + ")";
  previous_fs.style.opacity = opacity;
  if (current_fs.style.opacity <= 0) {
    clearInterval(animationInterval);
    current_fs.style.display = "none";
    animating = false;
  }
}, 8);
});
});

const submitbtn = document.querySelector("button.submit");

submitbtn.addEventListener("click", () => {
  
  const name = document.querySelector("input.name").value;
  const explanation = document.querySelector("input.explanation").value;
  const tags = document.querySelector("input.tags").value;
  const max_people = document.querySelector("input.max-people").value;
  const passwordtrue = document.querySelector("input.passwordtrue").value;
  const password = document.querySelector("input.password").value;
  console.log(name, explanation, tags, max_people, passwordtrue, password);
  (async() => {
    const response = await fetch('/groups/create-validate', {
      method: 'post',
      body: JSON.stringify({ name: name, explanation:explanation, tags:tags, max_people:max_people, passwordtrue:passwordtrue, password:password }),
      headers: {
        'Content-Type': 'application/json'
      }
    })
    // handle the response as needed
  })();
})