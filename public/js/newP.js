
(async () => {
  //bring plans
  let bringPlans = await fetch('/study/bring-plans', {
    method: 'post',
    headers: {
      'Content-Type': 'application/json'
    }
  });

  bringPlans = await bringPlans.json();
  const storedPlansArray = JSON.parse(bringPlans);
  createCurrentTimeBar(planDragZone);
  if(storedPlansArray[0] == null){
    return 0
  }
  storedPlansArray.forEach((storedPlan) => {
    const startTime = storedPlan.startTime.split('.');
    const endTime = storedPlan.endTime.split('.');
    const startHr = parseInt(startTime[0]);
    const startMin = parseInt(startTime[1]);
    const endHr = endTime[0];
    const endMin = endTime[1];
    let hrDiff = endHr - startHr;
    let minDiff = endMin - startMin;
    const planId = storedPlan.planId;
    const div = document.createElement('div');
    const subject = subjects.find(subject => subject.name == storedPlan.subject) ? subjects.find(subject => subject.name == storedPlan.subject) : {name: 'default',color: '#07f'};
    div.classList.add('plan');
    div.classList.add(`subject-${subject.name}`);
    div.id = planId;
    div.classList.add(`planId${planId}`);
  
    div.innerHTML = `
    <div class="plan-display-zone">
    <div class="plan-name">
      <span>${storedPlan.name}</span>  
    </div>
    <div class = "plan-time-info">
      <span>${startHr}:${startMin.toString().padStart(2, 0)} - ${endHr}:${endMin.toString().padStart(2, 0)}</span>
    </div>
    </div>
    `;
  
    div.addEventListener('mousedown', mouseDown.bind(null, div), false);
    div.addEventListener('mouseup', mouseUp.bind(null, div), false);
  
    planDragZone.appendChild(div);
    generatedPlan = div;
    const planInfo =  {
      planId: planId,
      name: storedPlan.name,
      el: div,
      date: storedPlan.date,
      startTimeDis: div.querySelector('.plan-time-info span'),
      planDragZone: planDragZone,
      startHr: startHr,
      startMin: startMin,
      endHr: endHr,
      endMin: endMin,
      description: storedPlan.description,
      subject: storedPlan.subject,
      repeat: storedPlan.repeat,
      notification: storedPlan.notification,
      prevStartTime: [startHr, startMin],
      prevEndTime: [endHr, endMin],
    };
    div.querySelector('.plan-display-zone').style.backgroundColor = subject.color;
  
    plans.push(
      planInfo
    );
    if (minDiff < 0) {
      minDiff += 60;
      hrDiff -= 1;
    }
  
    if (minDiff === 60) {
      minDiff = 0;
    }
    div.style.top = startHr * 60 + startMin + 30 +'px';
    div.querySelector('.plan-display-zone').style.height = (hrDiff + Math.round(minDiff / 60 * 100)/ 100) * 60 + 'px';
    selectedPlan = planInfo;
    createStartTimeOptions();
    //updatePlannerTime(topPosition, div);
  });

  //updatePlanner(date)
})();




const swiperWrapper = document.querySelector('.groups .swiper-wrapper');
let dailyPlanCalendar;
let weeklyPlanCalendar;
let monthlyPlanCalendar;
let userId;
var groupList;

planDragZones = document.querySelectorAll(".plan-drag-zone");
planDragZones.forEach((planDragZone) => {
  planDragZone.addEventListener('click', (event) => {
    if(event.target == planDragZone || event.target.classList.contains('block') || event.target.classList.contains('line')){
      addPlanModal.classList.remove('modal-closed');
      createPlan(event.clientX, event.clientY, planDragZone);
    }
  });
})


//calendar zone


let plannerSliderDir = 1;
let planDragZone = document.querySelector('#daily-planner .plan-drag-zone');
const today = new Date();
let date = new Date();

const dailyCalendarContainer = document.querySelector('.calendar-container #daily-planner');
const weeklyCalendarContainer = document.querySelector('.calendar-container #weekly-planner');
const monthlyCalendarContainer = document.querySelector('.calendar-container #monthly-planner');
const planViewOption = document.querySelector('#view-options');
let plannerHeader = document.querySelector('.daily-planner-header');

