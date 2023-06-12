function createSubjects(subject_number, subject, subjectColor, savedTime) {
  const div = document.createElement("div");
  div.setAttribute("class", "SW d-1 item");
  div.setAttribute("id", "SW" + subject_number);
  div.setAttribute("draggable", "true");
  div.innerHTML = `<div id="disp">
  <div class="item-content">
  <span class="order">1</span>
</div>
  <div id="digits">
    <span id="hr${subject_number}">${timers[subject_number].hours.toString().padStart(2, '0')}:</span>
    <span id="min${subject_number}">${timers[subject_number].minutes.toString().padStart(2, '0')}:</span>
    <span id="sec${subject_number}">${timers[subject_number].seconds.toString().padStart(2, '0')}</span>
  </div>
  <div class = "subject">
    <span>${subject}</span>
  </div>
</div>
<div id="buttons">
  <div id="playBtn${subject_number}" class="button" style = "background: ${subjectColor}">
    <span class="material-symbols-outlined"><svg width="40px" height="40px" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" fill="#000000"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M3 2v12s6.333-2.833 10.666-6C9.333 4.833 3 2 3 2z" fill="gray" overflow="visible" style="marker:none" color="#000000"></path> </g></svg></span>
  </div>
</div>
`
  const timerContainer = document.querySelector(".timer .container");
  timerContainer.appendChild(div);
  div.addEventListener("dragstart", drag);
  div.addEventListener("drag", dragged);
  div.addEventListener("dragover", dragover);
  div.addEventListener("drop", drop);
  div.addEventListener("dragend", dragend);

  div.id = 'drag-item-' + subject_number;
}

function drag(e) {
  // hide gohst element
  e.target.classList.remove('d-1');
  e.dataTransfer.setDragImage(this.cloneNode(true), 0, 0);

  currPosY = e.clientY - e.target.offsetTop - 20;
  origPosY = e.target.offsetTop;
  e.target.style.position = 'relative';

  e.target.classList.add('item-dragged');
  //e.target.style.top = e.offsetY - currPosY + 'px';
};

function dragover(e) {
  //e.preventDefault();
}

function drop(e) {
  //e.preventDefault();
  /* var el = document.getElementById('info');
  var text = e.target.parentElement.innerText.replace(/\n/g,'<br>');
  el.innerHTML=text; */
}

function dragend(e) {
  e.preventDefault();
  e.target.classList.remove('item-dragged');
  e.target.style = null;
  e.target.classList.add('d-1');
};

function dragged(e) {
  e.preventDefault();
  var dropArea = e.target.parentNode;

  if (e.target.offsetTop < dropArea.offsetTop) {
    e.target.style.top = dropArea.offsetTop + 'px';
  } else if (e.target.offsetTop + e.target.offsetHeight > dropArea.offsetTop + dropArea.offsetHeight) {
    e.target.style.top = dropArea.offsetTop + dropArea.offsetHeight - e.target.offsetHeight + 'px';
  }

  elNextY = (e.target.nextElementSibling != null) ?
    e.target.nextElementSibling.offsetTop + e.target.nextElementSibling.offsetHeight / 2 : 0;
  elPrevY = (e.target.previousElementSibling != null) ?
    e.target.previousElementSibling.offsetTop : e.target.parentElement.offsetHeight;

  // reorder elements based on dragged item position
  if (e.clientY - currPosY + e.target.offsetHeight / 2 > elNextY && e.clientY - currPosY < elNextY + e.target.offsetHeight) {
    if (e.target.nextElementSibling) {
      e.target.parentElement.insertBefore(e.target.nextElementSibling, e.target);
      origPosY = e.target.offsetTop - e.target.offsetHeight;
    }
  }
  else if (e.clientY - currPosY < elPrevY + e.target.offsetHeight / 2 && e.clientY - currPosY > elPrevY) {
    if (e.target.previousElementSibling) {
      origPosY = e.target.previousElementSibling.offsetTop;
      e.target.parentElement.insertBefore(e.target, e.target.previousElementSibling);
    }
  }

  e.target.style.top = e.clientY - origPosY - currPosY + 'px';
}

if (typeof document.visibilityState !== "undefined") {
  document.addEventListener("visibilitychange", function() {
    if (document.visibilityState === "visible") {
      console.log("Page is visible.");
    } else {
      console.log("Page is hidden.");
      for (let i = 0; i < timers.length; i++) {
        if (timers[i].run == true) {
          toggleTimer(i);
          console.log(timers[i], timers[i].run);
          
        }
      }
    }
  });
}

