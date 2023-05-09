function createSubjects(subject_number, subject, subjectColor){
  const div = document.createElement("div");
  div.setAttribute("class", "SW d-1 item");
  div.setAttribute("id", "SW"+subject_number);
  div.setAttribute("draggable", "true");
  div.innerHTML=`<div id="disp">
  <div class="item-content">
  <span class="order">1</span>
</div>
  <div id="digits">
    <span id="hr${subject_number}">00:</span>
    <span id="min${subject_number}">00:</span>
    <span id="sec${subject_number}">00</span>
  </div>
  <div class = "subject">
    <span>${subject}</span>
  </div>
</div>
<div id="buttons">
  <div id="playBtn${subject_number}" class="button" style = "background: ${subjectColor}">
    <span class="material-symbols-outlined">play_arrow</span>
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
  console.log('drag')
  console.log(e)
  // hide gohst element
  e.target.classList.remove('d-1');
  e.dataTransfer.setDragImage(this.cloneNode(true), 0, 0);
  
  currPosY = e.clientY-e.target.offsetTop - 20;
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
  e.target.style=null;
  e.target.classList.add('d-1');
};

function dragged(e) {
  e.preventDefault();
  var dropArea = e.target.parentNode;
  
  if (e.target.offsetTop < dropArea.offsetTop ) {
    e.target.style.top = dropArea.offsetTop + 'px';
  } else if (e.target.offsetTop + e.target.offsetHeight > dropArea.offsetTop + dropArea.offsetHeight) {
    e.target.style.top=dropArea.offsetTop+dropArea.offsetHeight-e.target.offsetHeight + 'px';
  }
  
  elNextY = (e.target.nextElementSibling != null)? 
    e.target.nextElementSibling.offsetTop + e.target.nextElementSibling.offsetHeight / 2 : 0;
  elPrevY = (e.target.previousElementSibling != null)? 
    e.target.previousElementSibling.offsetTop : e.target.parentElement.offsetHeight;

  // reorder elements based on dragged item position
  if (e.clientY - currPosY + e.target.offsetHeight / 2 > elNextY && e.clientY - currPosY < elNextY + e.target.offsetHeight) 
  {
    if (e.target.nextElementSibling){
      e.target.parentElement.insertBefore(e.target.nextElementSibling, e.target);
      origPosY = e.target.offsetTop - e.target.offsetHeight;
    }
  } 
  else if (e.clientY - currPosY < elPrevY + e.target.offsetHeight / 2 && e.clientY - currPosY > elPrevY) 
  {
    if (e.target.previousElementSibling) {
      origPosY = e.target.previousElementSibling.offsetTop;
      e.target.parentElement.insertBefore(e.target, e.target.previousElementSibling);
    }
  }

  e.target.style.top = e.clientY-origPosY-currPosY+'px';
}

var timers = [];

(async() => {
  const response = await fetch('/study/bring-subjects', {
    method: 'post',
    headers: {
      'Content-Type': 'application/json'
    }
  })
  
  const subjects = await response.json();
  console.log(subjects);

  for(let i = 0; i < subjects.length; i++){
    createSubjects(i, subjects[i].name, subjects[i].color);
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
      playBtn: null
    });
  
    // Initialize the timer object
    timers[i].secDisp = document.getElementById('sec' + i);
    timers[i].minDisp = document.getElementById('min' + i);
    timers[i].hrDisp = document.getElementById('hr' + i);
    timers[i].playBtn = document.getElementById('playBtn' + i);
  
    // Add a click event listener to the play button
    timers[i].playBtn.addEventListener('click', (function(index) {
      return function() {
        toggleTimer(index);
      }
    })(i));
  }

  var dropArea = document.getElementsByClassName(".timer .container");
  var currPosY = -1,
      origPosY = -1;
  
  var draggable = document.getElementsByClassName("item");
  
  [].forEach.call(draggable, function(el, i){
    el.addEventListener("dragstart", drag);
    el.addEventListener("drag", dragged);
    el.addEventListener("dragover", dragover);
    el.addEventListener("drop", drop);
    el.addEventListener("dragend", dragend);
  
    el.id = 'drag-item-' + i;
  });
})();


function toggleTimer(index) {
  var timer = timers[index];
  console.log(timer, index)
  if (timer.run) {
    clearInterval(timer.timer);
    timer.playBtn.innerHTML = `<span class="material-symbols-outlined">play_arrow</span>`;
    timer.run = false;
  } else {
    timer.timer = setInterval(function() { count(index); }, 10);
    timer.playBtn.innerHTML = `<span class="material-symbols-outlined">pause</span>`;
    timer.run = true;
  }
}

function resetTimer(index) {
  var timer = timers[index];

  clearInterval(timer.timer);
  timer.playBtn.innerHTML = `<span class="material-symbols-outlined">play_arrow</span>`;
  timer.secDisp.innerHTML = "00";
  timer.minDisp.innerHTML = "00:";
  timer.hrDisp.innerHTML = "00:";
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

const main = document.querySelector('.main');
const addSubjectBtn = document.querySelector(".add-subject");
const addSubjectModal = document.querySelector(".modal#subject-adder");

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
addSubjectBtn.addEventListener('click', () => {
  addSubjectModal.style.display = "block";
  const color = document.querySelector("input.subject-color");
  recommendedColorsIndex = document.querySelectorAll(".SW").length;
  color.value =recommendedColors[recommendedColorsIndex];
  console.log(color.value);
  main.classList.add('blur');
});

addSubjectModal.querySelector('.close-btn').addEventListener('click', () => {
  addSubjectModal.style.display = "none";
  main.classList.remove('blur');
});


const addSubjectSubmitBtn = document.querySelector(".blob-btn");

addSubjectSubmitBtn.addEventListener('click', () => {
  const name = document.querySelector("input.subject-name");
  const color = document.querySelector("input.subject-color");
  console.log(name, color);
  (async() => {
    const response = await fetch('/study/add-subject', {
      method: 'post',
      body: JSON.stringify({ name: name.value, color:color.value }),
      headers: {
        'Content-Type': 'application/json'
      }
    })
    // handle the response as needed
  })();

  const subjects = document.querySelectorAll(".SW");
  console.log(subjects.length);
  createSubjects(subjects.length, name.value, color.value);
  name.value = "";
  recommendedColorsIndex += 1;
  color.value = recommendedColors[recommendedColorsIndex];

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
    playBtn: null
  });

  // Initialize the timer object
  timers[subjects.length].secDisp = document.getElementById('sec' + subjects.length);
  timers[subjects.length].minDisp = document.getElementById('min' + subjects.length);
  timers[subjects.length].hrDisp = document.getElementById('hr' + subjects.length);
  timers[subjects.length].playBtn = document.getElementById('playBtn' + subjects.length);

  // Add a click event listener to the play button
  timers[subjects.length].playBtn.addEventListener('click', (function(index) {
    return function() {
      toggleTimer(index);
    }
  })(subjects.length));
})