planViewOption.addEventListener('change', () => {
  console.log(planViewOption.value);
  if(planViewOption.value == 'day'){
    dailyCalendarContainer.style.display = 'block';
    weeklyCalendarContainer.style.display = 'none';
    monthlyCalendarContainer.style.display = 'none';
    plannerHeader = document.querySelector('.daily-planner-header');
    planDragZone = document.querySelectorAll('#daily-planner .planner-drag-zone')[plannerSliderDir];
  } else if(planViewOption.value == 'week'){
    dailyCalendarContainer.style.display = 'none';
    weeklyCalendarContainer.style.display = 'block';
    monthlyCalendarContainer.style.display = 'none';
    sidebarCalendar.updateWeek(plannerSliderDir)
    plannerHeader = document.querySelectorAll('.weekly-planner-header')[plannerSliderDir];
    planDragZone = document.querySelectorAll('#weekly-planner .planner-drag-zone')[plannerSliderDir];
  } else if(planViewOption.value == 'month'){
    dailyCalendarContainer.style.display = 'none';
    weeklyCalendarContainer.style.display = 'none';
    monthlyCalendarContainer.style.display = 'block';
    plannerHeader = document.querySelector('.monthly-planner-header');
    planDragZone = document.querySelectorAll('#monthly-planner .planner-drag-zone')[monthlyCalendarSlideDir];
  }
  updatePlanner(sidebarCalendar.date);
})

const prevPlanBtn = document.querySelector('.btn.prevday');
const nextPlanBtn = document.querySelector('.btn.nextday');

prevPlanBtn.addEventListener('click', () => {
  if(planViewOption.value == 'day') {
    sidebarCalendar.prevDay();
  } else if(planViewOption.value == 'week') {
    sidebarCalendar.prevWeek();
  }
})

nextPlanBtn.addEventListener('click', () => {
  if(planViewOption.value == 'day') {
    sidebarCalendar.nextDay();
  } else if(planViewOption.value == 'week') {
    sidebarCalendar.nextWeek();
  }
})


//calendar for sidebar

class Calendar {
  constructor(calendarContainer, calendarName) {
    this.calendarName = calendarName;
    this.calendarContainer = calendarContainer;
    this.months = [
      'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'
    ];
    this.weekdays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    this.date = new Date();
    this.generateCalendar();
  }

  getCurrentDate(element, asString) {
    const date = this.date;
    if (element) {
      if (asString) {
        element.textContent = this.months[date.getMonth()] + ' ' + date.getDate();
      } else {
        element.value = date.toISOString().substr(0, 10);
      }
    }
    return date;
  }

  generateCalendar() {
    const calendar = document.getElementById(this.calendarName);
    console.log(calendar)
    if (calendar) {
      calendar.remove();
    }

    const table = document.createElement('table');
    table.id = this.calendarName;
    table.class = 'calendar'

    const trHeader = document.createElement('tr');
    trHeader.className = 'weekends';

    this.weekdays.map(week => {
      const th = document.createElement('th');
      const w = document.createTextNode(week.substring(0, 3));
      th.appendChild(w);
      trHeader.appendChild(th);
    });

    table.appendChild(trHeader);

    const weekDay = new Date(
      this.date.getFullYear(),
      this.date.getMonth(),
      1
    ).getDay();

    const lastDay = new Date(
      this.date.getFullYear(),
      this.date.getMonth() + 1,
      0
    ).getDate();

    let tr = document.createElement('tr');
    let td = '';
    let empty = '';
    let btn = document.createElement('button');
    let week = 0;

    while (week < weekDay) {
      td = document.createElement('td');
      empty = document.createTextNode(' ');
      td.appendChild(empty);
      tr.appendChild(td);
      week++;
    }

    for (let i = 1; i <= lastDay;) {
      while (week < 7) {
        td = document.createElement('td');
        let text = document.createTextNode(i);
        let btn = document.createElement('button');
        btn.className = 'btn-day';
        btn.addEventListener('click', () => this.changeDate(btn));
        week++;

        if (i <= lastDay) {
          i++;
          btn.appendChild(text);
          td.appendChild(btn);
        } else {
          text = document.createTextNode(' ');
          td.appendChild(text);
        }
        tr.appendChild(td);
      }
      table.appendChild(tr);

      tr = document.createElement('tr');

      week = 0;
    }

    const content = document.getElementById(this.calendarContainer);
    content.appendChild(table);
    this.changeActive();
    this.changeHeader(this.date);
    this.getCurrentDate(document.getElementById('currentDate'), true);
    this.getCurrentDate(document.getElementById('date'), false);
  }