function getOppositeHex(hex) {
  const dec = parseInt(hex.replace('#', ''), 16);
  const oppositeDec = parseInt(16777216 - dec);
  const oppositeHex = '#' + oppositeDec.toString(16);
  return oppositeHex
}
var timers = [];
const main = document.querySelector("main");
//main.classList.add('blur');
const askSubjectModal = document.querySelector(".modal-ask-subject .container .wrapper-1");
(async () => {
  try {
    const response = await fetch('/study/bring-subjects', {
      method: 'post',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    const subjects = await response.json();

    let data = [];
    let subjectOptions = '<option value="others" selected>others</option>';
    let subjectsList = '';
    const startTime = new Date().setHours(0, 0, 0, 0);
    const endTime = new Date().setHours(23, 59, 59, 999);

    subjects.forEach((subject, i) => {
      const { name, today, datum_point, timeline, color } = subject;
      subjectsList += `
        <div class="subject-calendar" id="${name}-calendar">
          <div class="checkbox-wrapper-4">
            <input class="inp-cbx" id="${name}-inp" type="checkbox"/>
            <label class="cbx" for="${name}-inp">
              <span>
                <svg width="12px" height="10px">
                  <use xlink:href="#check-4"></use>
                </svg>
              </span>
              <span>${name}</span>
            </label>
            <svg class="inline-svg">
              <symbol id="check-4" viewbox="0 0 12 10">
                <polyline points="1.5 6 4.5 9 10.5 1"></polyline>
              </symbol>
            </svg>
          </div>
        </div>`;

      subjectOptions += `<option value="${name}">${name}</option>`;

      const time = today * 1000;
      const filteredTimeline = timeline.filter(period => {
        const [start, end] = period.map(time => 1000 * (time + datum_point));
        return start >= startTime && end <= endTime;
      });

      timers.push({
        hundredth: 0,
        seconds: Math.floor((time / 1000) % 60),
        minutes: Math.floor((time / (1000 * 60)) % 60),
        hours: Math.floor(time / (1000 * 60 * 60)),
        run: false,
        timer: null,
        secDisp: null,
        minDisp: null,
        hrDisp: null,
        playBtn: null,
        name,
        color,
      });

      const label = document.createElement('label');
      label.setAttribute('for', `option${i}`);
      label.setAttribute('class', 'l-radio');
      label.innerHTML = `
        <input type="radio" id="option${i}" name="subject-selector" tabindex="${i + 1}" class="${i}">
        <span>${timers[i].name} (${timers[i].hours}h${timers[i].minutes}m ${timers[i].seconds}s)</span>
      `;

      document.querySelector('.modal-ask-subject .container .wrapper-1').appendChild(label);

      filteredTimeline.forEach(period => {
        const diffTime = new Date(period[1]) - new Date(period[0]);
        data.push({
          name: timers[i].name,
          start: new Date(period[0]).getTime(),
          end: new Date(period[1]).getTime(),
          text: `${Math.floor(diffTime / 1000 / 60 / 60)} hr ${Math.floor((diffTime / 1000 / 60)) % 60} min ${Math.floor((diffTime / 1000) % 60)} sec`,
          color,
        });
      });

      createSubjects(i, name, color, time);

      timers[i].secDisp = document.getElementById('sec' + i);
      timers[i].minDisp = document.getElementById('min' + i);
      timers[i].hrDisp = document.getElementById('hr' + i);
      timers[i].playBtn = document.getElementById('playBtn' + i);

      timers[i].playBtn.addEventListener('click', (function (index) {
        return function () {
          toggleTimer(index);
        };
      })(i));
    });

    const subjectsCalendarArea = document.querySelector('.planner .subjects-list');
    subjectsCalendarArea.innerHTML = subjectsList;

    subjects.forEach(subject => {
      const subjectRadioBtn = document.querySelector(`#${subject.name}-calendar .checkbox-wrapper-4 .inp-cbx`);
      subjectRadioBtn.addEventListener('change', (event) => {
        const cbxbox = event.target.parentElement.querySelector(`#${subject.name}-calendar label.cbx span`);
        if(event.target.checked) {
          cbxbox.style = `background-color: ${subject.color};`;
        } else {
          cbxbox.style = `background-color: transparent;`;
        }

      });
    });

    const planSubjectsArea = document.querySelector('.add-plan-modal select#subject-type');
    planSubjectsArea.innerHTML = subjectOptions;
  } catch (error) {
    console.error(error);
  }
})();


const restSvg = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" id="Capa_1" viewBox="0 0 460 460" xml:space="preserve" width="78px" height="78px" fill="#000000"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <g id="XMLID_1326_"> <path id="XMLID_1324_" style="fill:#CBB57A;" d="M285,295h50l-90,120h-10L285,295z"></path> <path id="XMLID_1325_" style="fill:#9E8E60;" d="M385,415h-10l-90-120h50L385,415z"></path> <path id="XMLID_1298_" style="fill:#4D4337;" d="M410,285L410,285c0,11.046-8.954,20-20,20H230c-11.046,0-20-8.954-20-20v0 c0-11.046,8.954-20,20-20h0.87l13.933-160.226C247.743,70.956,276.054,45,310,45h0c33.946,0,62.257,25.956,65.198,59.774 L389.13,265H390C401.046,265,410,273.954,410,285z"></path> <path id="XMLID_1295_" style="fill:#635547;" d="M370,270c0,2.761-2.239,5-5,5H255c-2.761,0-5-2.239-5-5s2.239-5,5-5h10 l8.326-95.752c1.654-19.023,17.579-33.623,36.674-33.623h0c19.095,0,35.02,14.6,36.674,33.623L355,265h10 C367.761,265,370,267.239,370,270z"></path> <path id="XMLID_1136_" style="fill:#9E8E60;" d="M120,415H0V225h120V415z M460,225h-20v190h20V225z"></path> <path id="XMLID_338_" style="fill:#766A54;" d="M100,315H20v-60h80V315z M100,335H20v60h80V335z"></path> <path id="XMLID_337_" style="fill:#D6CFBA;" d="M100,255v60H20v-60h20v10c0,5.523,4.477,10,10,10h20c5.523,0,10-4.477,10-10v-10 H100z M80,335v10c0,5.523-4.477,10-10,10H50c-5.523,0-10-4.477-10-10v-10H20v60h80v-60H80z"></path> <path id="XMLID_307_" style="fill:#833428;" d="M60,137v66c0,1.105-0.895,2-2,2H42c-1.105,0-2-0.895-2-2v-66c0-1.105,0.895-2,2-2 h16C59.105,135,60,135.895,60,137z"></path> <path id="XMLID_334_" style="fill:#374145;" d="M79.308,135.522l18.132,63.461c0.303,1.062-0.312,2.169-1.374,2.472l-15.384,4.396 c-1.062,0.303-2.169-0.312-2.472-1.374l-18.132-63.461c-0.303-1.062,0.312-2.169,1.374-2.472l15.384-4.396 C77.898,133.845,79.004,134.46,79.308,135.522z"></path> <path id="XMLID_308_" style="fill:#64757C;" d="M89.747,172.06l-19.23,5.494l-8.242-28.846l19.23-5.494L89.747,172.06z"></path> <path id="XMLID_245_" style="fill:#AC8428;" d="M60,155H40v-10h20V155z"></path> <path id="XMLID_1276_" style="fill:#374145;" d="M128.243,207.095c-1.617,0.359-3.22-0.661-3.579-2.278l-15.185-68.333 c-0.359-1.617,0.66-3.22,2.278-3.579c1.617-0.359,3.22,0.661,3.579,2.278l15.185,68.333 C130.881,205.133,129.861,206.736,128.243,207.095z"></path> <path id="XMLID_1297_" style="fill:#DDA333;" d="M141.114,128.651l-15.185,68.333c-0.359,1.617-1.962,2.637-3.579,2.278 c-1.617-0.359-2.637-1.962-2.278-3.579l15.185-68.333c0.359-1.617,1.962-2.637,3.579-2.278S141.474,127.034,141.114,128.651z"></path> <path id="XMLID_1817_" style="fill:#E0CFA6;" d="M130,187v36c0,1.105-0.895,2-2,2H32c-1.105,0-2-0.895-2-2v-36c0-1.105,0.895-2,2-2 h96C129.105,185,130,185.895,130,187z"></path> <path id="XMLID_1816_" style="fill:#D66A40;" d="M140,167v56c0,1.105-0.895,2-2,2h-26c-1.105,0-2-0.895-2-2v-56 c0-1.105,0.895-2,2-2h26C139.105,165,140,165.895,140,167z"></path> <path id="XMLID_1808_" style="fill:#CBB175;" d="M250,210v10h-40h-40v-10c0-5.523,4.477-10,10-10h20c5.523,0,10,4.477,10,10 c0-5.523,4.477-10,10-10h20C245.523,200,250,204.477,250,210z"></path> <path id="XMLID_1813_" style="fill:#E9CC85;" d="M250,210v10h-40v-10c0-5.523,4.477-10,10-10h20C245.523,200,250,204.477,250,210z"></path> <path id="XMLID_1807_" style="fill:#833428;" d="M254.833,211v6c0,1.105-0.895,2-2,2h-85.667c-1.105,0-2-0.895-2-2v-6 c0-1.105,0.895-2,2-2h85.667C253.938,209,254.833,209.895,254.833,211z"></path> <path id="XMLID_1805_" style="fill:#3F0900;" d="M216,215v2c0,1.105-0.895,2-2,2h-8c-1.105,0-2-0.895-2-2v-2c0-3.314,2.686-6,6-6 l0,0C213.314,209,216,211.686,216,215z"></path> <path id="XMLID_1747_" style="fill:#CBB57A;" d="M460,235H0v-20h460V235z"></path> </g> </g></svg>`
const createMemberTimer = (membersWrapper, member) => {
  const membersli = document.createElement('li');
  membersli.setAttribute('id', member.userId);
  membersli.innerHTML = `
  <div class="member">
    <div class="member-name">${member.name}</div>
    <div class="svg-area">${restSvg}</div>
    <div class="member-time">
      <div id="digits">
        <span class ="m-hr"></span>
        <span class="m-min"></span>
        <span class="m-sec"></span>
      </div>
    </div>
  </div>
  
  `;
  membersWrapper.appendChild(membersli)
  setTimeout(() => {
    member.timer = {
      hundredth: 0,
      seconds: Math.floor((member.today / 1000) % 60),
      minutes: Math.floor((member.today / (1000 * 60)) % 60),
      hours: Math.floor((member.today / (1000 * 60 * 60))),
      run: true,
      timer: null,
      secDisp: document.querySelectorAll(`#${member.userId} .m-sec`),
      minDisp: document.querySelectorAll(`#${member.userId} .m-min`),
      hrDisp: document.querySelectorAll(`#${member.userId} .m-hr`),
      playBtn: null,
    }
    member.timer.secDisp.forEach(el => {
      el.innerHTML = member.timer.seconds.toString().padStart(2, '0');
    })
    member.timer.minDisp.forEach(el => {
      el.innerHTML = member.timer.minutes.toString().padStart(2, '0') + ":";
    })
    member.timer.hrDisp.forEach(el => {
      el.innerHTML = member.timer.hours.toString().padStart(2, '0') + ":";
    })
  }, 0)
}
const socket = io(window.location.protocol + '//' + window.location.hostname);
// Listen for messages in the group

socket.on('sendstatus', (userId) => {
  /* socket.emit('sentTime', ()) */
})

socket.on('studying', (userId, groups) => {
  groups.forEach((group) => {
    const groupInfo = groupList.find(groupObj => groupObj.group_id == group);
    const memberInfo = groupInfo.members.find(member => member.userId === userId);
    memberInfo.timer.run = true;
    memberInfo.timer.timer = setInterval(function () {countMember(memberInfo.timer);}, 1000);
    //document.querySelector
    const memberSliders = document.querySelectorAll(`.groups .swiper-slide#${group} ul li#${userId}`);
    memberSliders.forEach((slider) => {
      slider.querySelector('.svg-area').innerHTML = `
      <svg height="77px" width="77px" version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 512 512" xml:space="preserve" fill="#000000"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path style="fill:#F4FFF9;" d="M500.87,22.261v467.478c0,6.147-4.983,11.13-11.13,11.13H22.261c-6.147,0-11.13-4.983-11.13-11.13 V22.261c0-6.147,4.983-11.13,11.13-11.13h467.478C495.886,11.13,500.87,16.114,500.87,22.261z"></path> <path style="fill:#A89B80;" d="M489.739,467.478v33.391c0,6.147-4.983,11.13-11.13,11.13H11.13C4.983,512,0,507.017,0,500.87 v-33.391c0-6.147,4.983-11.13,11.13-11.13h467.478C484.756,456.348,489.739,461.331,489.739,467.478z"></path> <path style="fill:#90B5BF;" d="M228.174,322.783v111.304H27.826V322.783c0-36.883,29.9-66.783,66.783-66.783h66.783 C198.274,256,228.174,285.9,228.174,322.783z"></path> <path style="fill:#769CA5;" d="M128,434.087H27.826V322.783c0-36.883,29.9-66.783,66.783-66.783H128V434.087z"></path> <path style="fill:#EFDDAB;" d="M250.435,512H150.261C137.966,512,128,502.034,128,489.739V345.043 c0-12.295,9.966-22.261,22.261-22.261h100.174c12.295,0,22.261,9.966,22.261,22.261v144.696 C272.696,502.034,262.729,512,250.435,512z"></path> <path style="fill:#C1B291;" d="M164.174,367.304c0-4.61,3.738-8.348,8.348-8.348h66.783c4.61,0,8.348,3.738,8.348,8.348 c0,4.61-3.738,8.348-8.348,8.348h-66.783C167.912,375.652,164.174,371.915,164.174,367.304z M239.304,392.348h-66.783 c-4.61,0-8.348,3.738-8.348,8.348c0,4.61,3.738,8.348,8.348,8.348h66.783c4.61,0,8.348-3.738,8.348-8.348 C247.652,396.085,243.915,392.348,239.304,392.348z M239.304,459.13h-66.783c-4.61,0-8.348,3.738-8.348,8.348 s3.738,8.348,8.348,8.348h66.783c4.61,0,8.348-3.738,8.348-8.348S243.915,459.13,239.304,459.13z M239.304,425.739h-44.522 c-4.61,0-8.348,3.738-8.348,8.348s3.738,8.348,8.348,8.348h44.522c4.61,0,8.348-3.738,8.348-8.348S243.915,425.739,239.304,425.739z "></path> <path style="fill:#F4C064;" d="M172.522,178.087c0,24.588-19.933,44.522-44.522,44.522s-44.522-19.933-44.522-44.522 s19.933-44.522,44.522-44.522C152.589,133.565,172.522,153.499,172.522,178.087z M128,422.957H72.348v-66.783 c0-6.147-4.983-11.13-11.13-11.13H27.826v100.174c0,12.295,9.966,22.261,22.261,22.261H128c12.295,0,22.261-9.966,22.261-22.261l0,0 C150.261,432.923,140.295,422.957,128,422.957z"></path> <path style="fill:#F4AB53;" d="M128,133.565v89.043c-24.588,0-44.522-19.933-44.522-44.522S103.412,133.565,128,133.565z"></path> <path style="fill:#B28D5B;" d="M484.174,189.217v111.304c0,6.147-4.983,11.13-11.13,11.13h-33.391h-33.391 c-6.147,0-11.13-4.983-11.13-11.13V189.217c0-6.147,4.983-11.13,11.13-11.13h22.261c6.147,0,11.13,4.983,11.13,11.13 c0-6.147,4.983-11.13,11.13-11.13h22.261C479.191,178.087,484.174,183.07,484.174,189.217z"></path> <path style="fill:#7F5D3B;" d="M461.913,178.087v133.565h-11.13c-6.147,0-11.13-4.983-11.13-11.13c0,6.147-4.983,11.13-11.13,11.13 h-22.261c-6.147,0-11.13-4.983-11.13-11.13V189.217c0-6.147,4.983-11.13,11.13-11.13h22.261c6.147,0,11.13,4.983,11.13,11.13 c0-6.147,4.983-11.13,11.13-11.13H461.913z"></path> <path style="fill:#FF8355;" d="M384,11.13v111.304c0,6.147-4.983,11.13-11.13,11.13h-33.391h-33.391 c-6.147,0-11.13-4.983-11.13-11.13V11.13c0-6.147,4.983-11.13,11.13-11.13h22.261c6.147,0,11.13,4.983,11.13,11.13 c0-6.147,4.983-11.13,11.13-11.13h22.261C379.017,0,384,4.983,384,11.13z"></path> <path style="fill:#E55D30;" d="M361.739,0v133.565h-22.261h-33.391c-6.147,0-11.13-4.983-11.13-11.13V11.13 c0-6.147,4.983-11.13,11.13-11.13h22.261c6.147,0,11.13,4.983,11.13,11.13c0-6.147,4.983-11.13,11.13-11.13H361.739z"></path> <path style="fill:#B28D5B;" d="M339.478,133.565h-33.391c-6.147,0-11.13-4.983-11.13-11.13V11.13c0-6.147,4.983-11.13,11.13-11.13 h22.261c6.147,0,11.13,4.983,11.13,11.13V133.565z"></path> <path style="fill:#7F5D3B;" d="M317.217,133.565h-11.13c-6.147,0-11.13-4.983-11.13-11.13V11.13c0-6.147,4.983-11.13,11.13-11.13 h11.13V133.565z"></path> <path style="fill:#769CA5;" d="M475.628,118.066l-19.278,11.13c-5.324,3.073-12.131,1.25-15.204-4.074L385.494,28.73 c-3.073-5.324-1.25-12.131,4.074-15.204l19.278-11.13c5.324-3.073,12.131-1.25,15.204,4.074l55.652,96.393 C482.776,108.184,480.952,114.992,475.628,118.066z"></path> <path style="fill:#5B7A7F;" d="M465.989,123.631l-9.639,5.565c-5.324,3.073-12.131,1.25-15.204-4.074L385.494,28.73 c-3.073-5.324-1.25-12.131,4.074-15.204l9.639-5.565L465.989,123.631z"></path> <path style="fill:#FFA233;" d="M428.522,311.652h-22.261c-6.147,0-11.13-4.983-11.13-11.13V189.217c0-6.147,4.983-11.13,11.13-11.13 h22.261c6.147,0,11.13,4.983,11.13,11.13v111.304C439.652,306.669,434.669,311.652,428.522,311.652z"></path> <path style="fill:#FF7E1D;" d="M417.391,311.652h-11.13c-6.147,0-11.13-4.983-11.13-11.13V189.217c0-6.147,4.983-11.13,11.13-11.13 h11.13V311.652z"></path> <path style="fill:#A89B80;" d="M503.652,141.913H269.913c-4.61,0-8.348-3.738-8.348-8.348c0-4.61,3.738-8.348,8.348-8.348h233.739 c4.61,0,8.348,3.738,8.348,8.348C512,138.175,508.262,141.913,503.652,141.913z M503.652,303.304H325.565 c-4.61,0-8.348,3.738-8.348,8.348s3.738,8.348,8.348,8.348h178.087c4.61,0,8.348-3.738,8.348-8.348S508.262,303.304,503.652,303.304 z"></path> <path style="fill:#C1B291;" d="M367.304,456.348H500.87c6.147,0,11.13,4.983,11.13,11.13v33.391c0,6.147-4.983,11.13-11.13,11.13 H367.304c-6.147,0-11.13-4.983-11.13-11.13v-33.391C356.174,461.331,361.157,456.348,367.304,456.348z"></path> <path style="fill:#DBCBA1;" d="M367.304,422.957H500.87c6.147,0,11.13,4.983,11.13,11.13v33.391c0,6.147-4.983,11.13-11.13,11.13 H367.304c-6.147,0-11.13-4.983-11.13-11.13v-33.391C356.174,427.94,361.157,422.957,367.304,422.957z"></path> <path style="fill:#EFDDAB;" d="M367.304,389.565H500.87c6.147,0,11.13,4.983,11.13,11.13v33.391c0,6.147-4.983,11.13-11.13,11.13 H367.304c-6.147,0-11.13-4.983-11.13-11.13v-33.391C356.174,394.548,361.157,389.565,367.304,389.565z"></path> <path style="fill:#DBCBA1;" d="M486.957,389.565v22.261c0,4.61-3.738,8.348-8.348,8.348s-8.348-3.738-8.348-8.348v-22.261H486.957z M436.87,411.826c0,4.61,3.738,8.348,8.348,8.348s8.348-3.738,8.348-8.348v-22.261H436.87V411.826z M403.478,411.826 c0,4.61,3.738,8.348,8.348,8.348c4.61,0,8.348-3.738,8.348-8.348v-22.261h-16.696V411.826z"></path> </g></svg>
      `
    })
    console.log(groupList, memberInfo.timer);
  })
});

socket.on('stopstudying', (userId, groups) => {
  groups.forEach((group) => {
    const groupInfo = groupList.find(groupObj => groupObj.group_id == group);
    const memberInfo = groupInfo.members.find(member => member.userId === userId);
    memberInfo.timer.run = false;
    clearInterval(memberInfo.timer.timer)
    const memberSliders = document.querySelectorAll(`.groups .swiper-slide#${group} ul li#${userId}`);
    memberSliders.forEach((slider) => {
    slider.querySelector('.svg-area').innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" id="Capa_1" viewBox="0 0 460 460" xml:space="preserve" width="78px" height="78px" fill="#000000"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <g id="XMLID_1326_"> <path id="XMLID_1324_" style="fill:#CBB57A;" d="M285,295h50l-90,120h-10L285,295z"></path> <path id="XMLID_1325_" style="fill:#9E8E60;" d="M385,415h-10l-90-120h50L385,415z"></path> <path id="XMLID_1298_" style="fill:#4D4337;" d="M410,285L410,285c0,11.046-8.954,20-20,20H230c-11.046,0-20-8.954-20-20v0 c0-11.046,8.954-20,20-20h0.87l13.933-160.226C247.743,70.956,276.054,45,310,45h0c33.946,0,62.257,25.956,65.198,59.774 L389.13,265H390C401.046,265,410,273.954,410,285z"></path> <path id="XMLID_1295_" style="fill:#635547;" d="M370,270c0,2.761-2.239,5-5,5H255c-2.761,0-5-2.239-5-5s2.239-5,5-5h10 l8.326-95.752c1.654-19.023,17.579-33.623,36.674-33.623h0c19.095,0,35.02,14.6,36.674,33.623L355,265h10 C367.761,265,370,267.239,370,270z"></path> <path id="XMLID_1136_" style="fill:#9E8E60;" d="M120,415H0V225h120V415z M460,225h-20v190h20V225z"></path> <path id="XMLID_338_" style="fill:#766A54;" d="M100,315H20v-60h80V315z M100,335H20v60h80V335z"></path> <path id="XMLID_337_" style="fill:#D6CFBA;" d="M100,255v60H20v-60h20v10c0,5.523,4.477,10,10,10h20c5.523,0,10-4.477,10-10v-10 H100z M80,335v10c0,5.523-4.477,10-10,10H50c-5.523,0-10-4.477-10-10v-10H20v60h80v-60H80z"></path> <path id="XMLID_307_" style="fill:#833428;" d="M60,137v66c0,1.105-0.895,2-2,2H42c-1.105,0-2-0.895-2-2v-66c0-1.105,0.895-2,2-2 h16C59.105,135,60,135.895,60,137z"></path> <path id="XMLID_334_" style="fill:#374145;" d="M79.308,135.522l18.132,63.461c0.303,1.062-0.312,2.169-1.374,2.472l-15.384,4.396 c-1.062,0.303-2.169-0.312-2.472-1.374l-18.132-63.461c-0.303-1.062,0.312-2.169,1.374-2.472l15.384-4.396 C77.898,133.845,79.004,134.46,79.308,135.522z"></path> <path id="XMLID_308_" style="fill:#64757C;" d="M89.747,172.06l-19.23,5.494l-8.242-28.846l19.23-5.494L89.747,172.06z"></path> <path id="XMLID_245_" style="fill:#AC8428;" d="M60,155H40v-10h20V155z"></path> <path id="XMLID_1276_" style="fill:#374145;" d="M128.243,207.095c-1.617,0.359-3.22-0.661-3.579-2.278l-15.185-68.333 c-0.359-1.617,0.66-3.22,2.278-3.579c1.617-0.359,3.22,0.661,3.579,2.278l15.185,68.333 C130.881,205.133,129.861,206.736,128.243,207.095z"></path> <path id="XMLID_1297_" style="fill:#DDA333;" d="M141.114,128.651l-15.185,68.333c-0.359,1.617-1.962,2.637-3.579,2.278 c-1.617-0.359-2.637-1.962-2.278-3.579l15.185-68.333c0.359-1.617,1.962-2.637,3.579-2.278S141.474,127.034,141.114,128.651z"></path> <path id="XMLID_1817_" style="fill:#E0CFA6;" d="M130,187v36c0,1.105-0.895,2-2,2H32c-1.105,0-2-0.895-2-2v-36c0-1.105,0.895-2,2-2 h96C129.105,185,130,185.895,130,187z"></path> <path id="XMLID_1816_" style="fill:#D66A40;" d="M140,167v56c0,1.105-0.895,2-2,2h-26c-1.105,0-2-0.895-2-2v-56 c0-1.105,0.895-2,2-2h26C139.105,165,140,165.895,140,167z"></path> <path id="XMLID_1808_" style="fill:#CBB175;" d="M250,210v10h-40h-40v-10c0-5.523,4.477-10,10-10h20c5.523,0,10,4.477,10,10 c0-5.523,4.477-10,10-10h20C245.523,200,250,204.477,250,210z"></path> <path id="XMLID_1813_" style="fill:#E9CC85;" d="M250,210v10h-40v-10c0-5.523,4.477-10,10-10h20C245.523,200,250,204.477,250,210z"></path> <path id="XMLID_1807_" style="fill:#833428;" d="M254.833,211v6c0,1.105-0.895,2-2,2h-85.667c-1.105,0-2-0.895-2-2v-6 c0-1.105,0.895-2,2-2h85.667C253.938,209,254.833,209.895,254.833,211z"></path> <path id="XMLID_1805_" style="fill:#3F0900;" d="M216,215v2c0,1.105-0.895,2-2,2h-8c-1.105,0-2-0.895-2-2v-2c0-3.314,2.686-6,6-6 l0,0C213.314,209,216,211.686,216,215z"></path> <path id="XMLID_1747_" style="fill:#CBB57A;" d="M460,235H0v-20h460V235z"></path> </g> </g></svg>
    `
    })
  })
});

socket.on('sendTime', (userId) => {
  let subject = ''
  timers.forEach((timer) => {
    if(timer.run){
      subject = timer.name;
    }
  });
  //socket.emit('timeResponse', )
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
  const roomWrapper = document.querySelectorAll(`.groups .swiper-slide#${group} ul `);
  const groupInfo = groupList.find(groupObj => groupObj.group_id == group);
  groupInfo.members.push(response);
  const memberInfo = response;
  roomWrapper.forEach(roomEl => {
    createMemberTimer(roomEl, memberInfo)
  })
})

socket.on('removeUser', (group, userId) => {
  const roomWrapper = document.querySelectorAll(`.groups .swiper-slide#${group} ul`);
  const groupInfo = groupList.find(groupObj => groupObj.group_id == group);
  //const memberInfo = groupInfo.members.find(member => member.userId === userId);
  roomWrapper.forEach(roomEl => {
    roomEl.removeChild(roomEl.querySelector(`li#${userId}`));
  });
  groupInfo.members = groupInfo.members.filter(member => member.userId != userId);
})


const swiperWrapper = document.querySelector('.groups .swiper-wrapper');
let userId;
var socketRooms = [];
var groupList;
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
  groupList.forEach((group, group_index) => {
      socketRooms.push(group.group_id);
      let members = '';
      const swiperSlide = document.createElement('div');
      swiperSlide.setAttribute('class', 'swiper-slide');
      swiperSlide.setAttribute('id',  group.group_id);
      swiperSlide.innerHTML = `
      <div class="group-inner">
      <div class="group-name">${group.name}</div>
      <div class="members">
        <ul>
        </ul>
      </div>
    </div>
      `
      swiperWrapper.appendChild(swiperSlide);
      group.members.forEach((member, member_index) => {
        const membersWrapper = swiperSlide.querySelector('ul');
        createMemberTimer(membersWrapper, member)
        

      })
      socket.emit('joinRoom', group.group_id, userId);
  });
  swiperWrapper.innerHTML += `
  <div class="swiper-button-next"></div>
  <div class="swiper-button-prev"></div>
  <div class="swiper-pagination"></div>
  `
  groupMembers.forEach((member) => {

  })
  initializeSlider();
  new Swiper('.planner .swiper-container#planner', {
    // Optional parameters
    loop: true,
    allowTouchMove: false,
    mouse: {
      // Disable mouse interactions
      enabled: false,
    },
    slidesPerView: 1,
    /* autoplay: { 
      disableOnInteraction: false,
      delay: 3000 
    }, */
    centeredSlides: true,
    // If we need pagination
    pagination: {
      el: '.planner .swiper-pagination',
    },
  
    // Navigation arrows
    navigation: {
      nextEl: '.calendar-btn.nextday',
      prevEl: '.calendar-btn.prevday',
    }
  
  });
  planDragZones = document.querySelectorAll(".plan-drag-zone");
  planDragZones.forEach((planDragZone) => {
    planDragZone.addEventListener('click', (event) => {
      //console.log(event.clientX, event.clientY);
      //addPlanModal.classList.remove('modal-closed');
      console.log(event.target)
      if(event.target == planDragZone || event.target.classList.contains('block')){
        console.log(true)
        addPlanModal.classList.remove('modal-closed');
        createPlan(event.clientX, event.clientY, planDragZone)
      }
    });
  })
})();

function toggleTimer(index) {
  var timer = timers[index];
  if (timer.run) {
    clearInterval(timer.timer);
    timer.playBtn.innerHTML = `<span class="material-symbols-outlined"><svg width="40px" height="40px" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" fill="#000000"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M3 2v12s6.333-2.833 10.666-6C9.333 4.833 3 2 3 2z" fill="gray" overflow="visible" style="marker:none" color="#000000"></path> </g></svg></span>`;
    timer.run = false;

    (async () => {
      const start = await fetch('/study/stop', {
        method: 'post',
        body: JSON.stringify({ name: timer.name, index: index }),
        headers: {
          'Content-Type': 'application/json'
        }
      })
      // handle the response as needed
    })();

  } else {
    timer.timer = setInterval(function () { count(index); }, 1000);
    timer.playBtn.innerHTML = `<span class="material-symbols-outlined"><svg fill="#000000" width="40px" height="40px" viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M46.677 64.652c0-9.362 7.132-17.387 16.447-17.394 9.315-.007 24.677.007 34.55.007 9.875 0 17.138 7.594 17.138 16.998 0 9.403-.083 119.094-.083 127.82 0 8.726-7.58 16.895-16.554 16.837-8.975-.058-25.349.115-34.963.058-9.614-.058-16.646-7.74-16.646-17.254 0-9.515.11-117.71.11-127.072zm14.759.818s-.09 118.144-.09 123.691c0 5.547 3.124 5.315 6.481 5.832 3.358.518 21.454.47 24.402.47 2.947 0 7.085-1.658 7.167-6.14.08-4.483-.082-119.507-.082-123.249 0-3.742-4.299-4.264-7.085-4.66-2.787-.395-25.796 0-25.796 0l-4.997 4.056zm76.664-.793c.027-9.804 7.518-17.541 17.125-17.689 9.606-.147 25.283.148 35.004.148 9.72 0 17.397 8.52 17.397 17.77s-.178 117.809-.178 127c0 9.192-7.664 17.12-16.323 17.072-8.66-.05-26.354 0-34.991.048-8.638.05-17.98-8.582-18.007-17.783-.027-9.201-.055-116.763-.027-126.566zm16.917.554s-.089 118.145-.089 123.692c0 5.547 3.123 5.314 6.48 5.832 3.359.518 21.455.47 24.402.47 2.948 0 7.086-1.659 7.167-6.141.081-4.482-.08-119.506-.08-123.248 0-3.742-4.3-4.265-7.087-4.66-2.786-.396-25.796 0-25.796 0l-4.997 4.055z" fill-rule="evenodd"></path> </g></svg></span>`;
    timer.run = true;
    const activatedBtn = document.querySelector(`#drag-item-${index}`);
    const subjectContainer = document.querySelector(".timer .container");
    subjectContainer.insertBefore(activatedBtn, subjectContainer.firstChild);
    /* activatedBtn.style.top = subjectContainer.offsetTop - activatedBtn.offsetTop + "px";
    activatedBtn.classList.add('move-top'); */
    const subjects = document.querySelectorAll('.SW');
    for (let i = 0; i < subjects.length; i++) {
      if (timers[i].run == true && i != index) {
        toggleTimer(i);
      }
    }

    (async () => {
      const start = await fetch('/study/start', {
        method: 'post',
        body: JSON.stringify({ name: timer.name, index: index }),
        headers: {
          'Content-Type': 'application/json'
        }
      })
      // handle the response as needed
    })();
  }
}

function resetTimer(index) {
  var timer = timers[index];

  clearInterval(timer.timer);
  timer.playBtn.innerHTML = `<span class="material-symbols-outlined"><svg width="40px" height="40px" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" fill="#000000"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M3 2v12s6.333-2.833 10.666-6C9.333 4.833 3 2 3 2z" fill="gray" overflow="visible" style="marker:none" color="#000000"></path> </g></svg></span>`;
  timer.secDisp.innerHTML = timer.seconds.toString().padStart(2, '0');
  timer.minDisp.innerHTML = timer.minutes.toString().padStart(2, '0') + ":";
  timer.hrDisp.innerHTML = timer.hours.toString().padStart(2, '0') + ":";
  timer.hundredth = 0;
  timer.seconds = 0;
  timer.minutes = 0;
  timer.hours = 0;
  timer.run = false;
}

function count(index) {
  const timer = timers[index];

  timer.hundredth += 1;

  timer.seconds += 1;

  if (timer.seconds == 60) {
    timer.seconds = 0;
    timer.minutes += 1;
  }

  if (timer.minutes == 60) {
    timer.minutes == 0;
    timer.hours += 1;
  }
  disp(timer.hundredth, timer.seconds, timer.minutes, timer.hours, index);
}

function countMember(membertimer) {
  //let membertimer = groupList
  
  membertimer.hundredth += 1;

  membertimer.seconds += 1;

  if (membertimer.seconds == 60) {
    membertimer.seconds = 0;
    membertimer.minutes += 1;
  }

  if (membertimer.minutes == 60) {
    membertimer.minutes == 0;
    membertimer.hours += 1;
  }
  membersdisp(membertimer.hundredth, membertimer.seconds, membertimer.minutes, membertimer.hours, membertimer);
}

function disp(hun, sec, min, hr, index) {
  const timer = timers[index];

  timer.secDisp.innerHTML = sec.toLocaleString(undefined, { minimumIntegerDigits: 2 });
  timer.minDisp.innerHTML = min.toLocaleString(undefined, { minimumIntegerDigits: 2 }) + ':';
  timer.hrDisp.innerHTML = hr.toLocaleString(undefined, { minimumIntegerDigits: 2 }) + ':';
}

function membersdisp(hun, sec, min, hr, memberTimer) {
  memberTimer.secDisp.forEach(el => {
    el.innerHTML = sec.toLocaleString(undefined, { minimumIntegerDigits: 2 });
  })
  memberTimer.minDisp.forEach(el => {
    el.innerHTML = min.toLocaleString(undefined, { minimumIntegerDigits: 2 }) + ':';
  })
  memberTimer.hrDisp.forEach(el => {
    el.innerHTML = hr.toLocaleString(undefined, { minimumIntegerDigits: 2 }) + ':';
  })
  /* membertimer.secDisp.innerHTML = sec.toLocaleString(undefined, { minimumIntegerDigits: 2 });
  membertimer.minDisp.innerHTML = min.toLocaleString(undefined, { minimumIntegerDigits: 2 }) + ':';
  membertimer.hrDisp.innerHTML = hr.toLocaleString(undefined, { minimumIntegerDigits: 2 }) + ':'; */
}

const addSubjectBtn = document.querySelectorAll(".add-subject");
const addSubjectModal = document.querySelector(".subject-modal#subject-adder");

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
addSubjectBtn[0].addEventListener('click', () => {
  addSubjectModal.style.display = "block";
  const color = document.querySelector("input.subject-color");
  recommendedColorsIndex = document.querySelectorAll(".SW").length;
  color.value = recommendedColors[recommendedColorsIndex];
  main.classList.add('blur');
});

addSubjectBtn[1].addEventListener('click', () => {
  document.querySelector('.modal-ask-subject').style = "display: none";
  addSubjectModal.style.display = "block";
  const color = document.querySelector("input.subject-color");
  recommendedColorsIndex = document.querySelectorAll(".SW").length;
  color.value = recommendedColors[recommendedColorsIndex];
  main.classList.add('blur');
});

addSubjectModal.querySelector('.close-btn').addEventListener('click', () => {
  addSubjectModal.style.display = "none";
  main.classList.remove('blur');
});

document.querySelector('.modal-ask-subject').querySelector('.close-btn').addEventListener('click', () => {
  document.querySelector('.modal-ask-subject').style.display = "none";
  main.classList.remove('blur');
});



const addSubjectSubmitBtn = document.querySelector(".blob-btn#add");
const startSubjectBtn = document.querySelector(".blob-btn#start");
addSubjectSubmitBtn.addEventListener('click', () => {
  const name = document.querySelector("input.subject-name");
  const color = document.querySelector("input.subject-color");
  (async () => {
    const response = await fetch('/study/add-subject', {
      method: 'post',
      body: JSON.stringify({ name: name.value, color: color.value }),
      headers: {
        'Content-Type': 'application/json'
      }
    })
    // handle the response as needed
  })();

  timers.push({
    hundredth: 0,
    seconds: 0,
    minutes: 0,
    hours: 0,
    run: false,
    timer: null,
    secDisp: null,
    minDisp: null,
    hrDisp: null,
    playBtn: null,
    name: name,
    color: color,
  });


  const subjects = document.querySelectorAll(".SW");
  createSubjects(subjects.length, name.value, color.value);
  name.value = "";
  recommendedColorsIndex += 1;
  color.value = recommendedColors[recommendedColorsIndex];

  // Initialize the timer object
  timers[subjects.length].secDisp = document.getElementById('sec' + subjects.length);
  timers[subjects.length].minDisp = document.getElementById('min' + subjects.length);
  timers[subjects.length].hrDisp = document.getElementById('hr' + subjects.length);
  timers[subjects.length].playBtn = document.getElementById('playBtn' + subjects.length);

  // Add a click event listener to the play button
  timers[subjects.length].playBtn.addEventListener('click', (function (index) {
    return function () {
      toggleTimer(index);
    }
  })(subjects.length));
})

startSubjectBtn.addEventListener("click", () => {
  const selectedSubject = document.querySelector(".wrapper-1 input[name='subject-selector']:checked");
  document.querySelector(".modal-ask-subject").style = "display: none";
  main.classList.remove('blur');
  toggleTimer(selectedSubject.classList[0])
})


/* //calendar
var selectedDateEl = null; // variable to store previously selected date element

var calendarEl = document.getElementById('calendar');
var calendar = new FullCalendar.Calendar(calendarEl, {
  initialView: 'dayGridMonth',
  themeSystem: 'bootstrap5',
  headerToolbar: {
    left: 'prev,next today',
    center: 'title',
    right: 'dayGridMonth,timeGridWeek,timeGridDay'
  },
  events: [
    // your events data here
  ],
  dateClick: function (info) {
    console.log('Clicked date: ' + info.dateStr, info.dayEl);

    // reset background color of previously selected date
    if (selectedDateEl) {
      selectedDateEl.style.backgroundColor = '';
    }

    // change background color of selected date
    selectedDateEl = info.dayEl;
    selectedDateEl.style.backgroundColor = 'rgba(255, 220, 40, .15)';
  }
});
calendar.render();
 */


function initializeSlider() {
  // Initialize the Swiper slider
  const swiper = new Swiper('.groups .swiper-container', {
    // Optional parameters
    loop: true,
    slidesPerView: 1,
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
      nextEl: '.groups .swiper-button-next',
      prevEl: '.groups .swiper-button-prev',
    }
  
  });
}

//todo 

const taskInput = document.querySelector(".task-input input"),
  filters = document.querySelectorAll(".filters span"),
  clearAll = document.querySelector(".clear-btn"),
  taskBox = document.querySelector(".task-box");

let editId,
  isEditTask = false,
  todos = JSON.parse(localStorage.getItem("todo-list"));

filters.forEach((btn) => {
  btn.addEventListener("click", () => {
    document.querySelector("span.active").classList.remove("active");
    btn.classList.add("active");
    showTodo(btn.id);
  });
});

showTodo("all");

function showTodo(filter) {
  let liTag = "";
  if (todos) {
    todos.forEach((todo, id) => {
      let completed = todo.status == "completed" ? "checked" : "";
      if (filter == todo.status || filter == "all") {
        liTag += `<li class="task">
                            <label for="${id}">
                                <input onclick="updateStatus(this)" type="checkbox" id="${id}" ${completed}>
                                <p class="${completed}">${todo.name}</p>
                            </label>
                            <div class="settings">
                                <i onclick="showMenu(this)" class="uil uil-ellipsis-h"></i>
                                <ul class="task-menu">
                                    <li onclick='editTask(${id}, "${todo.name}")'><i class="uil uil-pen"></i>Edit</li>
                                    <li onclick='deleteTask(${id}, "${filter}")'><i class="uil uil-trash"></i>Delete</li>
                                </ul>
                            </div>
                        </li>`;
      }
    });
  }
  taskBox.innerHTML = liTag || `<span>You don't have any task here</span>`;
  let checkTask = taskBox.querySelectorAll(".task");
  !checkTask.length
    ? clearAll.classList.remove("active")
    : clearAll.classList.add("active");
  taskBox.offsetHeight >= 300
    ? taskBox.classList.add("overflow")
    : taskBox.classList.remove("overflow");
}

function showMenu(selectedTask) {
  let menuDiv = selectedTask.parentElement.lastElementChild;
  menuDiv.classList.add("show");
  document.addEventListener("click", (e) => {
    if (e.target.tagName != "I" || e.target != selectedTask) {
      menuDiv.classList.remove("show");
    }
  });
}

function updateStatus(selectedTask) {
  let taskName = selectedTask.parentElement.lastElementChild;
  if (selectedTask.checked) {
    taskName.classList.add("checked");
    todos[selectedTask.id].status = "completed";
  } else {
    taskName.classList.remove("checked");
    todos[selectedTask.id].status = "pending";
  }
  localStorage.setItem("todo-list", JSON.stringify(todos));
}

function editTask(taskId, textName) {
  editId = taskId;
  isEditTask = true;
  taskInput.value = textName;
  taskInput.focus();
  taskInput.classList.add("active");
}

function deleteTask(deleteId, filter) {
  isEditTask = false;
  todos.splice(deleteId, 1);
  localStorage.setItem("todo-list", JSON.stringify(todos));
  showTodo(filter);
}

clearAll.addEventListener("click", () => {
  isEditTask = false;
  todos.splice(0, todos.length);
  localStorage.setItem("todo-list", JSON.stringify(todos));
  showTodo();
});

taskInput.addEventListener("keyup", (e) => {
  let userTask = taskInput.value.trim();
  if (e.key == "Enter" && userTask) {
    if (!isEditTask) {
      todos = !todos ? [] : todos;
      let taskInfo = { name: userTask, status: "pending" };
      todos.push(taskInfo);
    } else {
      isEditTask = false;
      todos[editId].name = userTask;
    }
    taskInput.value = "";
    localStorage.setItem("todo-list", JSON.stringify(todos));
    showTodo(document.querySelector("span.active").id);
  }
});

//sidebar
function toggleSidebar() {
  document.getElementsByClassName("side-button")[0].classList.toggle("active");
  if(!main.classList.contains('move-to-right') && !main.classList.contains('move-to-left')){
  } else {
    main.classList.toggle("move-to-right");
  }
  var sidebarItems = document.getElementsByClassName("sidebar-item");
  for (var i = 0; i < sidebarItems.length; i++) {
    sidebarItems[i].classList.toggle("active");
  }
}
const sidebarButton = document.querySelectorAll(".side-button");
sidebarButton[0].addEventListener("click", function() {
  toggleSidebar();
});

document.addEventListener("keyup", function(e) {
  if (e.keyCode === 27) {
    toggleSidebar();
  }
});


//change main viewer
const groupsViewer = document.querySelector(".groups");
const analysisViewer = document.querySelector(".analysis");
const plannerViewer = document.querySelector(".planner");
const groupsButton = document.querySelector('.viewer-selection .selection-wrapper #f-option');
const analysisButton = document.querySelector('.viewer-selection .selection-wrapper #s-option');
const plannerButton = document.querySelector('.viewer-selection .selection-wrapper #t-option');

groupsButton.addEventListener('change', () => {
  if(groupsButton.checked){
    groupsViewer.style = 'display: block';
    analysisViewer.style = "display: none";
    plannerViewer.style = "display: none";
  }
})

analysisButton.addEventListener('change', () => {
  if(analysisButton.checked){
    groupsViewer.style = 'display: none';
    analysisViewer.style = "display: block";
    plannerViewer.style = "display: none";
  }
})

plannerButton.addEventListener('change', () => {
  if(plannerButton.checked){
    groupsViewer.style = 'display: none';
    analysisViewer.style = "display: none";
    plannerViewer.style = "display: flex";
  }
})



//calendar for sidebar

const months = [
'January', 
'February', 
'March', 
'April', 
'May', 
'June', 
'July', 
'August', 
'September', 
'October', 
'November', 
'December'
];

const weekdays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];



let date = new Date();

function getCurrentDate(element, asString) {
  if (element) {
      if (asString) {
          return element.textContent = months[date.getMonth()] + ' ' +date.getDate();
      }
      return element.value = date.toISOString().substr(0, 10);
  }
  return date;
}

function generateCalendar() {

  const calendar = document.getElementById('calendar');
  if (calendar) {
      calendar.remove();
  }

  const table = document.createElement("table");
  table.id = "calendar";

  const trHeader = document.createElement('tr');
  trHeader.className = 'weekends';
  weekdays.map(week => {
      const th = document.createElement('th');
      const w = document.createTextNode(week.substring(0, 3));
      th.appendChild(w);
      trHeader.appendChild(th);
  });

  table.appendChild(trHeader);

  const weekDay = new Date(
      date.getFullYear(),
      date.getMonth(),
      1
  ).getDay();

  const lastDay = new Date(
      date.getFullYear(),
      date.getMonth() + 1,
      0
  ).getDate();

  let tr = document.createElement("tr");
  let td = '';
  let empty = '';
  let btn = document.createElement('button');
  let week = 0;


  while (week < weekDay) {
      td = document.createElement("td");
      empty = document.createTextNode(' ');
      td.appendChild(empty);
      tr.appendChild(td);
      week++;
  }

  for (let i = 1; i <= lastDay;) {
      while (week < 7) {
          td = document.createElement('td');
          let text = document.createTextNode(i);
          btn = document.createElement('button');
          btn.className = "btn-day";
          btn.addEventListener('click', function () { changeDate(this) });
          week++;

          if (i <= lastDay) {
              i++;
              btn.appendChild(text);
              td.appendChild(btn)
          } else {
              text = document.createTextNode(' ');
              td.appendChild(text);
          }
          tr.appendChild(td);
      }
      table.appendChild(tr);

      tr = document.createElement("tr");

      week = 0;
  }
  const content = document.getElementById('table');
  content.appendChild(table);
  changeActive();
  changeHeader(date);
  document.getElementById('date').textContent = date;
  getCurrentDate(document.getElementById("currentDate"), true);
  getCurrentDate(document.getElementById("date"), false);
}

function setDate(form) {
  let newDate = new Date(form.date.value);
  date = new Date(newDate.getFullYear(), newDate.getMonth(), newDate.getDate() + 1);
  generateCalendar();
  return false;
}

function changeHeader(dateHeader) {
  const month = document.getElementById("month-header");
  if (month.childNodes[0]) {
      month.removeChild(month.childNodes[0]);
  }
  const headerMonth = document.createElement("h1");
  const textMonth = document.createTextNode(months[dateHeader.getMonth()].substring(0, 3) + " " + dateHeader.getFullYear());
  headerMonth.appendChild(textMonth);
  month.appendChild(headerMonth);
}

function changeActive() {
  let btnList = document.querySelectorAll('button.active');
  btnList.forEach(btn => {
      btn.classList.remove('active');
  });
  btnList = document.getElementsByClassName('btn-day');
  for (let i = 0; i < btnList.length; i++) {
      const btn = btnList[i];
      if (btn.textContent === (date.getDate()).toString()) {
          btn.classList.add('active');
      }
  }
}

function resetDate() {
  date = new Date();
  generateCalendar();
  updatePlanner();
}

function changeDate(button) {
  let newDay = parseInt(button.textContent);
  date = new Date(date.getFullYear(), date.getMonth(), newDay);
  generateCalendar();
}

function nextMonth() {
  date = new Date(date.getFullYear(), date.getMonth() + 1, 1);
  generateCalendar(date);
}

function prevMonth() {
  date = new Date(date.getFullYear(), date.getMonth() - 1, 1);
  generateCalendar(date);
}


function prevDay() {
  date = new Date(date.getFullYear(), date.getMonth(), date.getDate() - 1);
  generateCalendar();
  updatePlanner();
}

function nextDay() {
  date = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);
  generateCalendar();
  updatePlanner();
}

document.onload = generateCalendar(date);


const addPlanModal = document.querySelector('.add-plan-modal');
const addPlanModalCloseBtn = document.querySelector('.add-plan-modal .close');
const addPlanModalOpenBtn = document.querySelector('#create-plan');

addPlanModalCloseBtn.addEventListener('click', () => {
  addPlanModal.classList.add('modal-closed')
})

addPlanModalOpenBtn.addEventListener('click', () => {
  addPlanModal.classList.remove('modal-closed');
})

//update calendar plan as user change values


class Calendar {
  constructor(inputSelector) {
      this.input = document.querySelector(inputSelector);
      this.form = this.input.parentElement;
      this.popupContainer = null;
      this.monthContainer = null;
      this.tableContainer = null;
      this.table = document.createElement("table");
      this.months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
      this.selectedMonth = new Date().getMonth();
      this.selectedYear = new Date().getFullYear();
      this.today = new Date().getDate();

      this.buildCalendar();
      this.setMainEventListener();
      this.fillInput(this.today)
  }
  
  buildCalendar() {
      this.popupContainer = document.createElement("div");
      this.popupContainer.classList.add("calendar-popup");
      this.form.appendChild(this.popupContainer);

      
      this.monthContainer = document.createElement("div");
      this.monthContainer.classList.add("month-and-year");
      this.monthContainer.innerHTML = `<h4>${this.getMonth()} ${this.getYear()}</h4>`;
      this.popupContainer.appendChild(this.monthContainer);

      this.createButtons();

      this.populateTable(this.selectedMonth, this.selectedYear);
      //this.fillInput(selectedDay);
  }

  createButtons() {
      const prev = document.createElement("button");
      prev.classList.add('button', 'prev');
      prev.innerHTML = `<svg fill="#000000" version="1.1" baseProfile="tiny" id="Layer_1" xmlns:x="&amp;ns_extend;" xmlns:i="&amp;ns_ai;" xmlns:graph="&amp;ns_graphs;" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:a="http://ns.adobe.com/AdobeSVGViewerExtensions/3.0/" width="20px" height="20px" viewBox="0 0 42 42" xml:space="preserve"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <polygon fill-rule="evenodd" points="31,38.32 13.391,21 31,3.68 28.279,1 8,21.01 28.279,41 "></polygon> </g></svg>`;
      const next = document.createElement("button");
      next.classList.add('button', 'next');
      next.innerHTML = `<svg fill="#000000" version="1.1" baseProfile="tiny" id="Layer_1" xmlns:x="&amp;ns_extend;" xmlns:i="&amp;ns_ai;" xmlns:graph="&amp;ns_graphs;" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:a="http://ns.adobe.com/AdobeSVGViewerExtensions/3.0/" width="20px" height="20px" viewBox="0 0 42 42" xml:space="preserve"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <polygon fill-rule="evenodd" points="11,38.32 28.609,21 11,3.68 13.72,1 34,21.01 13.72,41 "></polygon> </g></svg>`;

      prev.addEventListener("click", e => {
          e.preventDefault();
          this.updateMonth(this.selectedMonth - 1);
      });

      next.addEventListener("click", e => {
          e.preventDefault();
          this.updateMonth(this.selectedMonth + 1);
      });

      this.popupContainer.appendChild(prev);
      this.popupContainer.appendChild(next);
  }

  populateTable(month, year) {
      this.table.innerHTML = "";

      const namesRow = document.createElement("tr");
      ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].forEach(name => {
          const th = document.createElement("th");
          th.innerHTML = name;
          namesRow.appendChild(th);
      });
      this.table.appendChild(namesRow);

      const tempDate = new Date(year, month, 1);
      let firstMonthDay = tempDate.getDay();
      firstMonthDay = firstMonthDay === 0 ? 7 : tempDate.getDay();

      const daysInMonth = this.getDaysInMonth(month, year);
      const j = daysInMonth + firstMonthDay - 1;

      let tr = document.createElement("tr");

      if (firstMonthDay-1 !== 0) {
          tr = document.createElement("tr");
          this.table.appendChild(tr);
      }

      for (let i=0; i<firstMonthDay-1; i++) {
          const td = document.createElement("td");
          td.innerHTML = "";
          tr.appendChild(td);
      }

      for (let i = firstMonthDay-1; i<j; i++) {
          if(i % 7 === 0){
              tr = document.createElement("tr");
              this.table.appendChild(tr);
          }

          const td = document.createElement("td");
          td.innerText = i - firstMonthDay + 2;
          td.dayNr = i - firstMonthDay + 2;
          td.classList.add("day");

          td.addEventListener("click", e => {
              const selectedDay = e.target.innerHTML;
              this.fillInput(selectedDay);
              this.hideCalendar();
          });

          tr.appendChild(td);
      }

      this.popupContainer.appendChild(this.table);
  }

  fillInput(day) {
      day = day < 10 ? "0" + day : day;
      let month = null;
      month = this.selectedMonth < 9 ? "0" + (this.selectedMonth + 1) : this.selectedMonth + 1;
      this.input.value = `${month}.${day}.${this.selectedYear}`;
      const dateParts = this.input.value.split('.');

      const newYear = parseInt(dateParts[2]);
      const newMonth = parseInt(dateParts[0]) - 1;
      const newDay = parseInt(dateParts[1]);

      const date = new Date(newYear, newMonth, newDay);

      const options = {
        weekday: 'long',
        month: 'long',
        day: 'numeric'
      };

      const formattedDate = date.toLocaleDateString('en-US', options);

      this.input.value = formattedDate;
  }

  updateMonth(month) {
      this.selectedMonth = month;
      if (this.selectedMonth < 0) {
          this.selectedYear--;
          this.selectedMonth = 11;
      } else if (this.selectedMonth > 11) {
          this.selectedYear++;
          this.selectedMonth = 0;
      }
      this.monthContainer.innerHTML = `<h4>${this.months[this.selectedMonth]} ${this.selectedYear}</h4>`;

      this.populateTable(this.selectedMonth, this.selectedYear)
  }
  
  getMonth() {
      return this.months[this.selectedMonth];
  }

  getYear() {
      return this.selectedYear;
  }

  getDaysInMonth(month, year) {
      return new Date(year, month + 1, 0).getDate();
  }
  
  hideCalendar() {
      this.form.classList.remove("open");
  }

  setMainEventListener() {
      this.input.addEventListener("click", e => {
          this.form.classList.toggle("open");
          
          if(!this.form.classList.contains("open")) {
              this.hideCalendar();
          }
      });
  }
}

