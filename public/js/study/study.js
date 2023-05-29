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


var timers = [];
const main = document.querySelector(".main");
main.classList.add('blur');
const askSubjectModal = document.querySelector(".modal-ask-subject .container .wrapper-1");
(async () => {
  const response = await fetch('/study/bring-subjects', {
    method: 'post',
    headers: {
      'Content-Type': 'application/json'
    }
  })

  let subjects = await response.json();

  let data = [];

  const startTime = new Date().setHours(0, 0, 0, 0);
  const endTime = new Date().setHours(23, 59, 59, 999);
  for (let i = 0; i < subjects.length; i++) {
    const time = subjects[i].today * 1000;
    const datumPoint = subjects[i].datum_point;
    const filteredTimeline = subjects[i].timeline.filter(period => {
      let [start, end] = period;
      start = 1000 * (start + datumPoint);
      end = 1000 * (end + datumPoint);
      console.log(start, end);
      return start >= startTime && end <= endTime;
    });
    timers.push({
      hundredth: 0,
      seconds: Math.floor((time / 1000) % 60),
      minutes: Math.floor((time / (1000 * 60)) % 60),
      hours: Math.floor((time / (1000 * 60 * 60))),
      run: false,
      timer: null,
      secDisp: null,
      minDisp: null,
      hrDisp: null,
      playBtn: null,
      name: subjects[i].name,
      color: subjects[i].color,
    });
    //modal asking subject
    const label = document.createElement("label");
    label.setAttribute("for", `option${i}`);
    label.setAttribute("class", "l-radio");
    label.innerHTML = `
    <input type="radio" id="option${i}" name="subject-selector" tabindex="${i + 1}" class = "${i}">
    <span>${timers[i].name} (${timers[i].hours}h${timers[i].minutes}m ${timers[i].seconds}s)</span>
    `
    document.querySelector(".modal-ask-subject .container .wrapper-1").appendChild(label);
    for (let j = 0; j < filteredTimeline.length; j++) {
      const diffTime = new Date(filteredTimeline[j][1]) - new Date(filteredTimeline[j][0]);
      data.push({
        name: timers[i].name,
        start: new Date(filteredTimeline[j][0]).getTime(),
        end: new Date(filteredTimeline[j][1]).getTime(),
        text: `${Math.floor(diffTime / 1000 / 60 / 60)} hr ${Math.floor((diffTime / 1000 / 60)) % 60} min ${Math.floor((diffTime / 1000) % 60)} sec`,
        color: subjects[i].color,
      })
    }
    createSubjects(i, subjects[i].name, subjects[i].color, time);
    // Initialize the timer object
    timers[i].secDisp = document.getElementById('sec' + i);
    timers[i].minDisp = document.getElementById('min' + i);
    timers[i].hrDisp = document.getElementById('hr' + i);
    timers[i].playBtn = document.getElementById('playBtn' + i);

    // Add a click event listener to the play button
    timers[i].playBtn.addEventListener('click', (function (index) {
      return function () {
        toggleTimer(index);
      }
    })(i));
  }

  var dropArea = document.getElementsByClassName(".timer .container");
  var currPosY = -1,
    origPosY = -1;

  var draggable = document.getElementsByClassName("item");

  [].forEach.call(draggable, function (el, i) {
    el.addEventListener("dragstart", drag);
    el.addEventListener("drag", dragged);
    el.addEventListener("dragover", dragover);
    el.addEventListener("drop", drop);
    el.addEventListener("dragend", dragend);

    el.id = 'drag-item-' + i;
  });
/*   const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  Highcharts.setOptions({
    time: {
      timezone: timezone,
      useUTC: false
    },
  });
  
  const startPT = new Date(startTime).toLocaleString('en-US', {
    timeZone: timezone,
    timeZoneOffset: -7
  });
  const endPT = new Date(endTime).toLocaleString('en-US', {
    timeZone: timezone,
    timeZoneOffset: -7
  });
  
  Highcharts.ganttChart('chart-container', {
    title: {
      text: 'Gantt Chart Example'
    },
    
    xAxis: {
      type: 'datetime',
      currentDateIndicator: true,
      min: new Date(startPT).getTime(),
      max: new Date(endPT).getTime()
    },
    yAxis: {
      uniqueNames: true
    },
    rangeSelector: {
      enabled: true,
      buttons: [{
        type: 'day',
        count: 1,
        text: 'D',
      }, {
        type: 'week',
        count: 1,
        text: 'W'
      }, {
        type: 'month',
        count: 1,
        text: 'M'
      }, {
        type: 'year',
        count: 1,
        text: 'Y'
      }, {
        type: 'ytd',
        text: 'YPD'
      },{
        type: 'all',
        text: 'All'
      }
    
    ],
      selected: 4, // default to YPD
    },
    
    series: [{
      name: 'Tasks',
      data: data,
      tooltip: {
        pointFormatter: function () {
          const start = Highcharts.dateFormat('%Y-%m-%d', this.start);
          const end = Highcharts.dateFormat('%Y-%m-%d', this.end);
          const text = this.text;
          return `${this.name}: ${start} - ${end} (${text} completed)`;
        }
      },
      dataLabels: {
        enabled: true,
        formatter: function () {
          return this.point.options.text;
        }
      }
    }],
    connectNulls: false
  }); */
  

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
  console.log("test")
  /* socket.emit('sentTime', ()) */
})