  setDate(form) {
    let newDate = new Date(form.date.value);
    this.date = new Date(newDate.getFullYear(), newDate.getMonth(), newDate.getDate() + 1);
    this.generateCalendar();
    return false;
  }

  changeHeader(dateHeader) {
    const month = document.getElementById('month-header');
    if (month.childNodes[0]) {
      month.removeChild(month.childNodes[0]);
    }
    const headerMonth = document.createElement('h1');
    const textMonth = document.createTextNode(this.months[dateHeader.getMonth()].substring(0, 3) + ' ' + dateHeader.getFullYear());
    headerMonth.appendChild(textMonth);
    month.appendChild(headerMonth);
  }

  changeActive() {
    let btnList = document.querySelectorAll('button.active');
    btnList.forEach(btn => {
      btn.classList.remove('active');
    });
    btnList = document.getElementsByClassName('btn-day');
    for (let i = 0; i < btnList.length; i++) {
      const btn = btnList[i];
      if (btn.textContent === this.date.getDate().toString()) {
        btn.classList.add('active');
      }
    }
  }

  resetDate() {
    this.date = new Date();
    this.generateCalendar();
    updatePlanner(this.date);
    const planDragZone = document.querySelectorAll('.planner .swiper-slide .plan-drag-zone')[1];
    createCurrentTimeBar(planDragZone);
  }

  changeDate(button) {
    let newDay = parseInt(button.textContent);
    this.date = new Date(this.date.getFullYear(), this.date.getMonth(), newDay);
    this.generateCalendar();
    updatePlanner(this.date);
  }

  nextMonth() {
    this.date = new Date(this.date.getFullYear(), this.date.getMonth() + 1, 1);
    this.generateCalendar();
  }

  prevMonth() {
    this.date = new Date(this.date.getFullYear(), this.date.getMonth() - 1, 1);
    this.generateCalendar();
  }

  prevDay() {
    this.date = new Date(this.date.getFullYear(), this.date.getMonth(), this.date.getDate() - 1);
    this.generateCalendar();
    plannerSliderDir = 0;
    updatePlanner(this.date);
    const planDragZone = document.querySelectorAll('.planner .swiper-slide .plan-drag-zone')[0];
    createCurrentTimeBar(planDragZone);
  }

  nextDay() {
    this.date = new Date(this.date.getFullYear(), this.date.getMonth(), this.date.getDate() + 1);
    this.generateCalendar();
    plannerSliderDir = 2;
    updatePlanner(this.date);
    const planDragZone = document.querySelectorAll('.planner .swiper-slide .plan-drag-zone')[2];
    createCurrentTimeBar(planDragZone);
  }

  prevWeek() {
    this.date = new Date(this.date.getFullYear(), this.date.getMonth(), this.date.getDate() - 7);
    this.generateCalendar();
    plannerSliderDir = 0;
    updatePlanner(this.date);
    const planDragZone = document.querySelectorAll('.planner .swiper-slide .plan-drag-zone')[0];
    createCurrentTimeBar(planDragZone);
    this.updateWeek(0);
  }

  nextWeek() {
    this.date = new Date(this.date.getFullYear(), this.date.getMonth(), this.date.getDate() + 7);
    this.generateCalendar();
    plannerSliderDir = 2;
    updatePlanner(this.date);
    const planDragZone = document.querySelectorAll('.planner .swiper-slide .plan-drag-zone')[2];
    createCurrentTimeBar(planDragZone);
    this.updateWeek(2);
  }

