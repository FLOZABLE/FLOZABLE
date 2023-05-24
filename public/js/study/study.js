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
    <span class="material-symbols-outlined"><svg width="64px" height="64px" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" fill="#000000"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M3 2v12s6.333-2.833 10.666-6C9.333 4.833 3 2 3 2z" fill="gray" overflow="visible" style="marker:none" color="#000000"></path> </g></svg></span>
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

const socket = io(window.location.protocol + '//' + window.location.hostname);
// Listen for messages in the group


const swiperContainer = document.querySelector('.swiper-container');
let userId;
var socketRooms = [];
(async() => {
  let response = await fetch('/groups/bring-groups', {
    method: 'post',
    headers: {
      'Content-Type': 'application/json'
    }
  });
  response = await response.json();
  const groupList = response[0];
  userId = response[1];
  const groupWithUser = response[2];

  groupList.forEach((group) => {
    if(groupWithUser.includes(group.group_id)){
      socketRooms.push(group.group_id);
      let members = '';
      group.members = JSON.parse(`[${group.members}]`) || [];
      console.log(group.members)
      group.members.forEach(member => {members += `
      <li id = ${member[0]}>
        <div class="member">
          <div class="member-name">${member[1]}</div>
          <div class="member-time">
            <p>00:00:00</p>
          </div>
        </div>
      </li>
      
      `})
      const swiperSlide = document.createElement('div');
      swiperSlide.setAttribute('class', 'swiper-wrapper');
      swiperSlide.innerHTML = `
      <div class="group-inner">
      <div class="group-name">${group.name}</div>
      <div class="members">
        <ul>
         ${members}
        </ul>
      </div>
    </div>
      `
      swiperContainer.appendChild(swiperSlide);
      socket.emit('joinRoom', group.group_id, userId);
    }
  });
    initializeSlider();
  socket.on('studying', (userId, groups) => {
    console.log(userId, groups);
    groups.forEach((group) => {
      //document.querySelector
    })
  });

  socket,on('stopstudy', (userId, groups) => {
    console.log(userId, groups);
    groups.forEach((group) => {
      console.log(group);
      
    })
  })
})();

function toggleTimer(index) {
  var timer = timers[index];
  if (timer.run) {
    clearInterval(timer.timer);
    timer.playBtn.innerHTML = `<span class="material-symbols-outlined"><svg width="64px" height="64px" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" fill="#000000"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M3 2v12s6.333-2.833 10.666-6C9.333 4.833 3 2 3 2z" fill="gray" overflow="visible" style="marker:none" color="#000000"></path> </g></svg></span>`;
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
    timer.timer = setInterval(function () { count(index); }, 10);
    timer.playBtn.innerHTML = `<span class="material-symbols-outlined"><svg fill="#000000" width="64px" height="64px" viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M46.677 64.652c0-9.362 7.132-17.387 16.447-17.394 9.315-.007 24.677.007 34.55.007 9.875 0 17.138 7.594 17.138 16.998 0 9.403-.083 119.094-.083 127.82 0 8.726-7.58 16.895-16.554 16.837-8.975-.058-25.349.115-34.963.058-9.614-.058-16.646-7.74-16.646-17.254 0-9.515.11-117.71.11-127.072zm14.759.818s-.09 118.144-.09 123.691c0 5.547 3.124 5.315 6.481 5.832 3.358.518 21.454.47 24.402.47 2.947 0 7.085-1.658 7.167-6.14.08-4.483-.082-119.507-.082-123.249 0-3.742-4.299-4.264-7.085-4.66-2.787-.395-25.796 0-25.796 0l-4.997 4.056zm76.664-.793c.027-9.804 7.518-17.541 17.125-17.689 9.606-.147 25.283.148 35.004.148 9.72 0 17.397 8.52 17.397 17.77s-.178 117.809-.178 127c0 9.192-7.664 17.12-16.323 17.072-8.66-.05-26.354 0-34.991.048-8.638.05-17.98-8.582-18.007-17.783-.027-9.201-.055-116.763-.027-126.566zm16.917.554s-.089 118.145-.089 123.692c0 5.547 3.123 5.314 6.48 5.832 3.359.518 21.455.47 24.402.47 2.948 0 7.086-1.659 7.167-6.141.081-4.482-.08-119.506-.08-123.248 0-3.742-4.3-4.265-7.087-4.66-2.786-.396-25.796 0-25.796 0l-4.997 4.055z" fill-rule="evenodd"></path> </g></svg></span>`;
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
  timer.playBtn.innerHTML = `<span class="material-symbols-outlined"><svg width="64px" height="64px" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" fill="#000000"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M3 2v12s6.333-2.833 10.666-6C9.333 4.833 3 2 3 2z" fill="gray" overflow="visible" style="marker:none" color="#000000"></path> </g></svg></span>`;
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
  var timer = timers[index];

  timer.hundredth += 1;

  if (timer.hundredth == 100) {
    timer.hundredth = 0;
    timer.seconds += 1;
  }

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

function disp(hun, sec, min, hr, index) {
  var timer = timers[index];

  timer.secDisp.innerHTML = sec.toLocaleString(undefined, { minimumIntegerDigits: 2 });
  timer.minDisp.innerHTML = min.toLocaleString(undefined, { minimumIntegerDigits: 2 }) + ':';
  timer.hrDisp.innerHTML = hr.toLocaleString(undefined, { minimumIntegerDigits: 2 }) + ':';
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
  new Swiper('.swiper-container', {
    navigation: {
      nextEl: '.swiper-button-next',
      prevEl: '.swiper-button-prev',
    },
    // Configuration options
    slidesPerView: 1,
    pagination: {
      el: '.swiper-pagination',
      clickable: true
    }
  });
}