const calendar = new Calendar(".date-input");

//time selection
const planStartTime = document.querySelector('.start-time select#timepicker');
const planEndTime = document.querySelector('.end-time select#timepicker');

const currentDateTime = new Date();
const currentHour = currentDateTime.getHours();
const currentMinute = currentDateTime.getMinutes();

let expectedHour = currentHour;
let expectedMinute = Math.round(currentMinute / 15) * 15;
if (expectedMinute === 60) {
  expectedMinute = 0;
  expectedHour += 1;
}


for (let hour = 0; hour <= 23; hour++) {
  for (let minute = 0; minute <= 45; minute += 15) {
    const timeValue = `${hour}.${minute}`;
    const timeText = formatTime(hour, minute);

    const option = createOption(timeValue, timeText);
    planStartTime.appendChild(option);

    if (hour === expectedHour && minute === expectedMinute) {
      option.selected = true;
    }
  }
}

function formatTime(hour, minute) {
  const period = hour < 12 ? 'AM' : 'PM';
  const hour12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
  const minuteText = minute === 0 ? '00' : minute;
  return `${hour12}:${minuteText} ${period}`;
}

let prevStartTime = planStartTime.value.split('.');
updateEndTimeOptions();

planStartTime.addEventListener('change', (event) => {
  const updatedStartTime = planStartTime.value.split('.');
  const prevEndTime = planEndTime.value.split('.');
  const duration = `${prevEndTime[0] - prevStartTime[0]}.${prevEndTime[1] - prevStartTime[1]}`;
  let hrDiff = prevEndTime[0] - prevStartTime[0];
  let minDiff = prevEndTime[1] - prevStartTime[1];
  prevStartTime = updatedStartTime;
  updateEndTimeOptions();

  if (minDiff < 0) {
    minDiff += 60;
    hrDiff -= 1;
  }

  if (minDiff === 60) {
    minDiff = 0;
  }

  console.log(duration, hrDiff, minDiff);
  let updatedHr = parseInt(updatedStartTime[0]) + hrDiff;
  let updatedMin = parseInt(updatedStartTime[1]) + minDiff;

  if (updatedMin >= 60) {
    updatedMin -= 60;
    updatedHr += 1;
  }

  const updatedEndTime = [updatedHr, updatedMin];
  console.log(updatedEndTime);
  const selectedEndInput = document.querySelector(`.end-time option[value="${updatedEndTime[0]}.${updatedEndTime[1]}"]`);
  console.log(`.end-time option[value="${updatedEndTime[0]}.${updatedEndTime[1]}"]`);
  selectedEndInput.selected = true;
});