  updateWeek(index) {
    const today = new Date(this.date);
    const currentDay = today.getDay(); // 0 (Sunday) to 6 (Saturday)
    const startOfWeek = new Date(today.getFullYear(), today.getMonth(), today.getDate() - currentDay);
    const week = [];

    const weeklyPlannerHeader = document.querySelectorAll('.weekly-planner-header')[index];
    let headerDates = weeklyPlannerHeader.querySelectorAll('th .table-h');
    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek.getFullYear(), startOfWeek.getMonth(), startOfWeek.getDate() + i);
      week.push(date);
      headerDates[i].innerHTML = `
        <p class="day">${date.toLocaleString('en-US', { weekday: 'short' })}</p>
        <p class="date">${date.getDate()}</p>
      `;
    }

    return week;
  }
}


const sidebarCalendar = new Calendar('table', 'sidebarCalendar')

document.onload = sidebarCalendar.generateCalendar(date);

const addPlanModal = document.querySelector('#add-plan-modal');
const addPlanModalCloseBtn = addPlanModal.querySelector('.fa-circle-xmark');

let isPlannerDefault = true;
addPlanModalCloseBtn.addEventListener('click', () => {
  addPlanModal.classList.add('closed-modal');
  if(!planSaved){
    console.log('not planSaved');
    plans = plans.filter(planObj => {
      return planObj.planId != selectedPlan.planId;
    })
    selectedPlan.el.remove();
    selectedPlan = null;
    planSaved = true;
  }
})


//update calendar plan as user change values

let selectedPlan = {};

class inputCalendar {
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

      const date1 = new Date(newYear, newMonth, newDay);

      const options = {
        weekday: 'long',
        month: 'long',
        day: 'numeric'
      };

      const formattedDate = date1.toLocaleDateString('en-US', options);

      this.input.value = formattedDate;
      selectedPlan.date = [new Date(date1).toISOString().substr(0, 10), date1.setHours(0, 0, 0, 0) / 1000];
      //date = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      if(!isPlannerDefault){
        const newDate = new Date(selectedPlan.date[1]);
        sidebarCalendar.date = new Date(newDate.getFullYear(), newDate.getMonth(), newDate.getDate() + 1);
      }
      isPlannerDefault = false
      sidebarCalendar.generateCalendar();
      updatePlanner(sidebarCalendar.date)
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


//time selection
const planDate = document.querySelector('input.date-input');
const planStartTime = document.querySelector('#startTimeSetting .options');
const planEndTime = document.querySelector('#stopTimeSetting .options');


function createStartTimeOptions() {
  planStartTime.innerHTML = '';
  const plan = plans.find((plan) => plan.planId == selectedPlan.planId);
  const currentDateTime = new Date();
  const currentHour = currentDateTime.getHours();
  const currentMinute = currentDateTime.getMinutes();
  plan.startHr == null ? currentHour : plan.startHr; 
  plan.startMin == null ? Math.round(currentMinute / 15) * 15 : plan.startMin;
  if (plan.startMin === 60) {
    plan.startMin = 0;
    plan.startHr += 1;
  }
  for (let hour = 0; hour <= 23; hour++) {
    for (let minute = 0; minute <= 45; minute += 15) {
      const timeValue = `${hour}.${minute}`;
      const timeText = formatTime(hour, minute);
  
      const option = createOption(timeValue, timeText);
      planStartTime.appendChild(option);
  
      if (hour === plan.startHr && minute === plan.startMin) {
        option.selected = true;
        //plan.prevStartTime = [plan.startHr, plan.startMin];
      }
    }
  }
}

function formatTime(hour, minute) {
  const period = hour < 12 ? 'AM' : 'PM';
  const hour12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
  const minuteText = minute === 0 ? '00' : minute;
  return `${hour12}:${minuteText} ${period}`;
}


