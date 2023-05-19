const groupsWrapper = document.querySelector(".groups-container");
const pwAskingModal = document.querySelector(".pw-modal");
const mygroupsWrapper = document.querySelector(".mygroup-container");
const closeBtn = document.querySelectorAll(".close-btn");
const modal = document.querySelector('.subject-modal');

const DelayModalEvent = () => {
  modal.style = 'display: block';
}

closeBtn[0].addEventListener('click', () => {
  modal.style =  "display: none";
});

closeBtn[1].addEventListener('click', () => {
  pwAskingModal.style =  "display: none";
});

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

const joinButtonEvent = async(joinLeaveButton, groupId, type) => {
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
    pwAskingModal.style = 'display: block';
    const groupPw = pwAskingModal.querySelector("input");
    const groupPwSubmitBtn = pwAskingModal.querySelector("button#join-pw");
    groupPwSubmitBtn.addEventListener('click', async() => {
      console.log(groupPw.value)
      let response = await fetch(`/groups/join/${groupId}`, {
        method: 'post',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({'group-pw': groupPw.value}),
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
        pwAskingModal.style = "display: none";
      }
    })
  }
}




//leave session event

const leaveButtonEvent = async(joinLeaveButton, groupId, type) => {
  let response = await fetch(`/groups/leave/${groupId}`, {
    method: 'post',
    headers: {
      'Content-Type': 'application/json'
    }
  });
  response = await response.json();

  if(response.success == true) {
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
      console.log('Text copied to clipboard');
    })
    .catch((error) => {
      console.error('Error copying text to clipboard:', error);
    });
}


 const likeBtnSvg1 = `<svg version="1.0" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="15px" height="15px" viewBox="0 0 64 64" enable-background="new 0 0 64 64" xml:space="preserve" fill="#000000"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <g> <path fill="#F76D57" d="M58.714,29.977c0,0-0.612,0.75-1.823,1.961S33.414,55.414,33.414,55.414C33.023,55.805,32.512,56,32,56 s-1.023-0.195-1.414-0.586c0,0-22.266-22.266-23.477-23.477s-1.823-1.961-1.823-1.961C3.245,27.545,2,24.424,2,21 C2,13.268,8.268,7,16,7c3.866,0,7.366,1.566,9.899,4.101l0.009-0.009l4.678,4.677c0.781,0.781,2.047,0.781,2.828,0l4.678-4.677 l0.009,0.009C40.634,8.566,44.134,7,48,7c7.732,0,14,6.268,14,14C62,24.424,60.755,27.545,58.714,29.977z"></path> <path fill="#F76D57" d="M58.714,29.977c0,0-0.612,0.75-1.823,1.961S33.414,55.414,33.414,55.414C33.023,55.805,32.512,56,32,56 s-1.023-0.195-1.414-0.586c0,0-22.266-22.266-23.477-23.477s-1.823-1.961-1.823-1.961C3.245,27.545,2,24.424,2,21 C2,13.268,8.268,7,16,7c3.866,0,7.366,1.566,9.899,4.101l0.009-0.009l4.678,4.677c0.781,0.781,2.047,0.781,2.828,0l4.678-4.677 l0.009,0.009C40.634,8.566,44.134,7,48,7c7.732,0,14,6.268,14,14C62,24.424,60.755,27.545,58.714,29.977z"></path> <g> <path fill="#394240" d="M48,5c-4.418,0-8.418,1.791-11.313,4.687l-3.979,3.961c-0.391,0.391-1.023,0.391-1.414,0 c0,0-3.971-3.97-3.979-3.961C24.418,6.791,20.418,5,16,5C7.163,5,0,12.163,0,21c0,3.338,1.024,6.436,2.773,9 c0,0,0.734,1.164,1.602,2.031s24.797,24.797,24.797,24.797C29.953,57.609,30.977,58,32,58s2.047-0.391,2.828-1.172 c0,0,23.93-23.93,24.797-24.797S61.227,30,61.227,30C62.976,27.436,64,24.338,64,21C64,12.163,56.837,5,48,5z M58.714,29.977 c0,0-0.612,0.75-1.823,1.961S33.414,55.414,33.414,55.414C33.023,55.805,32.512,56,32,56s-1.023-0.195-1.414-0.586 c0,0-22.266-22.266-23.477-23.477s-1.823-1.961-1.823-1.961C3.245,27.545,2,24.424,2,21C2,13.268,8.268,7,16,7 c3.866,0,7.366,1.566,9.899,4.101l0.009-0.009l4.678,4.677c0.781,0.781,2.047,0.781,2.828,0l4.678-4.677l0.009,0.009 C40.634,8.566,44.134,7,48,7c7.732,0,14,6.268,14,14C62,24.424,60.755,27.545,58.714,29.977z"></path> <path fill="#394240" d="M48,11c-0.553,0-1,0.447-1,1s0.447,1,1,1c4.418,0,8,3.582,8,8c0,0.553,0.447,1,1,1s1-0.447,1-1 C58,15.478,53.522,11,48,11z"></path> </g> </g> </g></svg>`;
 const likeBtnSvg2 = `<svg version="1.0" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="15px" height="15px" viewBox="0 0 64 64" enable-background="new 0 0 64 64" xml:space="preserve" fill="#000000"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <g> <path fill="#231F20" d="M48,6c-4.418,0-8.418,1.791-11.313,4.687l-3.979,3.961c-0.391,0.391-1.023,0.391-1.414,0 c0,0-3.971-3.97-3.979-3.961C24.418,7.791,20.418,6,16,6C7.163,6,0,13.163,0,22c0,3.338,1.024,6.436,2.773,9 c0,0,0.734,1.164,1.602,2.031s24.797,24.797,24.797,24.797C29.953,58.609,30.977,59,32,59s2.047-0.391,2.828-1.172 c0,0,23.93-23.93,24.797-24.797S61.227,31,61.227,31C62.976,28.436,64,25.338,64,22C64,13.163,56.837,6,48,6z M58.714,30.977 c0,0-0.612,0.75-1.823,1.961S33.414,56.414,33.414,56.414C33.023,56.805,32.512,57,32,57s-1.023-0.195-1.414-0.586 c0,0-22.266-22.266-23.477-23.477s-1.823-1.961-1.823-1.961C3.245,28.545,2,25.424,2,22C2,14.268,8.268,8,16,8 c3.866,0,7.366,1.566,9.899,4.101l0.009-0.009l4.678,4.677c0.781,0.781,2.047,0.781,2.828,0l4.678-4.677l0.009,0.009 C40.634,9.566,44.134,8,48,8c7.732,0,14,6.268,14,14C62,25.424,60.755,28.545,58.714,30.977z"></path> <path fill="#231F20" d="M48,12c-0.553,0-1,0.447-1,1s0.447,1,1,1c4.418,0,8,3.582,8,8c0,0.553,0.447,1,1,1s1-0.447,1-1 C58,16.478,53.522,12,48,12z"></path> </g> </g></svg>`;