function updateEndTimeOptions() {
  planEndTime.innerHTML = '';
  let duration1 = 0;

  for (let minute = parseInt(prevStartTime[1]); minute <= 60; minute += 15) {
    let hour = parseInt(prevStartTime[0]);
    let timeValue = `${hour}.${minute}`;
    let timeText = formatTime(hour, minute);

    if (hour > 24) {
      timeValue = `${hour - 24}.${minute}`;
      timeText = formatTime(hour - 24, minute);

      if (minute === 60) {
        timeText = formatTime(hour - 23, 0);
        timeValue = `${hour - 23}.00`;
      }
    } else if (minute === 60) {
      timeText = formatTime(hour + 1, 0);
      timeValue = `${hour + 1}.00`;
    }

    const option = createOption(timeValue, timeText + `  (${duration1}min)`);
    planEndTime.appendChild(option);

    if (hour === expectedHour + 1 && minute === expectedMinute) {
      option.selected = true;
      console.log('eds', hour, minute);
    }

    duration1 += 15;
  }

  for (let hour = parseInt(prevStartTime[0]) + 1; hour <= 23 + parseInt(prevStartTime[0]); hour++) {
    for (let minute = parseInt(prevStartTime[1]); minute <= 45 + parseInt(prevStartTime[1]); minute += 30) {
      let timeValue = `${hour}.${minute}`;
      let timeText = formatTime(hour, minute);

      if (hour > 24) {
        timeValue = `${hour - 24}.${minute}`;
        timeText = formatTime(hour - 24, minute);
        if(minute >= 60){
          timeValue = `${hour - 23}.${minute - 60}`;
          timeText = formatTime(hour - 23, minute - 60);
        }
      } else if(minute >= 60){
        timeValue = `${hour + 1}.${minute - 60}`;
        timeText = formatTime(hour + 1, minute - 60);
      }

      const option = createOption(timeValue, timeText);
      let hrDiff = hour - prevStartTime[0];
      let minDiff = minute - prevStartTime[1];

      if (minDiff < 0) {
        minDiff += 60;
        hrDiff -= 1;
      }

      if (minDiff === 60) {
        minDiff = 0;
      }


      if (hrDiff === 0) {
        option.textContent = timeText + `  (${minDiff}min)`;
      } else {
        option.textContent = timeText + `  (${hrDiff + minDiff / 60}hr)`;
      }

      planEndTime.appendChild(option);

      if (hour === expectedHour + 1 && minute === expectedMinute) {
        option.selected = true;
        console.log('eds', hour, minute);
      }
    }
  }
}