planStartTime.addEventListener('change', (event) => {
  const plan = plans.find((plan) => plan.planId == selectedPlan.planId);
  let prevStartTime = plan.prevStartTime;
  const updatedStartTime = planStartTime.value.split('.');
  const prevEndTime = plan.prevEndTime;
  const duration = `${prevEndTime[0] - prevStartTime[0]}.${prevEndTime[1] - prevStartTime[1]}`;
  let hrDiff = prevEndTime[0] - prevStartTime[0];
  let minDiff = prevEndTime[1] - prevStartTime[1];
  plan.prevStartTime = updatedStartTime;

  if (minDiff < 0) {
    minDiff += 60;
    hrDiff -= 1;
  }

  if (minDiff === 60) {
    minDiff = 0;
  }

  let updatedHr = parseInt(updatedStartTime[0]) + hrDiff;
  let updatedMin = parseInt(updatedStartTime[1]) + minDiff;

  if (updatedMin >= 60) {
    updatedMin -= 60;
    updatedHr += 1;
  }

  const updatedEndTime = [updatedHr, updatedMin];

  //startHr = updatedHr;
  //startMin = updatedMin;
  
  plan.el.style.top = parseInt(updatedStartTime[0]) * 60  + parseInt(updatedStartTime[1]) + 'px';
  plan.startTimeDis.innerText = `${parseInt(updatedStartTime[0]) == 0 ? 12 : updatedStartTime[0]}:${updatedStartTime[1].padStart(2, 0)} - ${updatedHr}:${updatedMin.toString().padStart(2, 0)}`;
  plan.startHr = parseInt(updatedStartTime[0]);
  plan.startMin = parseInt(updatedStartTime[1]);
  plan.endHr = parseInt(updatedEndTime[0]);
  plan.endMin = parseInt(updatedEndTime[1]);
  plan.prevEndTime = updatedEndTime;
  plan.planDragZone.scrollTo({behavior: 'smooth', top: plan.el.offsetTop - 100})
  updateEndTimeOptions();
  const selectedEndInput = document.querySelector(`.end-time option[value="${updatedEndTime[0]}.${updatedEndTime[1]}"]`);
  selectedEndInput.selected = true;
});

planEndTime.addEventListener('change', () => {
  const plan = plans.find((plan) => plan.planId == selectedPlan.planId);
  const startHr = plan.startHr;
  const startMin = plan.startMin;
  const updatedStartTime = planStartTime.value.split('.');
  const updatedEndTime = planEndTime.value.split('.');
  const endHr = updatedEndTime[0];
  const endMin =  updatedEndTime[1];
  plan.startTimeDis.innerText = `${startHr == 0 ? 12 : startHr}:${startMin.toString().padStart(2, 0)} - ${endHr}:${endMin.toString().padStart(2, 0)}`;
  plan.endHr = parseInt(endHr);
  plan.endMin = parseInt(endMin);
  plan.prevEndTime = updatedEndTime;
  const selectedEndInput = document.querySelector(`.end-time option[value="${endHr}.${endMin}"]`);
  //selectedEndInput.selected = true;
  let hrDiff = endHr - startHr;
  let minDiff = endMin - startMin;

  if (minDiff < 0) {
    minDiff += 60;
    hrDiff -= 1;
  }

  if (minDiff === 60) {
    minDiff = 0;
  }

  plan.el.querySelector('.plan-display-zone').style.height = (hrDiff + Math.round(minDiff / 60 * 100)/ 100) * 60 + 'px';
  plan.startTimeDis.innerText = `${parseInt(startHr) == 0 ? 12 : startHr}:${startMin.toString().padStart(2, 0)} - ${endHr}:${endMin.toString().padStart(2, 0)}`;
})

function updateEndTimeOptions() {
  const plan = plans.find((plan) => plan.planId == selectedPlan.planId);
  let prevStartTime = plan.prevStartTime;
  let startHr = plan.startHr;
  let startMin = plan.startMin;

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

    if (hour === startHr + 1 && minute === startMin) {
      option.selected = true;
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
        hrDiff -= 1;
      }


      if (hrDiff === 0) {
        option.textContent = timeText + `  (${minDiff}min)`;
      } else {
        option.textContent = timeText + `  (${hrDiff + minDiff / 60}hr)`;
      }

      planEndTime.appendChild(option);

      if (hour === startHr + 1 && minute === startMin) {
        option.selected = true;
      }
    }
  }
}

//plan save

const planSaveBtn = document.querySelector(".end-btn #plan-save-btn");

