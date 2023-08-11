const groupsWrapper = document.querySelector(".groups-container");
const mygroupsWrapper = document.querySelector(".mygroups-container");

function changeBrightness(hex, percent) {
  // remove the # symbol if it's present
  hex = hex.replace(/#/g, '');

  // convert to RGB value
  let r = parseInt(hex.substr(0, 2), 16);
  let g = parseInt(hex.substr(2, 2), 16);
  let b = parseInt(hex.substr(4, 2), 16);

  // adjust brightness
  r = Math.round(Math.min(Math.max(0, r + (r * percent / 100)), 255));
  g = Math.round(Math.min(Math.max(0, g + (g * percent / 100)), 255));
  b = Math.round(Math.min(Math.max(0, b + (b * percent / 100)), 255));

  // convert back to hex value
  let newHex = '#' + r.toString(16).padStart(2, '0') + g.toString(16).padStart(2, '0') + b.toString(16).padStart(2, '0');

  return newHex;
}

/* const joinButtonEvent = async(joinLeaveButton, groupId, type) => {
  if(type == 'public') {
    let response = await fetch(`/groups/join/${groupId}`, {
      method: 'post',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    response = await response.json();
  
    if(response.success == true) {
      joinLeaveButton.innerHTML = `
      LEAVE GROUP
    <span class="blob-btn__inner">
      <span class="blob-btn__blobs">
        <span class="blob-btn__blob"></span>
        <span class="blob-btn__blob"></span>
        <span class="blob-btn__blob"></span>
        <span class="blob-btn__blob"></span>
      </span>
      `;
      joinLeaveButton.removeEventListener('click', () => joinButtonEvent(joinLeaveButton, group.group_id, type));
      joinLeaveButton.addEventListener('click', () => DelayModalEvent());
      setTimeout(() => {
        joinLeaveButton.addEventListener('click', () => leaveButtonEvent(joinLeaveButton, groupId, type));
        joinLeaveButton.removeEventListener('click', () => DelayModalEvent());
      }, 1000 * 60 * 10);
    }
  } else {
  }
}
 */
let selectedGroup = {};
function updateGroup(group, el) {
  const groupId = group.group_id;
  const type = group.visibility;

  if (group.members.includes(userId)) {
    //leave
    leaveGroup(group, el);
  } else if (type) {
    joinGroup(group, el);
  } else {
    askPwModal.classList.remove('closed-modal');
    selectedGroup.group = group;
    selectedGroup.el = el;
  }
}

async function joinGroup(group, el, password = '') {
  const groupId = group.group_id;
  const name = group.name;
  let response = await fetch(`/groups/join/${groupId}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ password: password })
  });

  response = await response.json();
  if (response.success) {
    successMsg(`Joined group "${name}"`);
    group.members.push(userId);
    el.querySelector('#members').innerText = `${group.members.length}/${group.max_members}`
    if (mygroupsWrapper.firstChild) {
      mygroupsWrapper.insertBefore(el, mygroupsWrapper.firstChild);
    } else {
      mygroupsWrapper.appendChild(el);
    }
    el.querySelector('#join p').innerText = `LEAVE GROUP`;
    askPwModal.classList.add('closed-modal');
  } else {
    errMsg(response.reason);
  }
  return response;
}

async function leaveGroup(group, el) {
  const groupId = group.group_id;
  const name = group.name;
  let response = await fetch(`/groups/leave/${groupId}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
  });

  response = await response.json();

  if (response.success) {
    successMsg(`Left group "${name}"`);
    groupsWrapper.appendChild(el);

    group.members = group.members.filter(memberId => memberId !== userId);
    el.querySelector('#members').innerText = `${group.members.length}/${group.max_members}`;
    el.querySelector('#join p').innerText = `JOIN GROUP`;
  } else {
    errMsg('Error')
  }
  return response;
}




//leave session event

