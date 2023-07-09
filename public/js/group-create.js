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

const recommendedColorsIndex = Math.floor(Math.random() * (recommendedColors.length));
const colorSelector = document.querySelector("input.color");
const colorDisplay = document.querySelector(".fa-solid.fa-palette");
colorSelector.value = recommendedColors[recommendedColorsIndex];
colorDisplay.style = `color: ${recommendedColors[recommendedColorsIndex]}`;
colorSelector.addEventListener('input', () => {
  colorDisplay.style = `color: ${colorSelector.value}`;
});

const randomFontIndex  = Math.floor(Math.random() * 13);
const randomFont = document.querySelector(`.font-selection input#font-${randomFontIndex}`)
console.log(randomFont, randomFontIndex);
randomFont.checked = true;

const submitbtn = document.querySelector("button.submit");
const groupName = document.querySelector("input.name");
const explanation = document.querySelector("input.explanation");
const tags = []
const max_people = document.querySelector("input.max-people");
const userPassword = document.querySelector("input.password");
const color = document.querySelector("input.color");
const goal = document.querySelector("input.goal");
//check if there is data to retrive
let Createtags = [];

let maxTags = 10;
input.addEventListener("keyup", addTag);
  
const removeBtn = document.querySelector(".details button");
removeBtn.addEventListener("click", () => {
  Createtags.length = 0;
  ul.querySelectorAll("li").forEach((li) => li.remove());
  countTags();
});
function remove(element, tag) {
  let index = Createtags.indexOf(tag);
  Createtags = [...Createtags.slice(0, index), ...Createtags.slice(index + 1)];
  element.parentElement.remove();
  countTags();
}

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
      let liTag = `<li><p class = "tags">${tag}</p> <i class="fa-solid fa-xmark" onclick="remove(this, '${tag}')"></i></li>`;
      ul.insertAdjacentHTML("afterbegin", liTag);
    });
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
    userPassword.value = response.retrivedProgress.password
    color.value = response.retrivedProgress.color;
    colorDisplay.style = `color: ${response.retrivedProgress.color}`;
    goal.value = response.retrivedProgress.goal_hr;
    document.querySelector(`.font-selection input#font-${response.retrivedProgress.font}`).checked = true;
  }
  
  
  countTags();
  createTag();
  

})();
const errModal = document.querySelector('.err-modal');
const mainContainer = document.querySelector('.main.container');
const errModalCloseBtn = errModal.querySelector('.close-btn');
submitbtn.addEventListener("click", () => {
  const visibility = document.querySelector("input.visibility:checked").value;
  const font = document.querySelector(".font-selection input:checked").value;

  document.querySelector("ul.tags").querySelectorAll("li").forEach((li) => tags.push(li.querySelector("p").innerText));
  (async() => {
    let response = await fetch('/groups/create-validate', {
      method: 'post',
      body: JSON.stringify({ name: groupName.value, explanation:explanation.value, tags:tags, max_people:max_people.value, visibility:visibility, password:userPassword.value, color: color.value, goal_hr: goal.value, font: font }),
      headers: {
        'Content-Type': 'application/json'
      }
    })

    response = await response.json();
    console.log(response.reason, response)
    if(response.success == true){
      let redirectUrl = window.location.protocol + '//' + window.location.hostname + '/dashboard/groups';
      window.location.href = redirectUrl;
    } else if(response.reason == 'not loggedin') {
      let redirectUrl = window.location.protocol + '//' + window.location.hostname + '/account/signin?redirect=groups/create';
      window.location.href = redirectUrl;
    } else if(response.reason == 'err'){
      errModal.style = 'display: block';
      errModal.querySelector('.textcontainer').innerHTML = `<p>${response.msg}</p>`;
      console.log('err', response.msg)
      mainContainer.classList.add('blur');
    }
  })();
});

errModalCloseBtn.addEventListener('click', () => {
  mainContainer.classList.remove('blur');
  errModal.style = 'display: none'
})