/* planSaveBtn.addEventListener('click', async() => {
  let name =  planName.value;
  let date = selectedPlan.date;
  let startTime = `${selectedPlan.startHr}.${selectedPlan.startMin}`;
  let endTime = `${selectedPlan.endHr}.${selectedPlan.endMin}`;
  let repeat = subjectRepeat.value;
  let description = /^\s*$/.test(descriptionInput.innerHTML) ? '' : descriptionInput.innerHTML;
  let subject = subjectType.value;
  let notification = subjectNotification.value;
  const planSaveUrl = updatePlan ? '/study/update-plan' : '/study/add-plan';
  let response = await fetch(planSaveUrl, {
    method: 'post',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({name: name, date: date, startTime: startTime, endTime: endTime, repeat: repeat, description: description, subject: subject, notification: notification, planId: selectedPlan.planId})
  });

  response = await response.json();
  
  if(response.success){
    planName.value = '';
    description.innerHTML = '';
    subjectType.querySelector(`option[value="others"]`).selected = true;
    subjectRepeat.querySelector(`option[value="false"]`).selected = true;
    addPlanModal.classList.add('modal-closed');
    subjectNotification.querySelector(`option[value="0.01"]`).selected = true;
  }
  planSaved = true;
}) */

let plans = [];



let generatedPlan;
let binded = null;
let initialMouseY = -1;
let planDragged = false;
let updatePlan = false;
function mouseUp(target, e) {
  const plan = plans.find(plan => plan.planId == target.id);
  target.style.opacity = "1";
  target.parentNode.removeEventListener('mousemove', binded);
  planDragged = false;
  if(planViewOption.value == 'week') {
    let parentRect = target.parentNode.getBoundingClientRect();
    let leftPosition = e.clientX - parentRect.left;
    target.style.left = Math.floor((leftPosition - 100 )/ (target.offsetWidth)) * (target.offsetWidth) + 100 + 'px';
    const clickedDate = Math.floor((leftPosition - 100) / target.offsetWidth);
    
    sidebarCalendar.date = new Date(sidebarCalendar.updateWeek(plannerSliderDir)[clickedDate]);
    planDate.value = new Date(sidebarCalendar.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
    plan.date = [new Date(sidebarCalendar.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }), sidebarCalendar.date.setHours(0, 0, 0, 0) / 1000];
    sidebarCalendar.generateCalendar();
    plannerSliderDir = 0;
    //updatePlanner(date);
    //target.style.left = Math.floor((leftPosition - 100 )/ (target.offsetWidth)) * (target.offsetWidth) + 100 + 'px';
  }
  if(initialMouseY == -1){
    updatePlan = true;
    selectedPlan = plan;
    addPlanModal.classList.remove('modal-closed');
    planName.value = target.querySelector('.plan-name span').innerText;
    updateEndTimeOptions();
    planDate.value = new Date(plan.date[1] * 1000).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
    planStartTime.querySelector(`option[value="${plan.startHr}.${plan.startMin}"]`).selected = true;
    planEndTime.querySelector(`option[value="${plan.endHr}.${plan.endMin}"]`).selected = true;
    subjectType.querySelector(`option[value="${plan.subject}"]`).selected = true;
    subjectRepeat.querySelector(`option[value="${plan.repeat}"]`).selected = true;
    subjectNotification.querySelector(`option[value="${plan.notification}"]`).selected = true;
    descriptionInput.innerHTML = plan.description;
  } else {
    movePlanner215(plan);
    updatePlanInfo(plan)
  }
  initialMouseY = -1;
}

function mouseDown(target, e) {
  target.style.opacity = "0.8";
  binded = divMove.bind(null, target, planViewOption.value);
  target.parentNode.addEventListener('mousemove', binded);
  generatedPlan = target;
  planDragged = true;
  //target.addEventListener('mouseup', mouseUp.bind(null, target), false);
}

function divMove(target, planViewOption, e) {
  e.preventDefault();
  let dropArea = target.parentNode;
  let parentRect = dropArea.getBoundingClientRect();
  initialMouseY = e.clientY;
  const plan = plans.find(plan => plan.planId == target.id);

  let topPosition = e.clientY - parentRect.top + dropArea.scrollTop - 7;
  updatePlannerTime(topPosition, target);
  if(planViewOption == 'week') {
    let leftPosition = e.clientX - parentRect.left;
    target.style.left = leftPosition - 10 + 'px';
  }
  target.style.position = 'absolute';
  target.style.top = topPosition + 'px';
  target.style.cursor = 'move';
}