const leaveButtonEvent = async (joinLeaveButton, groupId, type) => {
  let response = await fetch(`/groups/leave/${groupId}`, {
    method: 'post',
    headers: {
      'Content-Type': 'application/json'
    }
  });
  response = await response.json();

  if (response.success == true) {
    joinLeaveButton.innerHTML = `
    JOIN GROUP
  <span class="blob-btn__inner">
    <span class="blob-btn__blobs">
      <span class="blob-btn__blob"></span>
      <span class="blob-btn__blob"></span>
      <span class="blob-btn__blob"></span>
      <span class="blob-btn__blob"></span>
    </span>
    `;
    joinLeaveButton.removeEventListener('click', () => leaveButtonEvent(joinLeaveButton, group.group_id));
    joinLeaveButton.addEventListener('click', () => DelayModalEvent());
    setTimeout(() => {
      joinLeaveButton.addEventListener('click', () => joinButtonEvent(joinLeaveButton, groupId, type));
      joinLeaveButton.removeEventListener('click', () => DelayModalEvent());
    }, 1000 * 60 * 10)
  }
}

function copyToClipboard(text) {
  navigator.clipboard.writeText(text)
    .then(() => {
      successMsg('Text copied to clipboard');
    })
    .catch((error) => {
      console.error('Error copying text to clipboard:', error);
    });
}

async function likeButtonEvent(group, div) {
  const groupId = group.group_id;

  let response = await fetch(`/groups/like/${groupId}`, 
  {
    method: 'post',
    headers: {
      'Content-Type': 'application/json'
    }
  });

  response = await response.json();

  if (response.success) {
    if (!likedList.includes(groupId)) {
      successMsg(`Liked group "${group.name}"`);
      likedList.push(groupId);
      group.likes.push(userId);
      div.querySelector('#likes').innerText = group.likes.length;
    } else {
      successMsg(`Removed group "${group.name}" from liked list`);
      likedList = likedList.filter(liked => liked !== groupId);
      group.likes = group.likes.filter(likedId => likedId !== userId);
      div.querySelector('#likes').innerText = group.likes.length;
    }
  } else {
    errMsg('Error');
  }
}