socket.on('studying', (userId, groups) => {
  groups.forEach((group) => {
    const groupInfo = groupList.find(groupObj => groupObj.group_id == group);
    const memberInfo = groupInfo.members.find(member => member.userId === userId);
    memberInfo.timer.run = true;
    console.log('timer', memberInfo.timer)
    memberInfo.timer.timer = setInterval(function () {countMember(memberInfo.timer);}, 1000);
    //document.querySelector
    const memberSliders = document.querySelectorAll(`.swiper-slide#${group} ul li#${userId}`);
    memberSliders.forEach((slider) => {
      slider.querySelector('.svg-area').innerHTML = `
      <svg height="77px" width="77px" version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 512 512" xml:space="preserve" fill="#000000"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path style="fill:#F4FFF9;" d="M500.87,22.261v467.478c0,6.147-4.983,11.13-11.13,11.13H22.261c-6.147,0-11.13-4.983-11.13-11.13 V22.261c0-6.147,4.983-11.13,11.13-11.13h467.478C495.886,11.13,500.87,16.114,500.87,22.261z"></path> <path style="fill:#A89B80;" d="M489.739,467.478v33.391c0,6.147-4.983,11.13-11.13,11.13H11.13C4.983,512,0,507.017,0,500.87 v-33.391c0-6.147,4.983-11.13,11.13-11.13h467.478C484.756,456.348,489.739,461.331,489.739,467.478z"></path> <path style="fill:#90B5BF;" d="M228.174,322.783v111.304H27.826V322.783c0-36.883,29.9-66.783,66.783-66.783h66.783 C198.274,256,228.174,285.9,228.174,322.783z"></path> <path style="fill:#769CA5;" d="M128,434.087H27.826V322.783c0-36.883,29.9-66.783,66.783-66.783H128V434.087z"></path> <path style="fill:#EFDDAB;" d="M250.435,512H150.261C137.966,512,128,502.034,128,489.739V345.043 c0-12.295,9.966-22.261,22.261-22.261h100.174c12.295,0,22.261,9.966,22.261,22.261v144.696 C272.696,502.034,262.729,512,250.435,512z"></path> <path style="fill:#C1B291;" d="M164.174,367.304c0-4.61,3.738-8.348,8.348-8.348h66.783c4.61,0,8.348,3.738,8.348,8.348 c0,4.61-3.738,8.348-8.348,8.348h-66.783C167.912,375.652,164.174,371.915,164.174,367.304z M239.304,392.348h-66.783 c-4.61,0-8.348,3.738-8.348,8.348c0,4.61,3.738,8.348,8.348,8.348h66.783c4.61,0,8.348-3.738,8.348-8.348 C247.652,396.085,243.915,392.348,239.304,392.348z M239.304,459.13h-66.783c-4.61,0-8.348,3.738-8.348,8.348 s3.738,8.348,8.348,8.348h66.783c4.61,0,8.348-3.738,8.348-8.348S243.915,459.13,239.304,459.13z M239.304,425.739h-44.522 c-4.61,0-8.348,3.738-8.348,8.348s3.738,8.348,8.348,8.348h44.522c4.61,0,8.348-3.738,8.348-8.348S243.915,425.739,239.304,425.739z "></path> <path style="fill:#F4C064;" d="M172.522,178.087c0,24.588-19.933,44.522-44.522,44.522s-44.522-19.933-44.522-44.522 s19.933-44.522,44.522-44.522C152.589,133.565,172.522,153.499,172.522,178.087z M128,422.957H72.348v-66.783 c0-6.147-4.983-11.13-11.13-11.13H27.826v100.174c0,12.295,9.966,22.261,22.261,22.261H128c12.295,0,22.261-9.966,22.261-22.261l0,0 C150.261,432.923,140.295,422.957,128,422.957z"></path> <path style="fill:#F4AB53;" d="M128,133.565v89.043c-24.588,0-44.522-19.933-44.522-44.522S103.412,133.565,128,133.565z"></path> <path style="fill:#B28D5B;" d="M484.174,189.217v111.304c0,6.147-4.983,11.13-11.13,11.13h-33.391h-33.391 c-6.147,0-11.13-4.983-11.13-11.13V189.217c0-6.147,4.983-11.13,11.13-11.13h22.261c6.147,0,11.13,4.983,11.13,11.13 c0-6.147,4.983-11.13,11.13-11.13h22.261C479.191,178.087,484.174,183.07,484.174,189.217z"></path> <path style="fill:#7F5D3B;" d="M461.913,178.087v133.565h-11.13c-6.147,0-11.13-4.983-11.13-11.13c0,6.147-4.983,11.13-11.13,11.13 h-22.261c-6.147,0-11.13-4.983-11.13-11.13V189.217c0-6.147,4.983-11.13,11.13-11.13h22.261c6.147,0,11.13,4.983,11.13,11.13 c0-6.147,4.983-11.13,11.13-11.13H461.913z"></path> <path style="fill:#FF8355;" d="M384,11.13v111.304c0,6.147-4.983,11.13-11.13,11.13h-33.391h-33.391 c-6.147,0-11.13-4.983-11.13-11.13V11.13c0-6.147,4.983-11.13,11.13-11.13h22.261c6.147,0,11.13,4.983,11.13,11.13 c0-6.147,4.983-11.13,11.13-11.13h22.261C379.017,0,384,4.983,384,11.13z"></path> <path style="fill:#E55D30;" d="M361.739,0v133.565h-22.261h-33.391c-6.147,0-11.13-4.983-11.13-11.13V11.13 c0-6.147,4.983-11.13,11.13-11.13h22.261c6.147,0,11.13,4.983,11.13,11.13c0-6.147,4.983-11.13,11.13-11.13H361.739z"></path> <path style="fill:#B28D5B;" d="M339.478,133.565h-33.391c-6.147,0-11.13-4.983-11.13-11.13V11.13c0-6.147,4.983-11.13,11.13-11.13 h22.261c6.147,0,11.13,4.983,11.13,11.13V133.565z"></path> <path style="fill:#7F5D3B;" d="M317.217,133.565h-11.13c-6.147,0-11.13-4.983-11.13-11.13V11.13c0-6.147,4.983-11.13,11.13-11.13 h11.13V133.565z"></path> <path style="fill:#769CA5;" d="M475.628,118.066l-19.278,11.13c-5.324,3.073-12.131,1.25-15.204-4.074L385.494,28.73 c-3.073-5.324-1.25-12.131,4.074-15.204l19.278-11.13c5.324-3.073,12.131-1.25,15.204,4.074l55.652,96.393 C482.776,108.184,480.952,114.992,475.628,118.066z"></path> <path style="fill:#5B7A7F;" d="M465.989,123.631l-9.639,5.565c-5.324,3.073-12.131,1.25-15.204-4.074L385.494,28.73 c-3.073-5.324-1.25-12.131,4.074-15.204l9.639-5.565L465.989,123.631z"></path> <path style="fill:#FFA233;" d="M428.522,311.652h-22.261c-6.147,0-11.13-4.983-11.13-11.13V189.217c0-6.147,4.983-11.13,11.13-11.13 h22.261c6.147,0,11.13,4.983,11.13,11.13v111.304C439.652,306.669,434.669,311.652,428.522,311.652z"></path> <path style="fill:#FF7E1D;" d="M417.391,311.652h-11.13c-6.147,0-11.13-4.983-11.13-11.13V189.217c0-6.147,4.983-11.13,11.13-11.13 h11.13V311.652z"></path> <path style="fill:#A89B80;" d="M503.652,141.913H269.913c-4.61,0-8.348-3.738-8.348-8.348c0-4.61,3.738-8.348,8.348-8.348h233.739 c4.61,0,8.348,3.738,8.348,8.348C512,138.175,508.262,141.913,503.652,141.913z M503.652,303.304H325.565 c-4.61,0-8.348,3.738-8.348,8.348s3.738,8.348,8.348,8.348h178.087c4.61,0,8.348-3.738,8.348-8.348S508.262,303.304,503.652,303.304 z"></path> <path style="fill:#C1B291;" d="M367.304,456.348H500.87c6.147,0,11.13,4.983,11.13,11.13v33.391c0,6.147-4.983,11.13-11.13,11.13 H367.304c-6.147,0-11.13-4.983-11.13-11.13v-33.391C356.174,461.331,361.157,456.348,367.304,456.348z"></path> <path style="fill:#DBCBA1;" d="M367.304,422.957H500.87c6.147,0,11.13,4.983,11.13,11.13v33.391c0,6.147-4.983,11.13-11.13,11.13 H367.304c-6.147,0-11.13-4.983-11.13-11.13v-33.391C356.174,427.94,361.157,422.957,367.304,422.957z"></path> <path style="fill:#EFDDAB;" d="M367.304,389.565H500.87c6.147,0,11.13,4.983,11.13,11.13v33.391c0,6.147-4.983,11.13-11.13,11.13 H367.304c-6.147,0-11.13-4.983-11.13-11.13v-33.391C356.174,394.548,361.157,389.565,367.304,389.565z"></path> <path style="fill:#DBCBA1;" d="M486.957,389.565v22.261c0,4.61-3.738,8.348-8.348,8.348s-8.348-3.738-8.348-8.348v-22.261H486.957z M436.87,411.826c0,4.61,3.738,8.348,8.348,8.348s8.348-3.738,8.348-8.348v-22.261H436.87V411.826z M403.478,411.826 c0,4.61,3.738,8.348,8.348,8.348c4.61,0,8.348-3.738,8.348-8.348v-22.261h-16.696V411.826z"></path> </g></svg>
      `
    })
    console.log(groupList, memberInfo.timer);
  })
});