let planSaved = true;
function createPlan(x, y, planDragZone) {
  updatePlan = false;
  const planId = generateRandomPlanId(10);
  let parentRect = planDragZone.getBoundingClientRect();
  let topPosition = y - parentRect.top + planDragZone.scrollTop - 7;
  let leftPosition = x - parentRect.left;
  const div = document.createElement('div');
  div.classList.add('plan');
  div.id = planId;
  div.classList.add(`planId${planId}`);
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
  div.style.top = topPosition + 'px';
  if(planViewOption.value == 'week') {
    div.style.left = Math.floor(leftPosition / div.offsetWidth) * div.offsetWidth + 100 + 'px';
    const clickedDate = Math.floor(leftPosition / div.offsetWidth);
    sidebarCalendar.date = new Date(updateWeek(plannerSliderDir)[clickedDate]);
    //date = new Date(date.getFullYear(), date.getMonth(), date.getDate() - 1);
    generateCalendar();
    updatePlanner(sidebarCalendar.date);
  }
  const planInfo =  {
    planId: planId,
    el: div,
    date: [new Date(sidebarCalendar.date).toISOString().substr(0, 10), new Date(sidebarCalendar.date).setHours(0, 0, 0, 0) / 1000],
    startTimeDis: div.querySelector('.plan-time-info span'),
    planDragZone: planDragZone,
    startHr: null,
    startMin: null,
    endHr: null,
    endMin: null,
    description: null,
    subject: 'others',
    repeat: false,
    notification: 0.01,
    prevStartTime: null,
    prevEndTime: null,
  };

  plans.push(
    planInfo
  );
  selectedPlan = planInfo;
  const times = updatePlannerTime(topPosition, div);
  const plan = plans.find(plan => plan.planId == div.id);
  movePlanner215(plan);
  createStartTimeOptions();
  plan.startHr = times.startHr;
  plan.startMin = times.startMin;
  plan.endHr = times.endHr;
  plan.endMin = times.endMin;
  planDate.value = new Date(sidebarCalendar.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
  const selectedStartInput = document.querySelector(`.start-time option[value="${times.startHr}.${times.startMin}"]`);

  planSaved = false;
}

planDragZone.addEventListener('scroll', (e) => {
  if(planDragged){
    e.preventDefault()
    let dropArea = generatedPlan.parentNode;
    let parentRect = dropArea.getBoundingClientRect();
    
    // Calculate the correct top position relative to the parent container
    let topPosition = initialMouseY - parentRect.top + dropArea.scrollTop;
    // Apply the top position to the dragged element
    generatedPlan.style.position = 'absolute';
    generatedPlan.style.top = topPosition + 'px';
    generatedPlan.style.cursor = 'move';
  }
})

function updatePlanner(date) {
  if(planViewOption.value == 'day') {
    plans.forEach((plan) => {
      if(plan.repeat == 'daily' || plan.date[1] == new Date(date).getTime() / 1000) {
        const activeSlide = document.querySelectorAll('.planner .swiper-slide .plan-drag-zone')[plannerSliderDir];
        activeSlide.appendChild(plan.el)
        plan.el.style.left = '100px';
        movePlanner215(plan)
      } else {
        plan.el.remove();
        const planEls = document.querySelectorAll(`.planId${plan.planId}`);
        planEls.forEach((planEl) => {
          planEl.remove();
        })
      }
    })
  }

  if(planViewOption.value == 'week') {
    let week = sidebarCalendar.updateWeek(plannerSliderDir);
    week = week.map((day) => {
      return day.getTime() / 1000;
    })
    plans.forEach((plan) => {
      if(plan.repeat == 'daily' || plan.repeat == 'weekly' || week.includes(plan.date[1])) {
        const activeSlide = document.querySelectorAll('.planner #weekly-planner .swiper-slide .plan-drag-zone')[plannerSliderDir];
        activeSlide.appendChild(plan.el);
        move2Date(plan)
        movePlanner215(plan)
      } else {
        plan.el.remove();
        const planEls = document.querySelectorAll(`.planId${plan.planId}`);
        planEls.forEach((planEl) => {
          planEl.remove();
        })
      }
    })
  }
}

function updatePlannerTime(topPosition, div) {
  const plan = plans.find(plan => plan.planId == div.id);
  const interval = 15;
  let startTime = (Math.round((topPosition / 60 - plannerHeader.offsetHeight / 60) * 100 + 3) / 100).toFixed(2);
  let endTime = (Math.round(((topPosition + div.offsetHeight) / 60 - plannerHeader.offsetHeight / 60) * 100 + 3) / 100).toFixed(2);
  let startHr = parseInt(startTime.toString().split('.')[0]);
  let startMin = Math.floor(parseInt(startTime.toString().split('.')[1]) / 10 * 6);
  let endHr = parseInt(endTime.toString().split('.')[0]);
  let endMin = endTime % 1 !== 0 ? Math.floor(parseInt(endTime.toString().split('.')[1]) / 10 * 6) : 0;
  endMin = typeof endMin == 'number' ? parseFloat(endMin.toString().padStart(2, 0)) : endMin;
  startMin = Math.floor(startMin / interval) * interval;
  endMin = Math.floor(endMin / interval) * interval;
  if (startMin == 60) {
    startHr += 1;
    startMin = 0;
  }

  if(endMin == 60) {
    endHr += 1;
    endMin = 0;
  }
  
  div.querySelector('.plan-time-info span').innerText = `${startHr == 0 ? 12 : startHr}:${startMin.toString().padStart(2, '0')} - ${endHr == 0 ? 12 : endHr}:${endMin.toString().padStart(2, 0)}`;
  plan.startHr = startHr;
  plan.startMin = startMin;
  plan.endHr = endHr;
  plan.endMin = endMin;
  plan.prevStartTime = [startHr, startMin];
  plan.prevEndTime = [endHr, endMin]
  updateEndTimeOptions();
  createStartTimeOptions();
  return {startHr: startHr, startMin: startMin, endHr: endHr, endMin: endMin};
}

function movePlanner215(plan) {
  const hr = plan.startHr;
  const min = plan.startMin;
  plan.el.style.top = hr * 60  + min + plannerHeader.offsetHeight + 'px';
}

function generateRandomPlanId(length) {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    result += characters.charAt(randomIndex);
  }

  return result;
}