function createGroup(group) {
  const div = document.createElement('div');
  div.setAttribute('class', 'group');
  div.style = `background: linear-gradient(to right, ${changeBrightness(group.color, 80)}, ${group.color});`;
  div.setAttribute('id', group.group_id);
  const lock = !group.visibility ? `<i class="fa-solid fa-lock"></i>` : '';
  //group.tags = JSON.parse(group.tags);
  const tags = group.tags ? group.tags.map(tag => `<li>${tag}</li>`).join('') : '';
  let joinButtonText = (groupWithUser.includes(group.group_id)) ? "Leave Group" : "Join Group";
  if (groupWithUser.includes(group.group_id)) {
    const div = document.createElement("div")
  }
  const likeBtnText = (group.likes?.includes(userId)) ? likeBtnSvg1 : likeBtnSvg2;
  div.innerHTML = `
  <div class="group-inner" id = "font-${group.font}">
  <div class="name"><a href = '/groups/${group.group_id}'>${lock}<p> ${group.name}</p></a></div>
  <div class="middle">
    <div class="subinfo">
    <p id = "members">${group.members.length + '/' + group.max_members}</p><i class="fa-solid fa-people-group"></i>, 
    ${group.goal_hr}hr <svg fill="#000000" width="20px" height="20px" viewBox="0 0 24 24" id="goal" data-name="Flat Line" xmlns="http://www.w3.org/2000/svg" class="icon flat-line"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"><polygon id="secondary" points="15 6 15 9 18 9 21 6 18 6 18 3 15 6" style="fill: #2ca9bc; stroke-width: 2;"></polygon><path id="primary" d="M15,9l-2.5,2.5M15,6V9h3l3-3H18V3Z" style="fill: none; stroke: #000000; stroke-linecap: round; stroke-linejoin: round; stroke-width: 2;"></path><path id="primary-2" data-name="primary" d="M12.33,3H12a9,9,0,1,0,9,9c0-.11,0-.22,0-.33" style="fill: none; stroke: #000000; stroke-linecap: round; stroke-linejoin: round; stroke-width: 2;"></path><path id="primary-3" data-name="primary" d="M16.9,13A5,5,0,1,1,11,7.1" style="fill: none; stroke: #000000; stroke-linecap: round; stroke-linejoin: round; stroke-width: 2;"></path></g></svg>
    , ${group.average_hr}hr <svg width="20px" height="20px" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" aria-hidden="true" role="img" class="iconify iconify--gis" preserveAspectRatio="xMidYMid meet" fill="#000000"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"><path d="M42 0a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h3v5.295C23.364 15.785 6.5 34.209 6.5 56.5C6.5 80.483 26.017 100 50 100s43.5-19.517 43.5-43.5a43.22 43.22 0 0 0-6.72-23.182l4.238-3.431l1.888 2.332a2 2 0 0 0 2.813.297l3.11-2.518a2 2 0 0 0 .294-2.812L89.055 14.75a2 2 0 0 0-2.813-.297l-3.11 2.518a2 2 0 0 0-.294 2.812l1.889 2.332l-4.22 3.414C73.77 18.891 64.883 14.435 55 13.297V8h3a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2H42zm8 20c20.2 0 36.5 16.3 36.5 36.5S70.2 93 50 93S13.5 76.7 13.5 56.5S29.8 20 50 20zm.002 7.443L50 56.5l23.234 17.447a29.056 29.056 0 0 0 2.758-30.433a29.056 29.056 0 0 0-25.99-16.07z" fill="#000000"></path></g></svg>
    , <p id = "likes">${group.likes.length}</p> ${likeBtnSvg2}
    </div>
    <div class="explanation">${group.explanation}</div>
    <div class="tags"><i class="fa-solid fa-tags"></i>
      <ul>
        ${tags}
      </ul>
    </div>
  </div>
  <div class="bottom-btns">
    <button id = "like">
      ${likeBtnText}
    </button>
    <button class="blob-btn submit" id = "share">
      Share
      <span class="blob-btn__inner">
        <span class="blob-btn__blobs">
          <span class="blob-btn__blob"></span>
          <span class="blob-btn__blob"></span>
          <span class="blob-btn__blob"></span>
          <span class="blob-btn__blob"></span>
        </span>
      </span>
    </button>
    <button class="blob-btn submit" id = "join">
    <p>${joinButtonText}</p>
    <span class="blob-btn__inner">
      <span class="blob-btn__blobs">
        <span class="blob-btn__blob"></span>
        <span class="blob-btn__blob"></span>
        <span class="blob-btn__blob"></span>
        <span class="blob-btn__blob"></span>
      </span>
    </span>
  </button>
  </div>
</div>
  `
  const joinLeaveButton = div.querySelector(`button#join`);
  joinLeaveButton.addEventListener('click', () => updateGroup(group, div));
  const shareButton = div.querySelector(`button#share`);
  shareButton.addEventListener('click', () => {
    copyToClipboard(window.location.protocol + window.location.hostname + '/links/join/' + group.group_id);
  });

  const likeButton = div.querySelector('#like');
  likeButton.addEventListener('click', () => likeButtonEvent(group, div));

  if (likedList.includes(group.group_id)) {
    div.querySelector("#like").innerHTML = likeBtnSvg2;
  }

  if(groupWithUser.includes(group.group_id)){
    mygroupsWrapper.appendChild(div);
  } else {
    groupsWrapper.appendChild(div);
  }
  group.el = div;
}