(async() => {
  const startTime = performance.now();
  let response = await fetch('/groups/bring-groups',
  {
    method: 'post',
    headers: {
      'Content-Type': 'application/json'
    }
  }
  );
  response = await response.json();
  const groupList = response[0];
  const email = response[1];
  const groupWithUser = response[2]
  console.log(groupList, email, groupWithUser);
  

  groupList.forEach((group, index) => {
    
    const div = document.createElement('div');
    div.setAttribute('class', 'group');
    div.style = `background: linear-gradient(to right, ${changeBrightness(group.color, 80)}, ${group.color});`;
    div.setAttribute('id', group.group_id);
    const lock = (group.visibility === "private") ? `<i class="fa-solid fa-lock"></i>` : '';
    group.tags = JSON.parse(group.tags);
    const tags = group.tags.map(tag => `<li>${tag}</li>`).join('');
    let joinButtonText = (groupWithUser.includes(group.group_id)) ? "Leave Group" : "Join Group";
    if(groupWithUser.includes(group.group_id)){
      const div = document.createElement("div")
    }
    group.members = group.members.split(',').map(item => item.trim());
    const likeBtnText = (group.likes?.includes(email)) ? likeBtnSvg1 : likeBtnSvg2;
    div.innerHTML = `
    <div class="group-inner">
    <div class="name">${lock}<p> ${group.name}</p></div>
    <div class="middle">
      <div class="subinfo">
      ${group.members.length + '/' + group.max_members} <i class="fa-solid fa-people-group"></i>, 
      ${group.goal_hr}hr <svg fill="#000000" width="20px" height="20px" viewBox="0 0 24 24" id="goal" data-name="Flat Line" xmlns="http://www.w3.org/2000/svg" class="icon flat-line"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"><polygon id="secondary" points="15 6 15 9 18 9 21 6 18 6 18 3 15 6" style="fill: #2ca9bc; stroke-width: 2;"></polygon><path id="primary" d="M15,9l-2.5,2.5M15,6V9h3l3-3H18V3Z" style="fill: none; stroke: #000000; stroke-linecap: round; stroke-linejoin: round; stroke-width: 2;"></path><path id="primary-2" data-name="primary" d="M12.33,3H12a9,9,0,1,0,9,9c0-.11,0-.22,0-.33" style="fill: none; stroke: #000000; stroke-linecap: round; stroke-linejoin: round; stroke-width: 2;"></path><path id="primary-3" data-name="primary" d="M16.9,13A5,5,0,1,1,11,7.1" style="fill: none; stroke: #000000; stroke-linecap: round; stroke-linejoin: round; stroke-width: 2;"></path></g></svg>
      , ${group.average_hr}hr <svg width="20px" height="20px" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" aria-hidden="true" role="img" class="iconify iconify--gis" preserveAspectRatio="xMidYMid meet" fill="#000000"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"><path d="M42 0a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h3v5.295C23.364 15.785 6.5 34.209 6.5 56.5C6.5 80.483 26.017 100 50 100s43.5-19.517 43.5-43.5a43.22 43.22 0 0 0-6.72-23.182l4.238-3.431l1.888 2.332a2 2 0 0 0 2.813.297l3.11-2.518a2 2 0 0 0 .294-2.812L89.055 14.75a2 2 0 0 0-2.813-.297l-3.11 2.518a2 2 0 0 0-.294 2.812l1.889 2.332l-4.22 3.414C73.77 18.891 64.883 14.435 55 13.297V8h3a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2H42zm8 20c20.2 0 36.5 16.3 36.5 36.5S70.2 93 50 93S13.5 76.7 13.5 56.5S29.8 20 50 20zm.002 7.443L50 56.5l23.234 17.447a29.056 29.056 0 0 0 2.758-30.433a29.056 29.056 0 0 0-25.99-16.07z" fill="#000000"></path></g></svg>
      </div>
      <div class="explanation">${group.explanation}</div>
      <div class="tags"><i class="fa-solid fa-tags"></i>
        <ul>
          ${tags}
        </ul>
      </div>
    </div>
    <div class="bottom-btns">
      <button class="blob-btn submit" id = "like${index}">
        ${likeBtnText}
      </button>
      <button class="blob-btn submit" id = "share${index}">
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
      <button class="blob-btn submit" id = "join${index}">
      ${joinButtonText}
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
    if(groupWithUser.includes(group.group_id)){
      mygroupsWrapper.appendChild(div);
    } else {
      groupsWrapper.appendChild(div);
    }
    const joinLeaveButton = document.querySelector(`button#join${index}`);
    if(!groupWithUser.includes(group.group_id)){
      joinLeaveButton.addEventListener('click', () => joinButtonEvent(joinLeaveButton, group.group_id, group.visibility));
    } else {
      joinLeaveButton.addEventListener('click', () => leaveButtonEvent(joinLeaveButton, group.group_id, group.visibility));
    }

    const shareButton = document.querySelector(`button#share${index}`);
    shareButton.addEventListener('click', () => {
      copyToClipboard(window.location.protocol + window.location.hostname + '/links/join/' + group.group_id);
    })

    const likeButton = document.querySelector(`button#like${index}`);
    likeButton.addEventListener('click', async() => {
      let response = await fetch(`/groups/like/${group.group_id}`, {
        method: 'post',
        headers: {
            'Content-Type': 'application/json'
        }
      })

      response = await response.json();
      if(response.state == 'liked') {
        console.log('liked successed')
        console.log(response)
        likeButton.innerHTML = likeBtnSvg1;
      } else if(response.state == 'unliked') {
        console.log('unliked')
        console.log(response);
        likeButton.innerHTML = likeBtnSvg2;
      }
    })
  });
  const endTime = performance.now();
const executionTime = endTime - startTime;
console.log(`Execution time: ${executionTime} milliseconds`);
})();