async function updatePlanInfo(plan){
  let name =  plan.name;
  let date = plan.date;
  let startTime = `${plan.startHr}.${plan.startMin}`;
  let endTime = `${plan.endHr}.${plan.endMin}`;
  let repeat = plan.repeat;
  let description = plan.description;
  let subject = plan.subject;
  let notification = plan.notification;
  let planId = plan.planId
  const response = await fetch('/study/update-plan', {
    method: 'post',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({name: name, date: date, startTime: startTime, endTime: endTime, repeat: repeat, description: description, subject: subject, notification: notification, planId: planId})
  })
}
let currentTimeBarInterval = false
function createCurrentTimeBar(displayZone) {
  clearInterval(currentTimeBarInterval)
  let div;
  if(document.querySelector('.planner-timebar')){
    document.querySelector('.planner-timebar').remove()
  }
  div = document.createElement('div');
  div.classList.add('planner-timebar')
  if(sidebarCalendar.date.setHours(0, 0, 0, 0).toString() == today.setHours(0, 0, 0, 0).toString()) {
    div = document.createElement('div');
    div.classList.add('planner-timebar');
    displayZone.appendChild(div);
    div.style.top = new Date().getHours() * 60 + new Date().getMinutes() + plannerHeader.offsetHeight + 'px';
    currentTimeBarInterval = setInterval(() => {
      div.style.top = new Date().getHours() * 60 + new Date().getMinutes() + plannerHeader.offsetHeight + 'px';
    }, 10000);
  }
}

//week part
function move2Date(plan) {
  const day = new Date(plan.date[1] * 1000).getDay();
  const planWidth = (plan.el.parentNode.offsetWidth - 100) / 7 - 1;
  plan.el.style.left = planWidth * day + 100 + 'px';
}
const calendar = new inputCalendar(".date-input");