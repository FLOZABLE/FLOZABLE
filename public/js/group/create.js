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

const public = document.querySelector("input#public");
const private = document.querySelector("input#private");
const passwordArea = document.querySelector("div#password");

public.addEventListener('click', () => {
  passwordArea.style = "display: none";
})

private.addEventListener('click', () => {
  passwordArea.style = "display: block";
})

const ul = document.querySelector("ul.tags"),
  input = document.querySelector("input.tags"),
  tagNumb = document.querySelector(".details span");


const recommendedColors = [
  '#3423BF',
  '#377CE0',
  '#E0BE44',
  '#F3ECDD',
  '#B7183F',
  '#F0D3C7',
  '#F7F0E1',
  '#0176BE',
  '#BB2D21',
  '#F3F3F3',
  '#F7E9C4',
  '#7D98A9',
  '#8E5870',
  '#363233',
  '#FEC8E0',
  '#5C728A',
  '#457278',
  '#A2424E',
  '#EE6E61',
  '#EA7639',
  '#F9D790',
  '#B8C37F',
  '#C4DFB6',
  '#BEDCE7',
  '#455D77',
  '#9D3246',
  '#32425C',
];

const recommendedColorsIndex = Math.floor(Math.random() * (recommendedColors.length));;
const colorSelector = document.querySelector("input.color");
const colorDisplay = document.querySelector(".fa-solid.fa-palette");
colorSelector.value = recommendedColors[recommendedColorsIndex];
colorDisplay.style = `color: ${recommendedColors[recommendedColorsIndex]}`;
colorSelector.addEventListener('input', () => {
  colorDisplay.style = `color: ${colorSelector.value}`;
});


const submitbtn = document.querySelector("button.submit");
const groupName = document.querySelector("input.name");
const explanation = document.querySelector("input.explanation");
const tags = []
const max_people = document.querySelector("input.max-people");
const password = document.querySelector("input.password");
const color = document.querySelector("input.color");
const goal = document.querySelector("input.goal");
//check if there is data to retrive
let Createtags = [];
(async() => {
  let response = await fetch('/groups/create/retriveProgress', {
    method: 'post',
    headers: {
      'Content-type': 'application/json'
    }
  });
  response = await response.json();

  console.log(response, response.retrivedProgress);
  if(response.retrivedProgress){
    groupName.value = response.retrivedProgress.name;
    explanation.value = response.retrivedProgress.explanation;
    response.retrivedProgress.tags.forEach((tag) => Createtags.push(tag));
    max_people.value = response.retrivedProgress.max_people;
    if(response.retrivedProgress.visibility == 'private'){
      document.querySelector("input.visibility#private").checked = true;
      passwordArea.style = "display: block";
    }
    password.value = response.retrivedProgress.password
    color.value = response.retrivedProgress.color;
    colorDisplay.style = `color: ${response.retrivedProgress.color}`;
    goal.value = response.retrivedProgress.goal_hr;
  }
  
  let maxTags = 10;
  
  countTags();
  createTag();
  
  function countTags() {
    input.focus();
    tagNumb.innerText = maxTags - Createtags.length;
  }
  
  function createTag() {
    ul.querySelectorAll("li").forEach((li) => li.remove());
    Createtags
      .slice()
      .reverse()
      .forEach((tag) => {
        let liTag = `<li><p class = "tags">${tag}</p> <i class="uit uit-multiply" onclick="remove(this, '${tag}')"></i></li>`;
        ul.insertAdjacentHTML("afterbegin", liTag);
      });
    countTags();
  }
  
  function remove(element, tag) {
    let index = Createtags.indexOf(tag);
    Createtags = [...Createtags.slice(0, index), ...Createtags.slice(index + 1)];
    element.parentElement.remove();
    countTags();
  }
  
  function addTag(e) {
    if (e.key == "Enter") {
      let tag = e.target.value.replace(/\s+/g, " ");
      if (tag.length > 1 && !Createtags.includes(tag)) {
        if (Createtags.length < 10) {
          tag.split(",").forEach((tag) => {
            Createtags.push(tag);
            createTag();
          });
        }
      }
      e.target.value = "";
    }
  }
  
  input.addEventListener("keyup", addTag);
  
  const removeBtn = document.querySelector(".details button");
  removeBtn.addEventListener("click", () => {
    Createtags.length = 0;
    ul.querySelectorAll("li").forEach((li) => li.remove());
    countTags();
  });
})();

submitbtn.addEventListener("click", () => {
  const visibility = document.querySelector("input.visibility:checked").value;
  console.log(groupName.value, explanation.value, tags.value, max_people.value, visibility, password.value);
  document.querySelector("ul.tags").querySelectorAll("li").forEach((li) => tags.push(li.querySelector("p").innerText));
  (async() => {
    let response = await fetch('/groups/create-validate', {
      method: 'post',
      body: JSON.stringify({ name: groupName.value, explanation:explanation.value, tags:tags, max_people:max_people.value, visibility:visibility, password:password.value, color: color.value, goal_hr: goal.value }),
      headers: {
        'Content-Type': 'application/json'
      }
    })

    response = await response.json();
    if(response.success == true){
      console.log(response)
    } else if(response.reason == 'not loggedin') {
      let redirectUrl = window.location.protocol + '//' + window.location.hostname + '/account?redirect=groups/create';
      window.location.href = redirectUrl;
    }
  })();
});