const ul = document.querySelector("ul.tags"),
  input = document.querySelector("input.tags"),
  tagNumb = document.querySelector(".details span");

let maxTags = 10,
  tags = [];

countTags();
createTag();

function countTags() {
  input.focus();
  tagNumb.innerText = maxTags - tags.length;
}

function createTag() {
  ul.querySelectorAll("li").forEach((li) => li.remove());
  tags
    .slice()
    .reverse()
    .forEach((tag) => {
      let liTag = `<li><p class = "tags">${tag}</p> <i class="uit uit-multiply" onclick="remove(this, '${tag}')"></i></li>`;
      ul.insertAdjacentHTML("afterbegin", liTag);
    });
  countTags();
}

function remove(element, tag) {
  let index = tags.indexOf(tag);
  tags = [...tags.slice(0, index), ...tags.slice(index + 1)];
  element.parentElement.remove();
  countTags();
}

function addTag(e) {
  if (e.key == "Enter") {
    let tag = e.target.value.replace(/\s+/g, " ");
    if (tag.length > 1 && !tags.includes(tag)) {
      if (tags.length < 10) {
        tag.split(",").forEach((tag) => {
          tags.push(tag);
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
  tags.length = 0;
  ul.querySelectorAll("li").forEach((li) => li.remove());
  countTags();
});

const searchQuery = document.querySelector("input.input-search");


searchQuery.addEventListener("input", () => {
  const groups = document.querySelectorAll(".group");
  const groupNames = document.querySelectorAll(".group .name p");
  const groupExplanations = document.querySelectorAll(".group .explanation");
  let groupValue = [];

  groupNames.forEach((name, index) => {
    groupValue[index] = {name: '', explanation: ''};
    groupValue[index].name = name.innerText;
  })

  groupExplanations.forEach((explanation, index) => {
    groupValue[index].explanation = explanation.innerText;
  });

  groupValue.forEach((group, index) => {
    if(!group.name.includes(searchQuery.value) && !group.explanation.includes(searchQuery.value)) {
      groups[index].style.cssText += "display: none";
    } else {
      groups[index].style.cssText += "display: block";
    }
  })
})
