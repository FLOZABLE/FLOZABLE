function createSubjects(subject_number, subject, subjectColor){
  const div = document.createElement("div");
  div.setAttribute("class", "SW d-1");
  div.setAttribute("id", "SW"+subject_number);
  div.setAttribute("draggable", "true");
  div.innerHTML=`<div id="disp">
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
</div>`
const timerContainer = document.querySelector(".timer .container");
timerContainer.appendChild(div);
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
})


var rowSize = 100; // => container height / number of items
var container = document.querySelector(".timer .container");
var listItems = Array.from(document.querySelectorAll(".SW")); // Array of elements
var sortables = listItems.map(Sortable); // Array of sortables
var total = sortables.length;

container.style.opacity = 1;

function changeIndex(item, to) {
  // Change position in array
  arrayMove(sortables, item.index, to);

  // Change element's position in DOM. Not always necessary. Just showing how.
  if (to === total - 1) {
    container.appendChild(item.element);
  } else {
    var i = item.index > to ? to : to + 1;
    container.insertBefore(item.element, container.children[i]);
  }

  // Set index for each sortable
  sortables.forEach((sortable, index) => sortable.setIndex(index));
}

function Sortable(element, index) {
  var content = element.querySelector(".item-content");
  var order = element.querySelector(".order");

  var animation = {
    play: function() {
      content.style.boxShadow = "rgba(0,0,0,0.2) 0px 16px 32px 0px";
      content.style.transform = "scale(1.1)";
    },
    reverse: function() {
      content.style.boxShadow = "";
      content.style.transform = "";
    }
  };

  var dragger = new Draggable(element, {
    onDragStart: downAction,
    onRelease: upAction,
    onDrag: dragAction,
    cursor: "inherit",
    type: "y"
  });

  // Public properties and methods
  var sortable = {
    dragger: dragger,
    element: element,
    index: index,
    setIndex: setIndex
  };

  element.style.transform = "translateY(" + index * rowSize + "px)";

  function setIndex(index) {
    sortable.index = index;
    order.textContent = index + 1;

    // Don't layout if you're dragging
    if (!dragger.isDragging) layout();
  }

  function downAction() {
    animation.play();
    this.update();
  }

  function dragAction() {
    // Calculate the current index based on element's position
    var index = clamp(Math.round(this.y / rowSize), 0, total - 1);

    if (index !== sortable.index) {
      changeIndex(sortable, index);
    }
  }

  function upAction() {
    animation.reverse();
    layout();
  }

  function layout() {
    element.style.transform = "translateY(" + sortable.index * rowSize + "px)";
  }

  return sortable;
}

// Changes an elements's position in array
function arrayMove(array, from, to) {
  array.splice(to, 0, array.splice(from, 1)[0]);
}

// Clamps a value to a min/max
function clamp(value, a, b) {
  return value < a ? a : value > b ? b : value;
}