function createOption(value, text) {
  const option = document.createElement('option');
  option.value = value;
  option.textContent = text;
  return option;
}

//add description animatiion

const descriptionContainer = document.querySelector('.add-plan-modal .description .form-group');
const descriptionInput = document.querySelector('.add-plan-modal .description .textarea');
const planName =  document.querySelector("input[name='plan-name']")
const descriptionOpts = document.querySelector('.description .text-options');
const boldBtn = document.querySelector('.add-plan-modal .description #bold');
const italicBtn = document.querySelector('.add-plan-modal .description #italic');
const underlineBtn = document.querySelector('.add-plan-modal .description #underline');
const numberedLiBtn = document.querySelector('.add-plan-modal .description #numbered-li');
const bulletedLiBtn = document.querySelector('.add-plan-modal .description #bulleted-li');

planName.addEventListener('change', () => {
  generatedPlan.querySelector('.plan-name span').innerText = planName.value;
})
//const insertLinkBtn = document.querySelector('.add-plan-modal .description #insert-link');
//const removeFormattingBtn = document.querySelector('.add-plan-modal .description #remove-formatting');
let typeStyle = [];

descriptionContainer.addEventListener('focusin', () => {
  descriptionInput.style = 'height: 100px;'
  descriptionInput.setAttribute('rows', 3);
  descriptionOpts.classList.add('visible');
})

