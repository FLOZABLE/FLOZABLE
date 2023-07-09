function loadYouTubePlayerAPI() {
  var tag = document.createElement('script');
  tag.src = 'https://www.youtube.com/iframe_api';
  var firstScriptTag = document.getElementsByTagName('script')[0];
  firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
}

let player;

function onYouTubeIframeAPIReady() {
  console.log('v')
  const videoUrl = "https://www.youtube.com/watch?v=KZ2m7L9xWJ4";
  const videoId = getVideoIdFromUrl(videoUrl);

  player = new window.YT.Player('player', {
    /* height: '100vh',
    width: '0', */
    videoId: videoId,
    playerVars: {
      loop: 1,
      autoplay: 1,
      controls: 0,
      modestbranding: 0,
      showinfo: 0,
      origin: 'http://localhost',
      mute: 1,
      disablekb: 1,
      fs: 0,
      rel: 0,
      iv_load_policy: 3,
      modestbranding: 1,
      playsinline: 1,
      enablejsapi: 0,
      crossOriginIsolated: true,
      autohide: 1,
      wmode: 'opaque'
    },
    events: {
      onReady: onPlayerReady,
      onStateChange: onPlayerStateChange,
      onError: errorHandler
    }
  });
}

function onPlayerReady(event) {
  const playerIframe = event.target.getIframe();
  playerIframe.contentWindow.postMessage('removeChrometop', '*');
  playerIframe.contentWindow.postMessage('removeInfo', '*');
  playerIframe.contentWindow.postMessage({
    command: 'removeInfo'
  }, '*');
  playerIframe.setAttribute('allowfullscreen', '');
  playerIframe.setAttribute('title', '');
  playerIframe.setAttribute('style', 'pointer-events: none;');

  event.target.playVideo();
}

function onPlayerStateChange(event) {
  if (event.data === YT.PlayerState.ENDED) {
    event.target.seekTo(0); // Restart the video
  }
}

function getVideoIdFromUrl(url) {
  const urlParams = new URLSearchParams(new URL(url).search);
  return urlParams.get("v");
}

function errorHandler(event) {
  console.log(event);
}


function changeVideo(newVideoUrl) {
  const newVideoId = getVideoIdFromUrl(newVideoUrl);
  player.loadVideoById(newVideoId);
}


loadYouTubePlayerAPI();

const youtubeLink = document.getElementById("youtube-link");

youtubeLink.addEventListener('change', () => {
  changeVideo(youtubeLink.value);

});

const addSubjectModal = document.querySelector("#add-subject");
const addSubjectCloseBtn = document.querySelector("#add-subject .modal-close");
addSubjectCloseBtn.addEventListener('click', () => {
  addSubjectModal.classList.add('closed');
})

const addSubjectOpenBtn = document.querySelector(".add-subject-modal-btn button");

addSubjectOpenBtn.addEventListener('click', () => {
  addSubjectModal.classList.remove('closed');
})
const timerContainer = document.querySelector(".timers");

let worker = new Worker('./js/worker.js');

worker.addEventListener('message', (e) => {
  let message = e.data;
  let timerId = message.timer;
  let timer;
  let groupId = message.group;
  if(message.type == 0) {
    timer = timers.find(timer => timer.id == timerId)
  } else {
    let group = groupList.find((group) => {
      return group.group_id == groupId 
    });

    let member = group.members.find((member) => {
      return member.userId == timerId;
    });

    timer = member.timer;
  }
  if(message.command === 'start') {
    count(timer)
    timer.intervalId = message.intervalId;
  } else if(message.command === 'stop') {
    let intervalId = message.intervalId;
  }
});

// Start the timer by sending a message to the worker

function count(timer) {
  timer.hundredth += 1;

  timer.sec += 1;

  if (timer.sec == 60) {
    timer.sec = 0;
    timer.min += 1;
  }

  if (timer.min == 60) {
    timer.min == 0;
    timer.hr += 1;
  }
  disp(timer);
}

function disp(timer) {
  timer.secDisp.forEach(secDisp => {
    secDisp.innerHTML = timer.sec.toLocaleString(undefined, { minimumIntegerDigits: 2 });
  })
  timer.minDisp.forEach(minDisp => {
    minDisp.innerHTML = timer.min.toLocaleString(undefined, { minimumIntegerDigits: 2 }) + ':';
  })
  timer.hrDisp.forEach(hrDisp => {
    hrDisp.innerHTML = timer.hr.toLocaleString(undefined, { minimumIntegerDigits: 2 }) + ':';
  })
}