const likeBtnSvg1 = `<svg version="1.0" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="15px" height="15px" viewBox="0 0 64 64" enable-background="new 0 0 64 64" xml:space="preserve" fill="#000000"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <g> <path fill="#F76D57" d="M58.714,29.977c0,0-0.612,0.75-1.823,1.961S33.414,55.414,33.414,55.414C33.023,55.805,32.512,56,32,56 s-1.023-0.195-1.414-0.586c0,0-22.266-22.266-23.477-23.477s-1.823-1.961-1.823-1.961C3.245,27.545,2,24.424,2,21 C2,13.268,8.268,7,16,7c3.866,0,7.366,1.566,9.899,4.101l0.009-0.009l4.678,4.677c0.781,0.781,2.047,0.781,2.828,0l4.678-4.677 l0.009,0.009C40.634,8.566,44.134,7,48,7c7.732,0,14,6.268,14,14C62,24.424,60.755,27.545,58.714,29.977z"></path> <path fill="#F76D57" d="M58.714,29.977c0,0-0.612,0.75-1.823,1.961S33.414,55.414,33.414,55.414C33.023,55.805,32.512,56,32,56 s-1.023-0.195-1.414-0.586c0,0-22.266-22.266-23.477-23.477s-1.823-1.961-1.823-1.961C3.245,27.545,2,24.424,2,21 C2,13.268,8.268,7,16,7c3.866,0,7.366,1.566,9.899,4.101l0.009-0.009l4.678,4.677c0.781,0.781,2.047,0.781,2.828,0l4.678-4.677 l0.009,0.009C40.634,8.566,44.134,7,48,7c7.732,0,14,6.268,14,14C62,24.424,60.755,27.545,58.714,29.977z"></path> <g> <path fill="#394240" d="M48,5c-4.418,0-8.418,1.791-11.313,4.687l-3.979,3.961c-0.391,0.391-1.023,0.391-1.414,0 c0,0-3.971-3.97-3.979-3.961C24.418,6.791,20.418,5,16,5C7.163,5,0,12.163,0,21c0,3.338,1.024,6.436,2.773,9 c0,0,0.734,1.164,1.602,2.031s24.797,24.797,24.797,24.797C29.953,57.609,30.977,58,32,58s2.047-0.391,2.828-1.172 c0,0,23.93-23.93,24.797-24.797S61.227,30,61.227,30C62.976,27.436,64,24.338,64,21C64,12.163,56.837,5,48,5z M58.714,29.977 c0,0-0.612,0.75-1.823,1.961S33.414,55.414,33.414,55.414C33.023,55.805,32.512,56,32,56s-1.023-0.195-1.414-0.586 c0,0-22.266-22.266-23.477-23.477s-1.823-1.961-1.823-1.961C3.245,27.545,2,24.424,2,21C2,13.268,8.268,7,16,7 c3.866,0,7.366,1.566,9.899,4.101l0.009-0.009l4.678,4.677c0.781,0.781,2.047,0.781,2.828,0l4.678-4.677l0.009,0.009 C40.634,8.566,44.134,7,48,7c7.732,0,14,6.268,14,14C62,24.424,60.755,27.545,58.714,29.977z"></path> <path fill="#394240" d="M48,11c-0.553,0-1,0.447-1,1s0.447,1,1,1c4.418,0,8,3.582,8,8c0,0.553,0.447,1,1,1s1-0.447,1-1 C58,15.478,53.522,11,48,11z"></path> </g> </g> </g></svg>`;
const likeBtnSvg2 = `<svg version="1.0" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="15px" height="15px" viewBox="0 0 64 64" enable-background="new 0 0 64 64" xml:space="preserve" fill="#000000"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <g> <path fill="#231F20" d="M48,6c-4.418,0-8.418,1.791-11.313,4.687l-3.979,3.961c-0.391,0.391-1.023,0.391-1.414,0 c0,0-3.971-3.97-3.979-3.961C24.418,7.791,20.418,6,16,6C7.163,6,0,13.163,0,22c0,3.338,1.024,6.436,2.773,9 c0,0,0.734,1.164,1.602,2.031s24.797,24.797,24.797,24.797C29.953,58.609,30.977,59,32,59s2.047-0.391,2.828-1.172 c0,0,23.93-23.93,24.797-24.797S61.227,31,61.227,31C62.976,28.436,64,25.338,64,22C64,13.163,56.837,6,48,6z M58.714,30.977 c0,0-0.612,0.75-1.823,1.961S33.414,56.414,33.414,56.414C33.023,56.805,32.512,57,32,57s-1.023-0.195-1.414-0.586 c0,0-22.266-22.266-23.477-23.477s-1.823-1.961-1.823-1.961C3.245,28.545,2,25.424,2,22C2,14.268,8.268,8,16,8 c3.866,0,7.366,1.566,9.899,4.101l0.009-0.009l4.678,4.677c0.781,0.781,2.047,0.781,2.828,0l4.678-4.677l0.009,0.009 C40.634,9.566,44.134,8,48,8c7.732,0,14,6.268,14,14C62,25.424,60.755,28.545,58.714,30.977z"></path> <path fill="#231F20" d="M48,12c-0.553,0-1,0.447-1,1s0.447,1,1,1c4.418,0,8,3.582,8,8c0,0.553,0.447,1,1,1s1-0.447,1-1 C58,16.478,53.522,12,48,12z"></path> </g> </g></svg>`;

