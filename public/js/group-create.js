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

const public = document.querySelector("input#public");
const private = document.querySelector("input#private");
const passwordArea = document.querySelector("div#password");

public.addEventListener('click', () => {
  passwordArea.style = "display: none";
})

private.addEventListener('click', () => {
  passwordArea.style = "display: block";
})


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
randomFont.checked = true;

const submitbtn = document.querySelector("button.submit");
const groupName = document.querySelector("input.name");
const explanation = document.querySelector("input.explanation");
const max_people = document.querySelector("input.max-people");
const userPassword = document.querySelector("input.password");
const color = document.querySelector("input.color");
const goal = document.querySelector("input.goal");
//check if there is data to retrive

class tagContainerGen {
  constructor(tagContainer, maxTags) {
    this.tagContainer = document.getElementById(tagContainer);
    this.maxTags = maxTags;
    this.Createtags = [];
    this.addTag = this.addTag.bind(this);
    this.remove = this.remove.bind(this);
    this.createComponents();
  }

  createComponents() {
    this.tagContainer.innerHTML = `
    <div class="title">
      <i class="fa-solid fa-tags"></i>
      <h2>Tags</h2>
    </div>
    <div class="content">
      <p>Press enter after each tag</p>
      <ul class="tags"><input class="tags" type="text" spellcheck="false"></ul>
    </div>
    <div class="details">
      <p><span>10</span> tags are remaining</p>
      <button id = "removeall">Remove All</button>
    </div>
    `
    this.ul = this.tagContainer.querySelector("ul.tags"),
    this.tagNumb = this.tagContainer.querySelector(".details span");
    this.input = this.tagContainer.querySelector('input')
    this.input.addEventListener("keyup", this.addTag);
    const removeBtn = this.tagContainer.querySelector(".details button");
    removeBtn.addEventListener("click", () => {
      this.Createtags.length = 0;
      this.ul.querySelectorAll("li").forEach((li) => li.remove());
      this.countTags();
    });
  }

  remove(element, tag) {
    let index = this.Createtags.indexOf(tag);
    this.Createtags = [...this.Createtags.slice(0, index), ...this.Createtags.slice(index + 1)];
    element.parentElement.remove();
    this.countTags();
  }

  countTags() {
    this.input.focus();
    this.tagNumb.innerText = this.maxTags - this.Createtags.length;
  }

  createTag() {
    this.ul.querySelectorAll("li").forEach((li) => li.remove());
    this.Createtags
      .slice()
      .reverse()
      .forEach((tag) => {
        let liTag = `<li><p class = "tags">${tag}</p> <i class="fa-solid fa-xmark")"></i></li>`;
        this.ul.insertAdjacentHTML("afterbegin", liTag);
      });
    this.countTags();
    this.ul.querySelectorAll("li").forEach(li => {
      const i =  li.querySelector('i');
      const tag = li.querySelector('p').innerText;
      i.addEventListener("click", () => this.remove(i, tag));
    })
  }


  addTag(e) {
    if (e.key == "Enter") {
      let tag = e.target.value.replace(/\s+/g, " ");
      if (tag.length > 1 && !this.Createtags.includes(tag)) {
        if (this.Createtags.length < 10) {
          tag.split(",").forEach((tag) => {
            this.Createtags.push(tag);
            this.createTag();
          });
        }
      }
      e.target.value = "";
    }
  }

  getTags() {
    return 
  }
}

const newGrouptag = new tagContainerGen('newGroupTag', 10);
const groupSearchTag = new tagContainerGen('groupSearchTag', 10);
console.log(newGrouptag.Createtags);
(async() => {
  /* let response = await fetch('/groups/create/retriveProgress', {
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
  } */
  
  
  /* countTags();
  createTag(); */
  

})();
const errModal = document.querySelector('.err-modal');
const mainContainer = document.querySelector('.main.container');
submitbtn.addEventListener("click", () => {
  const visibility = document.querySelector("input.visibility:checked").value;
  const font = document.querySelector(".font-selection input:checked").value;

  //document.querySelector("ul.tags").querySelectorAll("li").forEach((li) => tags.push(li.querySelector("p").innerText));
  (async() => {
    try {
      const group = { 
        name: groupName.value, 
        explanation:explanation.value, 
        tags: newGrouptag.Createtags, 
        max_members: parseInt(max_people.value), 
        visibility:parseInt(visibility), 
        password:userPassword.value, 
        color: color.value, 
        goal_hr: parseInt(goal.value), 
        font: parseInt(font) 
      };
      let response = await fetch('/groups/create-validate', {
        method: 'post',
        body: JSON.stringify(group),
        headers: {
          'Content-Type': 'application/json'
        }
      })
  
      response = await response.json();
  
      if (response.success) {
        successMsg(`New group ${groupName.value} generated!`);
        groupCreateModal.classList.add('closed-modal');
        group.members = [userId];
        const groupId = response.data.group_id;
        groupWithUser.push(groupId);
        group.group_id = groupId;
        group.likes = [];
        createGroup(group);

      } else {
        errMsg(response.reason);
      }
    } catch (error) {
      console.log(error)
      errMsg('Error')
    }
  })();
});


const groupCreateBtn = document.getElementById('create-group-btn');
const groupCreateModal = document.getElementById('create-group-modal');

groupCreateBtn.addEventListener('click', () => {
  groupCreateModal.classList.toggle('closed-modal');
})

const groupCreateModalCloseBtn = document.querySelector('.create-group-modal #modalclosebtn');
groupCreateModalCloseBtn.addEventListener('click', () => {
  groupCreateModal.classList.add('closed-modal');
});

const pwSubmitBtn = document.getElementById('groupPwSubmit');

pwSubmitBtn.addEventListener('click', () => {
  joinGroup(group, el, password = '')
})