socket.on('stopstudying', (userId, groups) => {
  console.log(userId, groups);
  groups.forEach((group) => {
    const groupInfo = groupList.find(groupObj => groupObj.group_id == group);
    const memberInfo = groupInfo.members.find(member => member.userId === userId);
    memberInfo.timer.run = false;
    clearInterval(memberInfo.timer.timer)
    const memberSliders = document.querySelectorAll(`.swiper-slide#${group} ul li#${userId}`);
    memberSliders.forEach((slider) => {
    slider.querySelector('.svg-area').innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" id="Capa_1" viewBox="0 0 460 460" xml:space="preserve" width="78px" height="78px" fill="#000000"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <g id="XMLID_1326_"> <path id="XMLID_1324_" style="fill:#CBB57A;" d="M285,295h50l-90,120h-10L285,295z"></path> <path id="XMLID_1325_" style="fill:#9E8E60;" d="M385,415h-10l-90-120h50L385,415z"></path> <path id="XMLID_1298_" style="fill:#4D4337;" d="M410,285L410,285c0,11.046-8.954,20-20,20H230c-11.046,0-20-8.954-20-20v0 c0-11.046,8.954-20,20-20h0.87l13.933-160.226C247.743,70.956,276.054,45,310,45h0c33.946,0,62.257,25.956,65.198,59.774 L389.13,265H390C401.046,265,410,273.954,410,285z"></path> <path id="XMLID_1295_" style="fill:#635547;" d="M370,270c0,2.761-2.239,5-5,5H255c-2.761,0-5-2.239-5-5s2.239-5,5-5h10 l8.326-95.752c1.654-19.023,17.579-33.623,36.674-33.623h0c19.095,0,35.02,14.6,36.674,33.623L355,265h10 C367.761,265,370,267.239,370,270z"></path> <path id="XMLID_1136_" style="fill:#9E8E60;" d="M120,415H0V225h120V415z M460,225h-20v190h20V225z"></path> <path id="XMLID_338_" style="fill:#766A54;" d="M100,315H20v-60h80V315z M100,335H20v60h80V335z"></path> <path id="XMLID_337_" style="fill:#D6CFBA;" d="M100,255v60H20v-60h20v10c0,5.523,4.477,10,10,10h20c5.523,0,10-4.477,10-10v-10 H100z M80,335v10c0,5.523-4.477,10-10,10H50c-5.523,0-10-4.477-10-10v-10H20v60h80v-60H80z"></path> <path id="XMLID_307_" style="fill:#833428;" d="M60,137v66c0,1.105-0.895,2-2,2H42c-1.105,0-2-0.895-2-2v-66c0-1.105,0.895-2,2-2 h16C59.105,135,60,135.895,60,137z"></path> <path id="XMLID_334_" style="fill:#374145;" d="M79.308,135.522l18.132,63.461c0.303,1.062-0.312,2.169-1.374,2.472l-15.384,4.396 c-1.062,0.303-2.169-0.312-2.472-1.374l-18.132-63.461c-0.303-1.062,0.312-2.169,1.374-2.472l15.384-4.396 C77.898,133.845,79.004,134.46,79.308,135.522z"></path> <path id="XMLID_308_" style="fill:#64757C;" d="M89.747,172.06l-19.23,5.494l-8.242-28.846l19.23-5.494L89.747,172.06z"></path> <path id="XMLID_245_" style="fill:#AC8428;" d="M60,155H40v-10h20V155z"></path> <path id="XMLID_1276_" style="fill:#374145;" d="M128.243,207.095c-1.617,0.359-3.22-0.661-3.579-2.278l-15.185-68.333 c-0.359-1.617,0.66-3.22,2.278-3.579c1.617-0.359,3.22,0.661,3.579,2.278l15.185,68.333 C130.881,205.133,129.861,206.736,128.243,207.095z"></path> <path id="XMLID_1297_" style="fill:#DDA333;" d="M141.114,128.651l-15.185,68.333c-0.359,1.617-1.962,2.637-3.579,2.278 c-1.617-0.359-2.637-1.962-2.278-3.579l15.185-68.333c0.359-1.617,1.962-2.637,3.579-2.278S141.474,127.034,141.114,128.651z"></path> <path id="XMLID_1817_" style="fill:#E0CFA6;" d="M130,187v36c0,1.105-0.895,2-2,2H32c-1.105,0-2-0.895-2-2v-36c0-1.105,0.895-2,2-2 h96C129.105,185,130,185.895,130,187z"></path> <path id="XMLID_1816_" style="fill:#D66A40;" d="M140,167v56c0,1.105-0.895,2-2,2h-26c-1.105,0-2-0.895-2-2v-56 c0-1.105,0.895-2,2-2h26C139.105,165,140,165.895,140,167z"></path> <path id="XMLID_1808_" style="fill:#CBB175;" d="M250,210v10h-40h-40v-10c0-5.523,4.477-10,10-10h20c5.523,0,10,4.477,10,10 c0-5.523,4.477-10,10-10h20C245.523,200,250,204.477,250,210z"></path> <path id="XMLID_1813_" style="fill:#E9CC85;" d="M250,210v10h-40v-10c0-5.523,4.477-10,10-10h20C245.523,200,250,204.477,250,210z"></path> <path id="XMLID_1807_" style="fill:#833428;" d="M254.833,211v6c0,1.105-0.895,2-2,2h-85.667c-1.105,0-2-0.895-2-2v-6 c0-1.105,0.895-2,2-2h85.667C253.938,209,254.833,209.895,254.833,211z"></path> <path id="XMLID_1805_" style="fill:#3F0900;" d="M216,215v2c0,1.105-0.895,2-2,2h-8c-1.105,0-2-0.895-2-2v-2c0-3.314,2.686-6,6-6 l0,0C213.314,209,216,211.686,216,215z"></path> <path id="XMLID_1747_" style="fill:#CBB57A;" d="M460,235H0v-20h460V235z"></path> </g> </g></svg>
    `
    })
  })
});

socket.on('sendTime', (userId) => {
  console.log('send time to', userId, timers);
  let subject = ''
  timers.forEach((timer) => {
    if(timer.run){
      subject = timer.name;
    }
  });
  //socket.emit('timeResponse', )
});

socket.on('addUser', (group, userId) => {
  const roomWrapper = document.querySelectorAll(`.swiper-slide#${userId} .members ul`);
  const groupInfo = groupList.find(groupObj => groupObj.group_id == group);
  const memberInfo = groupInfo.members.find(member => member.userId === userId);
  console.log(roomWrapper, memberInfo, groupInfo, userId)
  roomWrapper.forEach(roomEl => {
    createMemberTimer(roomEl, memberInfo)
  })
})

socket.on('removeUser', (room, userId) => {
  const roomWrapper = document.querySelectorAll(`.swiper-slide#${userId} .members ul`);
  roomWrapper.forEach(roomEl => {
    roomEl.appendChild()
  })
})


const swiperWrapper = document.querySelector('.swiper-wrapper');
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
  console.log(response)
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

let menuBtn = document.getElementById('menu');
const subjects = document.querySelector(".timer");
menu.addEventListener('click', () => {
  menuBtn.classList.toggle('open');
  subjects.classList.toggle('timer-hide');
});

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
  const swiper = new Swiper('.swiper-container', {
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
      el: '.swiper-pagination',
    },
  
    // Navigation arrows
    navigation: {
      nextEl: '.swiper-button-next',
      prevEl: '.swiper-button-prev',
    }
  
  });
}