let response;
let groupList;
let userId;
let groupWithUser;
let likedList;
(async () => {
  response = await fetch('/groups/bring-groups',
    {
      method: 'post',
      headers: {
        'Content-Type': 'application/json'
      }
    }
  );
  response = await response.json();

  if (response.success) {
    groupList = response.groupList;
    groupWithUser = response.groupWithUser;
    userId = response.userId;
    likedList = response.likedList;
  }

  groupList.forEach((group, index) => {
    group.tags = JSON.parse(group.tags);
    //group.likes = `[${group.likes}]`;
    group.likes = group.likes.split(',');
    createGroup(group);
  });
})();

const askPwModal = document.getElementById('ask-pw-modal');

const askPwModalClose = askPwModal.querySelector('#modalclosebtn');

askPwModalClose.addEventListener('click', () => {
  askPwModal.classList.add('closed-modal');
});


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
const joinPassword = document.getElementById('joinpassword');

pwSubmitBtn.addEventListener('click', () => {
  joinGroup(selectedGroup.group, selectedGroup.el, joinPassword.value)
})


//search groups

const groupsSearch = document.getElementById("group-search");

groupsSearch.addEventListener("input", () => {
  const query = groupsSearch.value;
  groupList.map(group => {
    if (group.name.includes(query) || group.tags.includes(query) || group.explanation.includes(query)) {
      group.el.classList.remove('removed-group');
    } else {
      group.el.classList.add('removed-group');
    }
    //if (group.querySelector(''))
    //if (group.innerHTML)
  })
  /* let searched = false;
  let groupValue = [];
  if (!groups.length) {
    return 0;
  }
  groupNames.forEach((name, index) => {
    groupValue[index] = { name: '', explanation: '' };
    groupValue[index].name = name.innerText;
  })

  groupExplanations.forEach((explanation, index) => {
    groupValue[index].explanation = explanation.innerText;
  });

  groupValue.forEach((group, index) => {
    if (!group.name.includes(groupsSearch.value) && !group.explanation.includes(groupsSearch.value)) {
      groups[index].classList.add('closed')
    } else {
      groups[index].classList.add('closed')
      searched = true;
    }
  })

  if (searched) {
    groupsNotSearched.classList.add('closed');
  } else {
    groupsNotSearched.classList.remove('closed');
  } */
})

/* const activeSidebar = document.querySelector('.navbar .groups');
activeSidebar.classList.add('active'); */

let inputBox = document.querySelector('.input-box'),
  searchIcon = document.querySelector('.search'),
  closeIcon = document.querySelector('.close-icon');

searchIcon.addEventListener('click', () => {
  inputBox.classList.add('open');
});

closeIcon.addEventListener('click', () => {
  inputBox.classList.remove('open');
  groupsSearch.value = '';
  groupList.map(group => {
    group.el.classList.remove('removed-group');
  })
});