/* descriptionContainer.addEventListener('focusout', (event) => {
  const isDescendant = descriptionContainer.contains(event.relatedTarget);
  if (!isDescendant) {
    descriptionInput.style.height = '50px';
    descriptionOpts.classList.remove('visible');
  }
}) */

boldBtn.addEventListener('click', () => {
  boldBtn.classList.toggle('clicked');
  document.execCommand('bold', false, null);
});

italicBtn.addEventListener('click', () => {
  italicBtn.classList.toggle('clicked');
  document.execCommand('italic', false, null);
});

underlineBtn.addEventListener('click', () => {
  underlineBtn.classList.toggle('clicked');
  document.execCommand('underline', false, null);
});

numberedLiBtn.addEventListener('click', () => {
  document.execCommand('insertorderedlist', false, null);
  numberedLiBtn.classList.toggle('clicked');
});

bulletedLiBtn.addEventListener('click', () => {
  document.execCommand('insertunorderedlist', false, null);
  numberedLiBtn.classList.toggle('clicked');
});

//plan save

const planSaveBtn = document.querySelector(".end-btn #plan-save-btn");
planSaveBtn.addEventListener('click', async() => {
  const name =  planName.value;
  const date = [calendar.input.value, planEndTime.value, planStartTime.value];
  const repeat = document.querySelector("select[name='repeat']").value;
  const description = descriptionInput.innerHTML;
  const subject = document.querySelector("select[name='subject-type']").value;
  const notification = document.querySelector("select[name='notification']").value;

  let response = await fetch('/study/add-plan', {
    method: 'post',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({name: name, date: date, repeat: repeat, description: description, subject: subject, notification: notification})
  });

  response = await response.json();

  if(response.success){
    name = '';
    description = '';
    addPlanModal.classList.add('modal-closed');
  }
})