function toggleTimer(timer) {
  if (timer.run) {
    worker.postMessage({command: 'stopTimer', timer: timer.id, intervalId: timer.intervalId, type: timer.type});
    if(!timer.type) {
      timer.playBtn.innerHTML = `<i class="fa-solid fa-play" style = "color: ${timer.color}"></i>`;
      (async () => {
        const stop = await fetch('/study/stop', {
          method: 'post',
          body: JSON.stringify({ id: timer.id }),
          headers: {
            'Content-Type': 'application/json'
          }
        })
        // handle the response as needed
      })();
    }
    timer.run = false;



  } else {
    worker.postMessage({command: 'startTimer', timer: timer.id, type: timer.type, group: timer.group});
    if(!timer.type) {
      timer.playBtn.innerHTML = `<i class="fa-solid fa-pause" style = "color: ${timer.color}"></i>`;
      (async () => {
        const start = await fetch('/study/start', {
          method: 'post',
          body: JSON.stringify({ id: timer.id }),
          headers: {
            'Content-Type': 'application/json'
          }
        })
      })();
    }
    timer.run = true;
    /* const activatedBtn = document.querySelector(`#drag-item-${index}`);
    const subjectContainer = document.querySelector(".timer .container");
    subjectContainer.insertBefore(activatedBtn, subjectContainer.firstChild); */
    /* activatedBtn.style.top = subjectContainer.offsetTop - activatedBtn.offsetTop + "px";
    activatedBtn.classList.add('move-top'); */
    const subjects = document.querySelectorAll('.SW');
    /* for (let i = 0; i < subjects.length; i++) {
      if (timers[i].run == true && i != index) {
        toggleTimer(i);
      }
    } */

  }
}
function addSubject(timer) {
  const div = document.createElement('div');
  div.classList.add('timer');
  div.id = `id-${timer.id}`
  div.innerHTML = `
  <div class="disp">
  <p class = "subject">${timer.name}</p>
  <div class="digits">
    <span class="hr">00:</span>
    <span class="min">00:</span>
    <span class="sec">00</span>
  </div>
</div>
<div class="buttons">
  <div class="playBtn button">
    <i class="fa-solid fa-play" style = "color: ${timer.color}"></i>
  </div>
</div>
  `
  const playBtn = div.querySelector(".playBtn");
  timer.playBtn = playBtn;
  timer.secDisp = [div.querySelector(".sec")];
  timer.minDisp = [div.querySelector(".min")];
  timer.hrDisp = [div.querySelector(".hr")];

  playBtn.addEventListener('click', () => {
    toggleTimer(timer);
  })
  timerContainer.appendChild(div);
  disp(timer)
}
//bringing subjects
const timers = [];
(async () => {
  try {
    const response = await fetch('/study/bring-subjects', {
      method: 'post',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if(response.length != 0) {
      subjects = await response.json();
    }

    const startTime = new Date().setHours(0, 0, 0, 0);
    const endTime = new Date().setHours(23, 59, 59, 999);
    if(!subjects){
      return 0
    }

    subjects.forEach(subject => {
      const { name, total, datum_point, timeline, color } = subject;
      const filteredTimeline = timeline.filter(period => {
        const [start, end] = period.map(time => 1000 * (time + datum_point));
        return start >= startTime && end <= endTime;
      });
      let time = 0;
      filteredTimeline.map(period => time += period[1] - period[0]);

      timers.push({
        type: 0,
        hundredth: 0,
        sec: Math.floor(time % 60),
        min: Math.floor((time / 60) % 60),
        hr: Math.floor(time / (60 * 60)),
        run: false,
        timer: null,
        secDisp: null,
        minDisp: null,
        hrDisp: null,
        playBtn: null,
        name: name,
        color: color,
        id: subject.id,
      });

      addSubject(timers[timers.length - 1]);
    })
  } catch (error){
    console.log(error)
  }
})();

const backgroundModal = document.querySelector(".modal#background-setting");
const backgroundModalClostBtn = backgroundModal.querySelector(".modal-close");
const backgroundModalOpenBtn = document.getElementById("background-activate");
backgroundModalClostBtn.addEventListener('click', () => {
  backgroundModal.classList.add('closed');
})

backgroundModalOpenBtn.addEventListener("click", () => {
  backgroundModal.classList.toggle('closed');
})


const restSvg = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" id="Capa_1" viewBox="0 0 460 460" xml:space="preserve" width="78px" height="78px" fill="#000000"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <g id="XMLID_1326_"> <path id="XMLID_1324_" style="fill:#CBB57A;" d="M285,295h50l-90,120h-10L285,295z"></path> <path id="XMLID_1325_" style="fill:#9E8E60;" d="M385,415h-10l-90-120h50L385,415z"></path> <path id="XMLID_1298_" style="fill:#4D4337;" d="M410,285L410,285c0,11.046-8.954,20-20,20H230c-11.046,0-20-8.954-20-20v0 c0-11.046,8.954-20,20-20h0.87l13.933-160.226C247.743,70.956,276.054,45,310,45h0c33.946,0,62.257,25.956,65.198,59.774 L389.13,265H390C401.046,265,410,273.954,410,285z"></path> <path id="XMLID_1295_" style="fill:#635547;" d="M370,270c0,2.761-2.239,5-5,5H255c-2.761,0-5-2.239-5-5s2.239-5,5-5h10 l8.326-95.752c1.654-19.023,17.579-33.623,36.674-33.623h0c19.095,0,35.02,14.6,36.674,33.623L355,265h10 C367.761,265,370,267.239,370,270z"></path> <path id="XMLID_1136_" style="fill:#9E8E60;" d="M120,415H0V225h120V415z M460,225h-20v190h20V225z"></path> <path id="XMLID_338_" style="fill:#766A54;" d="M100,315H20v-60h80V315z M100,335H20v60h80V335z"></path> <path id="XMLID_337_" style="fill:#D6CFBA;" d="M100,255v60H20v-60h20v10c0,5.523,4.477,10,10,10h20c5.523,0,10-4.477,10-10v-10 H100z M80,335v10c0,5.523-4.477,10-10,10H50c-5.523,0-10-4.477-10-10v-10H20v60h80v-60H80z"></path> <path id="XMLID_307_" style="fill:#833428;" d="M60,137v66c0,1.105-0.895,2-2,2H42c-1.105,0-2-0.895-2-2v-66c0-1.105,0.895-2,2-2 h16C59.105,135,60,135.895,60,137z"></path> <path id="XMLID_334_" style="fill:#374145;" d="M79.308,135.522l18.132,63.461c0.303,1.062-0.312,2.169-1.374,2.472l-15.384,4.396 c-1.062,0.303-2.169-0.312-2.472-1.374l-18.132-63.461c-0.303-1.062,0.312-2.169,1.374-2.472l15.384-4.396 C77.898,133.845,79.004,134.46,79.308,135.522z"></path> <path id="XMLID_308_" style="fill:#64757C;" d="M89.747,172.06l-19.23,5.494l-8.242-28.846l19.23-5.494L89.747,172.06z"></path> <path id="XMLID_245_" style="fill:#AC8428;" d="M60,155H40v-10h20V155z"></path> <path id="XMLID_1276_" style="fill:#374145;" d="M128.243,207.095c-1.617,0.359-3.22-0.661-3.579-2.278l-15.185-68.333 c-0.359-1.617,0.66-3.22,2.278-3.579c1.617-0.359,3.22,0.661,3.579,2.278l15.185,68.333 C130.881,205.133,129.861,206.736,128.243,207.095z"></path> <path id="XMLID_1297_" style="fill:#DDA333;" d="M141.114,128.651l-15.185,68.333c-0.359,1.617-1.962,2.637-3.579,2.278 c-1.617-0.359-2.637-1.962-2.278-3.579l15.185-68.333c0.359-1.617,1.962-2.637,3.579-2.278S141.474,127.034,141.114,128.651z"></path> <path id="XMLID_1817_" style="fill:#E0CFA6;" d="M130,187v36c0,1.105-0.895,2-2,2H32c-1.105,0-2-0.895-2-2v-36c0-1.105,0.895-2,2-2 h96C129.105,185,130,185.895,130,187z"></path> <path id="XMLID_1816_" style="fill:#D66A40;" d="M140,167v56c0,1.105-0.895,2-2,2h-26c-1.105,0-2-0.895-2-2v-56 c0-1.105,0.895-2,2-2h26C139.105,165,140,165.895,140,167z"></path> <path id="XMLID_1808_" style="fill:#CBB175;" d="M250,210v10h-40h-40v-10c0-5.523,4.477-10,10-10h20c5.523,0,10,4.477,10,10 c0-5.523,4.477-10,10-10h20C245.523,200,250,204.477,250,210z"></path> <path id="XMLID_1813_" style="fill:#E9CC85;" d="M250,210v10h-40v-10c0-5.523,4.477-10,10-10h20C245.523,200,250,204.477,250,210z"></path> <path id="XMLID_1807_" style="fill:#833428;" d="M254.833,211v6c0,1.105-0.895,2-2,2h-85.667c-1.105,0-2-0.895-2-2v-6 c0-1.105,0.895-2,2-2h85.667C253.938,209,254.833,209.895,254.833,211z"></path> <path id="XMLID_1805_" style="fill:#3F0900;" d="M216,215v2c0,1.105-0.895,2-2,2h-8c-1.105,0-2-0.895-2-2v-2c0-3.314,2.686-6,6-6 l0,0C213.314,209,216,211.686,216,215z"></path> <path id="XMLID_1747_" style="fill:#CBB57A;" d="M460,235H0v-20h460V235z"></path> </g> </g></svg>`
const createMemberTimer = (membersWrapper, member, groupId) => {
  const memberDiv = document.createElement('div');
  memberDiv.classList.add('member')
  memberDiv.setAttribute('id', `id${member.userId}`);
  memberDiv.innerHTML = `
  <div class="member-name">${member.name}</div>
  <div class="svg-area">${restSvg}</div>
  <div class="member-time">
  <div class="digits">
    <span class="hr">00:</span>
    <span class="min">00:</span>
    <span class="sec">00</span>
  </div>
  </div>
  `;

  
  membersWrapper.appendChild(memberDiv)
  setTimeout(() => {
    member.timer = {
      type: 1,
      hundredth: 0,
      sec: Math.floor((member.today / 1000) % 60),
      min: Math.floor((member.today / (1000 * 60)) % 60),
      hr: Math.floor((member.today / (1000 * 60 * 60))),
      run: false,
      timer: null,
      secDisp: document.querySelectorAll(`#group-${groupId} #id${member.userId} .sec`),
      minDisp: document.querySelectorAll(`#group-${groupId} #id${member.userId} .min`),
      hrDisp: document.querySelectorAll(`#group-${groupId} #id${member.userId} .hr`),
      playBtn: null,
      id: member.userId,
      group: groupId
    }
    member.timer.secDisp.forEach(el => {
      el.innerHTML = member.timer.sec.toString().padStart(2, '0');
    })
    member.timer.minDisp.forEach(el => {
      el.innerHTML = member.timer.min.toString().padStart(2, '0') + ":";
    })
    member.timer.hrDisp.forEach(el => {
      el.innerHTML = member.timer.hr.toString().padStart(2, '0') + ":";
    })
  }, 0)
}
const socket = io(window.location.protocol + '//' + window.location.hostname);

socket.on('studying', (userId, groups) => {
  console.log(userId, groups)
  groups.forEach((group) => {
    const groupInfo = groupList.find(groupObj => groupObj.group_id == group);
    const memberInfo = groupInfo.members.find(member => member.userId === userId);
    if(!memberInfo.timer.run) {
      memberInfo.timer.run = false;
      toggleTimer(memberInfo.timer)
      console.log(memberInfo.name)
    } else {
      toggleTimer(memberInfo.timer)
      console.log('remove')
    }
    
    //memberInfo.timer.timer = setInterval(function () {count(memberInfo.timer);}, 1000);
    //document.querySelector
    //toggleTimer(memberInfo.timer)
    const memberDivders = document.querySelectorAll(`.groups-container .swiper-slide#group-${group} #id${userId}`);
    memberDivders.forEach((slider) => {
      slider.querySelector('.svg-area').innerHTML = `
      <svg height="77px" width="77px" version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 512 512" xml:space="preserve" fill="#000000"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path style="fill:#F4FFF9;" d="M500.87,22.261v467.478c0,6.147-4.983,11.13-11.13,11.13H22.261c-6.147,0-11.13-4.983-11.13-11.13 V22.261c0-6.147,4.983-11.13,11.13-11.13h467.478C495.886,11.13,500.87,16.114,500.87,22.261z"></path> <path style="fill:#A89B80;" d="M489.739,467.478v33.391c0,6.147-4.983,11.13-11.13,11.13H11.13C4.983,512,0,507.017,0,500.87 v-33.391c0-6.147,4.983-11.13,11.13-11.13h467.478C484.756,456.348,489.739,461.331,489.739,467.478z"></path> <path style="fill:#90B5BF;" d="M228.174,322.783v111.304H27.826V322.783c0-36.883,29.9-66.783,66.783-66.783h66.783 C198.274,256,228.174,285.9,228.174,322.783z"></path> <path style="fill:#769CA5;" d="M128,434.087H27.826V322.783c0-36.883,29.9-66.783,66.783-66.783H128V434.087z"></path> <path style="fill:#EFDDAB;" d="M250.435,512H150.261C137.966,512,128,502.034,128,489.739V345.043 c0-12.295,9.966-22.261,22.261-22.261h100.174c12.295,0,22.261,9.966,22.261,22.261v144.696 C272.696,502.034,262.729,512,250.435,512z"></path> <path style="fill:#C1B291;" d="M164.174,367.304c0-4.61,3.738-8.348,8.348-8.348h66.783c4.61,0,8.348,3.738,8.348,8.348 c0,4.61-3.738,8.348-8.348,8.348h-66.783C167.912,375.652,164.174,371.915,164.174,367.304z M239.304,392.348h-66.783 c-4.61,0-8.348,3.738-8.348,8.348c0,4.61,3.738,8.348,8.348,8.348h66.783c4.61,0,8.348-3.738,8.348-8.348 C247.652,396.085,243.915,392.348,239.304,392.348z M239.304,459.13h-66.783c-4.61,0-8.348,3.738-8.348,8.348 s3.738,8.348,8.348,8.348h66.783c4.61,0,8.348-3.738,8.348-8.348S243.915,459.13,239.304,459.13z M239.304,425.739h-44.522 c-4.61,0-8.348,3.738-8.348,8.348s3.738,8.348,8.348,8.348h44.522c4.61,0,8.348-3.738,8.348-8.348S243.915,425.739,239.304,425.739z "></path> <path style="fill:#F4C064;" d="M172.522,178.087c0,24.588-19.933,44.522-44.522,44.522s-44.522-19.933-44.522-44.522 s19.933-44.522,44.522-44.522C152.589,133.565,172.522,153.499,172.522,178.087z M128,422.957H72.348v-66.783 c0-6.147-4.983-11.13-11.13-11.13H27.826v100.174c0,12.295,9.966,22.261,22.261,22.261H128c12.295,0,22.261-9.966,22.261-22.261l0,0 C150.261,432.923,140.295,422.957,128,422.957z"></path> <path style="fill:#F4AB53;" d="M128,133.565v89.043c-24.588,0-44.522-19.933-44.522-44.522S103.412,133.565,128,133.565z"></path> <path style="fill:#B28D5B;" d="M484.174,189.217v111.304c0,6.147-4.983,11.13-11.13,11.13h-33.391h-33.391 c-6.147,0-11.13-4.983-11.13-11.13V189.217c0-6.147,4.983-11.13,11.13-11.13h22.261c6.147,0,11.13,4.983,11.13,11.13 c0-6.147,4.983-11.13,11.13-11.13h22.261C479.191,178.087,484.174,183.07,484.174,189.217z"></path> <path style="fill:#7F5D3B;" d="M461.913,178.087v133.565h-11.13c-6.147,0-11.13-4.983-11.13-11.13c0,6.147-4.983,11.13-11.13,11.13 h-22.261c-6.147,0-11.13-4.983-11.13-11.13V189.217c0-6.147,4.983-11.13,11.13-11.13h22.261c6.147,0,11.13,4.983,11.13,11.13 c0-6.147,4.983-11.13,11.13-11.13H461.913z"></path> <path style="fill:#FF8355;" d="M384,11.13v111.304c0,6.147-4.983,11.13-11.13,11.13h-33.391h-33.391 c-6.147,0-11.13-4.983-11.13-11.13V11.13c0-6.147,4.983-11.13,11.13-11.13h22.261c6.147,0,11.13,4.983,11.13,11.13 c0-6.147,4.983-11.13,11.13-11.13h22.261C379.017,0,384,4.983,384,11.13z"></path> <path style="fill:#E55D30;" d="M361.739,0v133.565h-22.261h-33.391c-6.147,0-11.13-4.983-11.13-11.13V11.13 c0-6.147,4.983-11.13,11.13-11.13h22.261c6.147,0,11.13,4.983,11.13,11.13c0-6.147,4.983-11.13,11.13-11.13H361.739z"></path> <path style="fill:#B28D5B;" d="M339.478,133.565h-33.391c-6.147,0-11.13-4.983-11.13-11.13V11.13c0-6.147,4.983-11.13,11.13-11.13 h22.261c6.147,0,11.13,4.983,11.13,11.13V133.565z"></path> <path style="fill:#7F5D3B;" d="M317.217,133.565h-11.13c-6.147,0-11.13-4.983-11.13-11.13V11.13c0-6.147,4.983-11.13,11.13-11.13 h11.13V133.565z"></path> <path style="fill:#769CA5;" d="M475.628,118.066l-19.278,11.13c-5.324,3.073-12.131,1.25-15.204-4.074L385.494,28.73 c-3.073-5.324-1.25-12.131,4.074-15.204l19.278-11.13c5.324-3.073,12.131-1.25,15.204,4.074l55.652,96.393 C482.776,108.184,480.952,114.992,475.628,118.066z"></path> <path style="fill:#5B7A7F;" d="M465.989,123.631l-9.639,5.565c-5.324,3.073-12.131,1.25-15.204-4.074L385.494,28.73 c-3.073-5.324-1.25-12.131,4.074-15.204l9.639-5.565L465.989,123.631z"></path> <path style="fill:#FFA233;" d="M428.522,311.652h-22.261c-6.147,0-11.13-4.983-11.13-11.13V189.217c0-6.147,4.983-11.13,11.13-11.13 h22.261c6.147,0,11.13,4.983,11.13,11.13v111.304C439.652,306.669,434.669,311.652,428.522,311.652z"></path> <path style="fill:#FF7E1D;" d="M417.391,311.652h-11.13c-6.147,0-11.13-4.983-11.13-11.13V189.217c0-6.147,4.983-11.13,11.13-11.13 h11.13V311.652z"></path> <path style="fill:#A89B80;" d="M503.652,141.913H269.913c-4.61,0-8.348-3.738-8.348-8.348c0-4.61,3.738-8.348,8.348-8.348h233.739 c4.61,0,8.348,3.738,8.348,8.348C512,138.175,508.262,141.913,503.652,141.913z M503.652,303.304H325.565 c-4.61,0-8.348,3.738-8.348,8.348s3.738,8.348,8.348,8.348h178.087c4.61,0,8.348-3.738,8.348-8.348S508.262,303.304,503.652,303.304 z"></path> <path style="fill:#C1B291;" d="M367.304,456.348H500.87c6.147,0,11.13,4.983,11.13,11.13v33.391c0,6.147-4.983,11.13-11.13,11.13 H367.304c-6.147,0-11.13-4.983-11.13-11.13v-33.391C356.174,461.331,361.157,456.348,367.304,456.348z"></path> <path style="fill:#DBCBA1;" d="M367.304,422.957H500.87c6.147,0,11.13,4.983,11.13,11.13v33.391c0,6.147-4.983,11.13-11.13,11.13 H367.304c-6.147,0-11.13-4.983-11.13-11.13v-33.391C356.174,427.94,361.157,422.957,367.304,422.957z"></path> <path style="fill:#EFDDAB;" d="M367.304,389.565H500.87c6.147,0,11.13,4.983,11.13,11.13v33.391c0,6.147-4.983,11.13-11.13,11.13 H367.304c-6.147,0-11.13-4.983-11.13-11.13v-33.391C356.174,394.548,361.157,389.565,367.304,389.565z"></path> <path style="fill:#DBCBA1;" d="M486.957,389.565v22.261c0,4.61-3.738,8.348-8.348,8.348s-8.348-3.738-8.348-8.348v-22.261H486.957z M436.87,411.826c0,4.61,3.738,8.348,8.348,8.348s8.348-3.738,8.348-8.348v-22.261H436.87V411.826z M403.478,411.826 c0,4.61,3.738,8.348,8.348,8.348c4.61,0,8.348-3.738,8.348-8.348v-22.261h-16.696V411.826z"></path> </g></svg>
      `
    })
  })
});

socket.on('stopstudying', (userId, groups) => {
  groups.forEach((group) => {
    const groupInfo = groupList.find(groupObj => groupObj.group_id == group);
    const memberInfo = groupInfo.members.find(member => member.userId === userId);
    memberInfo.timer.run = true;
    //clearInterval(memberInfo.timer.timer)
    toggleTimer(memberInfo.timer)
    const memberDivders = document.querySelectorAll(`.groups-container .swiper-slide#group-${group} #id${userId}`);
    memberDivders.forEach((slider) => {
    slider.querySelector('.svg-area').innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" id="Capa_1" viewBox="0 0 460 460" xml:space="preserve" width="78px" height="78px" fill="#000000"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <g id="XMLID_1326_"> <path id="XMLID_1324_" style="fill:#CBB57A;" d="M285,295h50l-90,120h-10L285,295z"></path> <path id="XMLID_1325_" style="fill:#9E8E60;" d="M385,415h-10l-90-120h50L385,415z"></path> <path id="XMLID_1298_" style="fill:#4D4337;" d="M410,285L410,285c0,11.046-8.954,20-20,20H230c-11.046,0-20-8.954-20-20v0 c0-11.046,8.954-20,20-20h0.87l13.933-160.226C247.743,70.956,276.054,45,310,45h0c33.946,0,62.257,25.956,65.198,59.774 L389.13,265H390C401.046,265,410,273.954,410,285z"></path> <path id="XMLID_1295_" style="fill:#635547;" d="M370,270c0,2.761-2.239,5-5,5H255c-2.761,0-5-2.239-5-5s2.239-5,5-5h10 l8.326-95.752c1.654-19.023,17.579-33.623,36.674-33.623h0c19.095,0,35.02,14.6,36.674,33.623L355,265h10 C367.761,265,370,267.239,370,270z"></path> <path id="XMLID_1136_" style="fill:#9E8E60;" d="M120,415H0V225h120V415z M460,225h-20v190h20V225z"></path> <path id="XMLID_338_" style="fill:#766A54;" d="M100,315H20v-60h80V315z M100,335H20v60h80V335z"></path> <path id="XMLID_337_" style="fill:#D6CFBA;" d="M100,255v60H20v-60h20v10c0,5.523,4.477,10,10,10h20c5.523,0,10-4.477,10-10v-10 H100z M80,335v10c0,5.523-4.477,10-10,10H50c-5.523,0-10-4.477-10-10v-10H20v60h80v-60H80z"></path> <path id="XMLID_307_" style="fill:#833428;" d="M60,137v66c0,1.105-0.895,2-2,2H42c-1.105,0-2-0.895-2-2v-66c0-1.105,0.895-2,2-2 h16C59.105,135,60,135.895,60,137z"></path> <path id="XMLID_334_" style="fill:#374145;" d="M79.308,135.522l18.132,63.461c0.303,1.062-0.312,2.169-1.374,2.472l-15.384,4.396 c-1.062,0.303-2.169-0.312-2.472-1.374l-18.132-63.461c-0.303-1.062,0.312-2.169,1.374-2.472l15.384-4.396 C77.898,133.845,79.004,134.46,79.308,135.522z"></path> <path id="XMLID_308_" style="fill:#64757C;" d="M89.747,172.06l-19.23,5.494l-8.242-28.846l19.23-5.494L89.747,172.06z"></path> <path id="XMLID_245_" style="fill:#AC8428;" d="M60,155H40v-10h20V155z"></path> <path id="XMLID_1276_" style="fill:#374145;" d="M128.243,207.095c-1.617,0.359-3.22-0.661-3.579-2.278l-15.185-68.333 c-0.359-1.617,0.66-3.22,2.278-3.579c1.617-0.359,3.22,0.661,3.579,2.278l15.185,68.333 C130.881,205.133,129.861,206.736,128.243,207.095z"></path> <path id="XMLID_1297_" style="fill:#DDA333;" d="M141.114,128.651l-15.185,68.333c-0.359,1.617-1.962,2.637-3.579,2.278 c-1.617-0.359-2.637-1.962-2.278-3.579l15.185-68.333c0.359-1.617,1.962-2.637,3.579-2.278S141.474,127.034,141.114,128.651z"></path> <path id="XMLID_1817_" style="fill:#E0CFA6;" d="M130,187v36c0,1.105-0.895,2-2,2H32c-1.105,0-2-0.895-2-2v-36c0-1.105,0.895-2,2-2 h96C129.105,185,130,185.895,130,187z"></path> <path id="XMLID_1816_" style="fill:#D66A40;" d="M140,167v56c0,1.105-0.895,2-2,2h-26c-1.105,0-2-0.895-2-2v-56 c0-1.105,0.895-2,2-2h26C139.105,165,140,165.895,140,167z"></path> <path id="XMLID_1808_" style="fill:#CBB175;" d="M250,210v10h-40h-40v-10c0-5.523,4.477-10,10-10h20c5.523,0,10,4.477,10,10 c0-5.523,4.477-10,10-10h20C245.523,200,250,204.477,250,210z"></path> <path id="XMLID_1813_" style="fill:#E9CC85;" d="M250,210v10h-40v-10c0-5.523,4.477-10,10-10h20C245.523,200,250,204.477,250,210z"></path> <path id="XMLID_1807_" style="fill:#833428;" d="M254.833,211v6c0,1.105-0.895,2-2,2h-85.667c-1.105,0-2-0.895-2-2v-6 c0-1.105,0.895-2,2-2h85.667C253.938,209,254.833,209.895,254.833,211z"></path> <path id="XMLID_1805_" style="fill:#3F0900;" d="M216,215v2c0,1.105-0.895,2-2,2h-8c-1.105,0-2-0.895-2-2v-2c0-3.314,2.686-6,6-6 l0,0C213.314,209,216,211.686,216,215z"></path> <path id="XMLID_1747_" style="fill:#CBB57A;" d="M460,235H0v-20h460V235z"></path> </g> </g></svg>
    `
    })
  })
});

socket.on('addUser', async(group, userId) => {
  let response = await fetch('/study/update-members-info', {
    method: 'post',
    body: JSON.stringify({ userId: userId }),
    headers: {
      'Content-Type': 'application/json'
    }
  });
  response = await response.json();
  const roomWrapper = document.querySelectorAll(`.groups-container .swiper-slide#group-${group} ul `);
  const groupInfo = groupList.find(groupObj => groupObj.group_id == group);
  groupInfo.members.push(response);
  const memberInfo = response;
  roomWrapper.forEach(roomEl => {
    createMemberTimer(roomEl, memberInfo, groupInfo.group_id)
  })
})

socket.on('removeUser', (group, userId) => {
  const roomWrapper = document.querySelectorAll(`.groups-container .swiper-slide#group-${group} ul`);
  const groupInfo = groupList.find(groupObj => groupObj.group_id == group);
  //const memberInfo = groupInfo.members.find(member => member.userId === userId);
  roomWrapper.forEach(roomEl => {
    roomEl.removeChild(roomEl.querySelector(`li#${userId}`));
  });
  groupInfo.members = groupInfo.members.filter(member => member.userId != userId);
})

let userId;
let socketRooms = [];
let groupList;
const swiperWrapper = document.querySelector('.groups-container .swiper-wrapper');

(async() => {
  let response = await fetch('/study/bring-members-info', {
    method: 'post',
    headers: {
      'Content-Type': 'application/json'
    }
  });
  response = await response.json();
  groupList = response[3];
  userId = response[1];
  const groupWithUser = response[2];
  const groupMembers = response[3];
  if(!groupList) {
    return 0;
  }
  groupList.forEach((group, group_index) => {
      socketRooms.push(group.group_id);
      let members = '';
      const swiperSlide = document.createElement('div');
      swiperSlide.classList.add('swiper-slide');
      swiperSlide.classList.add( `font-${group.font}`)
      swiperSlide.setAttribute('id',  `group-${group.group_id}`);
      swiperSlide.innerHTML = `
      <div class="group-inner">
      <div class="group-name"><p>${group.name}</p></div>
      <div class="members">
      </div>
    </div>
      `
      swiperWrapper.appendChild(swiperSlide);
      group.members.forEach((member) => {
        const membersWrapper = swiperSlide.querySelector('.members');
        createMemberTimer(membersWrapper, member, group.group_id)

      })
      socket.emit('joinRoom', group.group_id, userId);
  });
  groupMembers.forEach((member) => {

  })
  const groupsSwiper = new Swiper('.groups-container .swiper-container', {
    // Optional parameters
    loop: true,
    slidesPerView: 1,
    uniqueNavElements: true,
    /* autoplay: { 
      disableOnInteraction: false,
      delay: 3000 
    }, */
    centeredSlides: true,
    // If we need pagination
    pagination: {
      el: '.groups .swiper-pagination',
    },
  
    // Navigation arrows
    navigation: {
      nextEl: '.groups-container .swiper-button-next',
      prevEl: '.groups-container .swiper-button-prev',
    }
  
  });
})();

// Inputs
const valueInput = document.querySelector('input#colorselection');
const colorInput = document.querySelector('input[type="color"]');

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
  '#3B2E25',
  '#FEC657',
];

let recommendedColorsIndex = 0;

colorInput.value = recommendedColors[recommendedColorsIndex];

// Sync the color from the picker
const syncColorFromPicker = () => {
  valueInput.value = colorInput.value;
};

// Sync the color from the field
const syncColorFromText = () => {
  colorInput.value = valueInput.value;
};

// Bind events to callbacks
colorInput.addEventListener("input", syncColorFromPicker, false);
valueInput.addEventListener("input", syncColorFromText, false);

// Optional: Trigger the picker when the text field is focused
valueInput.addEventListener("focus", () => colorInput.click(), false);

// Refresh the text field
syncColorFromPicker();

const subjectSaveBtn = document.querySelector("button#add-new-subject");
const subjectName = document.querySelector("input#subject");
subjectSaveBtn.addEventListener('click', async() => {
  let response = await fetch('/study/add-subject', {
    method: 'post',
    body: JSON.stringify({ name: subjectName.value, color: colorInput.value }),
    headers: {
      'Content-Type': 'application/json'
    }
  })
  // handle the response as needed
  response = await response.json();

  if(response.success) {
    timers.push({
      type: 0,
      hundredth: 0,
      sec: 0,
      min: 0,
      hr: 0,
      run: false,
      timer: null,
      secDisp: null,
      minDisp: null,
      hrDisp: null,
      playBtn: null,
      name: subjectName.value,
      color: colorInput.value,
      id: response.id
    });
    addSubject(timers[timers.length - 1]);
    addSubjectModal.classList.add('closed');
  }
})

window.addEventListener('beforeunload', function(event) {
  timers.forEach((timer) => {
    if(timer.run) {
      toggleTimer(timer)
    }
  })
});

const groupsActivateBtn = document.querySelector("#groups-activate");
const groupsViewer = document.querySelector(".groups-container")
groupsActivateBtn.addEventListener('click', () => {
  groupsViewer.classList.toggle('closed');
})

$('.sidebar-toggler').click(function () {
  $('.sidebar, .content').toggleClass("open");
  return false;
});

const timerSettingModal = document.getElementById("timer-setting");
const timerSettingModalCloseBtn = timerSettingModal.getElementsByClassName('fa-xmark')[0];
const timerSettingModalOpenBtn = document.getElementById('timer-activate');

timerSettingModalCloseBtn.addEventListener('click', () => {
  timerSettingModal.classList.add('closed')
})

timerSettingModalOpenBtn.addEventListener('click', () => {
  timerSettingModal.classList.remove('closed');
})