const groupsWrapper = document.querySelector(".groups-container");

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

// usage example

(async() => {
  const response = await fetch('/groups/bring-groups',
  {
    method: 'post',
    headers: {
      'Content-Type': 'application/json'
    }
  }
  );
  const groupList = await response.json();

  console.log(groupList);

  groupList.forEach(group => {
    
    const div = document.createElement('div');
    div.setAttribute('class', 'group');
    div.style = `background: linear-gradient(to right, ${changeBrightness(group.color, 80)}, ${group.color});    `
    let lock = ``
    if(group.visibility == "private") {
      lock = `<i class="fa-solid fa-lock"></i>`;
    }
    let tags = '';
    group.tags = JSON.parse(group.tags);
    group.members = JSON.parse(group.members)
    for(let i = 0; i < group.tags.length; i++){
      tags += '<li>'+group.tags[i] + '</li>'
    }
    if(tags == ''){
      tags = '<li>No tags</li>'
    }
    console.log(group)
    div.innerHTML = `
    <div class="group-inner">
    <div class="name">${lock} ${group.name}</div>
    <div class="middle">
      <div class="subinfo">
      ${group.members.length + '/' + group.max_members} <i class="fa-solid fa-people-group"></i>, 
      5hr <svg fill="#000000" width="20px" height="20px" viewBox="0 0 24 24" id="goal" data-name="Flat Line" xmlns="http://www.w3.org/2000/svg" class="icon flat-line"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"><polygon id="secondary" points="15 6 15 9 18 9 21 6 18 6 18 3 15 6" style="fill: #2ca9bc; stroke-width: 2;"></polygon><path id="primary" d="M15,9l-2.5,2.5M15,6V9h3l3-3H18V3Z" style="fill: none; stroke: #000000; stroke-linecap: round; stroke-linejoin: round; stroke-width: 2;"></path><path id="primary-2" data-name="primary" d="M12.33,3H12a9,9,0,1,0,9,9c0-.11,0-.22,0-.33" style="fill: none; stroke: #000000; stroke-linecap: round; stroke-linejoin: round; stroke-width: 2;"></path><path id="primary-3" data-name="primary" d="M16.9,13A5,5,0,1,1,11,7.1" style="fill: none; stroke: #000000; stroke-linecap: round; stroke-linejoin: round; stroke-width: 2;"></path></g></svg>
      , 0.2hr <svg width="20px" height="20px" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" aria-hidden="true" role="img" class="iconify iconify--gis" preserveAspectRatio="xMidYMid meet" fill="#000000"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"><path d="M42 0a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h3v5.295C23.364 15.785 6.5 34.209 6.5 56.5C6.5 80.483 26.017 100 50 100s43.5-19.517 43.5-43.5a43.22 43.22 0 0 0-6.72-23.182l4.238-3.431l1.888 2.332a2 2 0 0 0 2.813.297l3.11-2.518a2 2 0 0 0 .294-2.812L89.055 14.75a2 2 0 0 0-2.813-.297l-3.11 2.518a2 2 0 0 0-.294 2.812l1.889 2.332l-4.22 3.414C73.77 18.891 64.883 14.435 55 13.297V8h3a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2H42zm8 20c20.2 0 36.5 16.3 36.5 36.5S70.2 93 50 93S13.5 76.7 13.5 56.5S29.8 20 50 20zm.002 7.443L50 56.5l23.234 17.447a29.056 29.056 0 0 0 2.758-30.433a29.056 29.056 0 0 0-25.99-16.07z" fill="#000000"></path></g></svg>
      </div>
      <div class="explanation">${group.explanation}</div>
      <div class="tags"><i class="fa-solid fa-tags"></i>
        <ul>
          ${tags}
        </ul>
      </div>
    </div>
    <div class="bottom-btns">
      <button class="blob-btn submit" id = "start">
        Add Like
        <span class="blob-btn__inner">
          <span class="blob-btn__blobs">
            <span class="blob-btn__blob"></span>
            <span class="blob-btn__blob"></span>
            <span class="blob-btn__blob"></span>
            <span class="blob-btn__blob"></span>
          </span>
        </span>
      </button>
      <button class="blob-btn submit" id = "start">
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
      <a href = "${'/groups/join/' + group.group_id}">
        <button class="blob-btn submit" id = "start">
          Join Group
          <span class="blob-btn__inner">
            <span class="blob-btn__blobs">
              <span class="blob-btn__blob"></span>
              <span class="blob-btn__blob"></span>
              <span class="blob-btn__blob"></span>
              <span class="blob-btn__blob"></span>
            </span>
          </span>
        </button>
      </a>
    </div>
  </div>
    `
    groupsWrapper.appendChild(div);
  })
})();