const sidebarSubjectsShowBtn = document.querySelector(".subjects-show-btn");
sidebarSubjectsShowBtn.status = true;
const dropdownArrow1 = `<svg width="40px" height="40px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" transform="rotate(0)"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path fill-rule="evenodd" clip-rule="evenodd" d="M12.7071 14.7071C12.3166 15.0976 11.6834 15.0976 11.2929 14.7071L6.29289 9.70711C5.90237 9.31658 5.90237 8.68342 6.29289 8.29289C6.68342 7.90237 7.31658 7.90237 7.70711 8.29289L12 12.5858L16.2929 8.29289C16.6834 7.90237 17.3166 7.90237 17.7071 8.29289C18.0976 8.68342 18.0976 9.31658 17.7071 9.70711L12.7071 14.7071Z" fill="#5F6368"></path> </g></svg>`;
const dropdownArrow2 = `<svg width="40px" height="40px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" transform="rotate(180)"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path fill-rule="evenodd" clip-rule="evenodd" d="M12.7071 14.7071C12.3166 15.0976 11.6834 15.0976 11.2929 14.7071L6.29289 9.70711C5.90237 9.31658 5.90237 8.68342 6.29289 8.29289C6.68342 7.90237 7.31658 7.90237 7.70711 8.29289L12 12.5858L16.2929 8.29289C16.6834 7.90237 17.3166 7.90237 17.7071 8.29289C18.0976 8.68342 18.0976 9.31658 17.7071 9.70711L12.7071 14.7071Z" fill="#5F6368"></path> </g></svg>`;
sidebarSubjectsShowBtn.addEventListener('click', () => {
  if(sidebarSubjectsShowBtn.status){
    sidebarSubjectsShowBtn.querySelector('.svg-wrapper').innerHTML = dropdownArrow2;
    sidebarSubjectsShowBtn.status = false;
    sidebarSubjectsShowBtn.parentElement.querySelector('.subjects-list').classList.add('closed');
    sidebarSubjectsShowBtn.parentElement.querySelector('.subjects-list').classList.remove('open');
  } else {
    sidebarSubjectsShowBtn.querySelector('.svg-wrapper').innerHTML = dropdownArrow1;
    sidebarSubjectsShowBtn.status = true;
    sidebarSubjectsShowBtn.parentElement.querySelector('.subjects-list').classList.remove('closed');
    sidebarSubjectsShowBtn.parentElement.querySelector('.subjects-list').classList.add('open');
  }
})
let generatedPlan;
let binded = null;
let initialMouseY = -1;
let planDragged = false;
function mouseUp(target, e) {
  target.style.opacity = "1";
  console.log('up')
  target.parentNode.removeEventListener('mousemove', binded);
  planDragged = false;
  if(initialMouseY == -1){
    console.log('not dragged');
  }
}

function mouseDown(target, e) {
  target.style.opacity = "0.8";
  console.log('down')
  binded = divMove.bind(null, target);
  target.parentNode.addEventListener('mousemove', binded);
  generatedPlan = target;
  planDragged = true;
  //target.addEventListener('mouseup', mouseUp.bind(null, target), false);
}

function divMove(target, e) {
  e.preventDefault();
  let dropArea = target.parentNode;
  let parentRect = dropArea.getBoundingClientRect();
  let elementRect = target.getBoundingClientRect();
  initialMouseY = e.clientY;

  // Calculate the correct top position relative to the parent container
  let topPosition = e.clientY - parentRect.top + dropArea.scrollTop - 30;
  updatePlannerTime(topPosition, 60, target);


  // Apply the top position to the dragged element
  target.style.position = 'absolute';
  target.style.top = topPosition + 'px';
  target.style.cursor = 'move';
  //console.log(e.target.style.top, e.clientY, elementRect.top, target.offsetTop, dropArea.scrollTop, topPosition);
}

let planDragZones = document.querySelectorAll(".plan-drag-zone");
const planDragZone = planDragZones[0];

function createPlan(x, y, planDragZone) {
  console.log('create')
  let dropArea = planDragZone;
  let parentRect = dropArea.getBoundingClientRect();
  let topPosition = y - parentRect.top + dropArea.scrollTop;
  const div = document.createElement('div');
  div.classList.add('plan');

  div.innerHTML = `
  <div class="plan-display-zone">
  <div class="plan-name">
    <span>(no title)</span>  
  </div>
  <div class = "plan-time-info">
    <span></span>
  </div>
  </div>
  `;

  div.addEventListener('mousedown', mouseDown.bind(null, div), false);
  div.addEventListener('mouseup', mouseUp.bind(null, div), false);

  planDragZone.appendChild(div);
  generatedPlan = div;
  updatePlannerTime(topPosition, 60, div);
  div.style.top = topPosition + 'px';
}

planDragZone.addEventListener('scroll', (e) => {
  if(planDragged){
    e.preventDefault()
    let dropArea = generatedPlan.parentNode;
    let parentRect = dropArea.getBoundingClientRect();
    
    // Calculate the correct top position relative to the parent container
    let topPosition = initialMouseY - parentRect.top + dropArea.scrollTop - 30;
    // Apply the top position to the dragged element
    generatedPlan.style.position = 'absolute';
    generatedPlan.style.top = topPosition + 'px';
    console.log(generatedPlan, topPosition, initialMouseY, parentRect.top, dropArea.scrollTop)
    generatedPlan.style.cursor = 'move';
  }
})



function updatePlanner() {
  const plans = document.querySelectorAll('.plan-display-zone');
  plans.forEach((plan) => {
    plan.style = 'display: none';
    console.log(plan)
  })
}

function updatePlannerTime(topPosition, duration, div) {
  const startTime = Math.floor((topPosition / 60 - 0.5) * 100 + 3) / 100;
  const endTime = Math.floor(((topPosition + 60) / 60 - 0.5) * 100 + 3) / 100;
  const startHr = parseInt(startTime.toString().split('.')[0]) == 0 ? 12 : parseInt(startTime.toString().split('.')[0]);
  const startMin = startTime % 1 !== 0 ? Math.round(parseInt(startTime.toString().split('.')[1]) / 10 * 6) : 0;
  div.querySelector('.plan-time-info span').innerText = `${startHr}:${startMin.toString().padStart(2, '0')}`;
}