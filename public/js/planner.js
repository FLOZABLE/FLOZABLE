let dailyPlanCalendar  = new Swiper('.swiper-container#daily-planner', {
  loop: true,
  navigation: {
    nextEl: 'calendar-btn.nextday',
    prevEl: '.calendar-btn.prevday',
  }
});

let weeklyPlanCalendar = new Swiper('.swiper-container#weekly-planner', {
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
    nextEl: 'calendar-btn.nextday',
    prevEl: '.calendar-btn.prevday',
  }

});

let monthlyPlanCalendar = new Swiper('.swiper-container#monthly-planner', {
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

document.onload = (() => {
  dailyPlanCalendar.activeIndex = 1
})()

//sidebar calendar
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
        element.value = date.toLocaleDateString().substr(0, 10);
      }
    }
    return date;
  }

  generateCalendar() {
    const calendar = document.getElementById(this.calendarName);
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
    //document.getElementById('date').textContent = this.date;
    this.getCurrentDate(document.getElementById('currentDate'), true);
    this.getCurrentDate(document.getElementById('date'), false);
  }

  setDate(newDate) {
    this.date = new Date(newDate.getFullYear(), newDate.getMonth(), newDate.getDate());
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
    const planDragZone = document.querySelectorAll('#daily-planner .swiper-slide .plan-drag-zone')[1];
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
    updatePlanner(this.date);
  }

  prevMonth() {
    this.date = new Date(this.date.getFullYear(), this.date.getMonth() - 1, 1);
    this.generateCalendar();
    updatePlanner(this.date);
  }

  prevDay() {
    this.date = new Date(this.date.getFullYear(), this.date.getMonth(), this.date.getDate() - 1);
    this.generateCalendar();
    updatePlanner(this.date);
    const planDragZone = document.querySelectorAll('#daily-planner .swiper-slide .plan-drag-zone')[0];
    createCurrentTimeBar(planDragZone);
  }

  nextDay() {
    this.date = new Date(this.date.getFullYear(), this.date.getMonth(), this.date.getDate() + 1);
    this.generateCalendar();
    updatePlanner(this.date);
    const planDragZone = document.querySelectorAll('#daily-planner .swiper-slide .plan-drag-zone')[2];
    createCurrentTimeBar(planDragZone);
  }

  prevWeek() {
    this.date = new Date(this.date.getFullYear(), this.date.getMonth(), this.date.getDate() - 7);
    this.generateCalendar();
    updatePlanner(this.date);
    const planDragZone = document.querySelectorAll('#daily-planner .swiper-slide .plan-drag-zone')[0];
    createCurrentTimeBar(planDragZone);
  }

  nextWeek() {
    this.date = new Date(this.date.getFullYear(), this.date.getMonth(), this.date.getDate() + 7);
    this.generateCalendar();
    updatePlanner(this.date);
    const planDragZone = document.querySelectorAll('#daily-planner .swiper-slide .plan-drag-zone')[2];
    createCurrentTimeBar(planDragZone);
  }

  updateWeek() {
    const today = new Date(this.date);
    const currentDay = today.getDay(); // 0 (Sunday) to 6 (Saturday)
    const startOfWeek = new Date(today.getFullYear(), today.getMonth(), today.getDate() - currentDay);
    const week = [];

    const weeklyPlannerHeader = document.querySelectorAll('.weekly-planner-header')[weeklyPlanCalendar.activeIndex];

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

let plans = [];

function updatePlanner(date) {
  sidebarCalendar.updateWeek();
  startDateCalendar.updateInput(date);
  if(planViewOption.value == 'day') {
    plans.map(plan => {
      if(date.getTime() == plan.date.getTime()) {
        plan.el.classList.remove('removed');
        plan.el.style.width = '';
        plan.el.style.left = '';
        plan.el.style.top = plan.startHr * 60 + plan.startMin + 'px';
        dayPlanDragZones[dailyPlanCalendar.activeIndex].appendChild(plan.el);
      } else {
        plan.el.classList.add('removed');
      }
    })
  } else if(planViewOption.value == 'week') {
    const now = new Date();
    const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay() + (now.getDay() === 0 ? -6 : 1)));
    startOfWeek.setHours(0, 0, 0, 0);
    const endOfWeek = new Date(startOfWeek.getTime() + 6 * 24 * 60 * 60 * 1000 + 86399999);
    plans.map(plan => {
      if(startOfWeek.getTime() <= date.getTime() && date.getTime() <= endOfWeek.getTime()) {
        plan.el.classList.remove('removed');
        const planWidth = (weekPlanDragZones[weeklyPlanCalendar.activeIndex].offsetWidth - 100) / 7 - 2;
        plan.el.style.width = planWidth + 'px';
        plan.el.style.top = (plan.startHr + 1) * 60 + plan.startMin + 'px';
        plan.el.style.left = (plan.date.getDay() - 1) * planWidth + 100 + 'px';
        weekPlanDragZones[weeklyPlanCalendar.activeIndex].appendChild(plan.el);
      } else {
        plan.el.classList.add('removed');
      }
    })
  } else {
    plans.map(plan => {
      if(date.getTime() == plan.date.getTime()) {
        plan.el.classList.remove('removed');
        dayPlanDragZones[dailyPlanCalendar.activeIndex].appendChild(plan.el);
      } else {
        plan.el.classList.add('removed');
      }
    })
  }
}

function createCurrentTimeBar(planDragZone) {
  console.log(planDragZone)
}

const sidebarCalendar = new Calendar('table', 'calendar');

document.onload = sidebarCalendar.generateCalendar(new Date());
sidebarCalendar.updateWeek();

const calendarPrevDayBtn = document.querySelector('.btn.prevday');
const calendarNextDayBtn = document.querySelector('.btn.nextday');
const calendarPrevMonthBtn = document.querySelector('.icon.prevmonth');
const calendarNextMonthBtn = document.querySelector('.icon.nextmonth');
const calendarTodayBtn = document.querySelector('.btn.resetday');

calendarPrevDayBtn.addEventListener('click', () => {
  sidebarCalendar.prevDay();
})

calendarNextDayBtn.addEventListener('click', () => {
  sidebarCalendar.nextDay();
})

calendarPrevMonthBtn.addEventListener('click', () => {
  sidebarCalendar.prevMonth();
})

calendarNextMonthBtn.addEventListener('click', () => {
  sidebarCalendar.nextMonth();
})

calendarTodayBtn.addEventListener('click', () => {
  sidebarCalendar.resetDate();
})

const dayPlanDragZones = document.querySelectorAll('#daily-planner .plan-drag-zone');
const weekPlanDragZones = document.querySelectorAll('#weekly-planner .plan-drag-zone');
const weeklyPlanSliders = document.querySelectorAll('#weekly-planner .swiper-slide');
const subjectsContainer = document.getElementById('subjects-container');
const eventsContainer = document.getElementById('events-container');

let subjects;
(async() => {
  //bring subjects
  subjects = await fetch('/study/bring-subjects', {
    method: 'post',
    headers: {
      'Content-Type': 'application/json'
    }
  });

  subjects = await subjects.json();
  console.log(subjects);
  const subjectsOptWrapper = document.getElementById('subject-type');
  subjects.push({color: "#039BE5", id: "0000000000",name: "others"})
  subjects.map(subject => {
    const option = document.createElement('option');
    option.setAttribute('value', subject.id);
    option.innerText = subject.name;
    subjectsOptWrapper.appendChild(option);
    
    //create subject selector
    const subjectOpt = document.createElement('div');
    subjectOpt.classList.add('d-flex');
    subjectOpt.classList.add('mt-4');
    subjectOpt.innerHTML = `
    <div class="checkbox-wrapper-37">
  <input type="checkbox" name="checkbox" id="terms-checkbox-37" checked = true/>
  <label for="terms-checkbox-37" class="terms-label">
    <svg
      class="checkbox-svg"
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <mask id="path-1-inside-1_476_5-37" fill="white">
        <rect width="200" height="200" />
      </mask>
      <rect
        width="200"
        height="200"
        class="checkbox-box stroke-dashoffset"
        stroke-width="40"
        mask="url(#path-1-inside-1_476_5-37)"
        style="stroke: ${subject.color}"
      />
      <path
        class="checkbox-tick stroke-dashoffset"
        d="M52 111.018L76.9867 136L149 64"
        stroke-width="15"
        style="stroke: ${subject.color}"
      />
    </svg>
    <span class="label-text">${subject.name}</span>
  </label>
</div>
    `;
    const checkbox = subjectOpt.querySelector('input[type="checkbox"]');
    const checkboxBox = subjectOpt.querySelector('.checkbox-box');
    const checkboxTick = subjectOpt.querySelector('.checkbox-tick');
    checkbox.addEventListener('change', () => {
      if(checkbox.checked) {
        /* checkboxBox.classList.add('stroke-dashoffset');
        checkboxTick.classList.add('stroke-dashoffset'); */
        plans.map(plan => {
          if(plan.subject == subject.id) {
            plan.el.classList.remove('removed');
          }
        })
      } else {
        /* checkboxBox.classList.remove('stroke-dashoffset');
        checkboxTick.classList.remove('stroke-dashoffset'); */
        plans.map(plan => {
          if(plan.subject == subject.id) {
            plan.el.classList.add('removed');
          }
        })
      };
    })
    subjectsContainer.appendChild(subjectOpt);
  })

  SavedPlans = await fetch('/study/bring-plans', {
    method: 'post',
    headers: {
      'Content-Type': 'application/json'
    }
  });

  SavedPlans = await JSON.parse(await SavedPlans.json());
  console.log(SavedPlans)
  SavedPlans.map(plan => {
    const planEl = document.createElement('div');
    planEl.classList.add('plan');
    planEl.id = `planId-${plan.id}`;
    planEl.draggable = true;
    planEl.innerHTML = `
    <div class="plan-name">
    <span>${plan.name}</span>
    </div>
    <div class="plan-time">
      <span></span>
    </div>
    `;
    const decodedDescription = decodeURIComponent(plan.description);
    const subject = subjects.find(subject => {return subject.id == plan.subject});
    console.log(subject)
    const sliderIndex = dailyPlanCalendar.activeIndex;
    const planInfo = {
      id: plan.id,
      name: plan.name,
      el: planEl,
      date: new Date(plan.date * 1000),
      startHr: plan.hr,
      startMin: plan.min,
      length: plan.length,
      repeat: plan.repeat,
      subject: plan.subject,
      repeat: plan.repeat,
      notification: plan.notification,
      planDragZone: dayPlanDragZones[sliderIndex],
      priority: plan.priority,
      description: decodedDescription,
      timeDisp: planEl.querySelector('.plan-time span'),
      nameDisp: planEl.querySelector('.plan-name span'),
      saved: true
    }
    planEl.addEventListener('mousedown', mouseDown.bind(null, planInfo), false);
    planEl.addEventListener('mouseup', mouseUp.bind(null, planInfo), false);
    plans.push(planInfo);
    planEl.style.top = plan.hr * 60 + plan.min + 'px';
    planEl.style.height = plan.length + 'px';
    const [dispStartHr, dispStartMin, startampm, dispStopHr, dispStopMin, stopampm] = dispTime(planInfo);

    planEl.style.backgroundColor = subject.color;

    //events container
    const event = document.createElement('div');
    event.classList.add('d-flex');
    event.classList.add('mt-4');
    /* 
    <div class="d-flex mt-4">
                        <div class="icon icon-shape bg-gradient-dark shadow text-center">
                          <i class="material-icons opacity-10 pt-1">notifications</i>
                        </div>
                        <div class="ms-3">
                          <div class="numbers">
                            <h6 class="mb-1 text-dark text-sm">Meeting with Marry</h6>
                            <span class="text-sm">24 March 2021, at 10:00 PM</span>
                          </div>
                        </div>
                      </div>
    */
    event.innerHTML = `
    <div class="icon icon-shape shadow text-center" style = "background-color: ${subject.color}">
    </div>
    <div class="ms-3">
      <div class="numbers">
        <h6 class="mb-1 text-dark text-sm">${plan.name}</h6>
        <span class="text-sm">${decodedDescription}</span>    
        <span class="text-sm">${dispStartHr}:${dispStartMin.toString().padStart(2, '0')}-${dispStopHr}:${dispStopMin.toString().padStart(2, '0')}</span>
      </div>
    </div>
    `
    eventsContainer.appendChild(event);
  })
  updatePlanner(new Date(new Date().setHours(0, 0, 0, 0)))
})();



const addPlanModal = document.getElementById('add-plan-modal');
const addPlanModalCloseBtn = document.getElementById('add-plan-close');
const planViewOption = document.getElementById('view-options');

const dailyPlannerCont = document.getElementById('daily-planner');
const weeklyPlannerCont = document.getElementById('weekly-planner');
const monthlyPlannerCont = document.getElementById('monthly-planner');

planViewOption.addEventListener('change', () => {
  if(planViewOption.value == 'day') {
    console.log('day')
    dailyPlannerCont.classList.remove('closed-planner');
    weeklyPlannerCont.classList.add('closed-planner');
    monthlyPlannerCont.classList.add('closed-planner');
  } else if (planViewOption.value == 'week') {
    console.log('week')
    dailyPlannerCont.classList.add('closed-planner');
    weeklyPlannerCont.classList.remove('closed-planner');
    monthlyPlannerCont.classList.add('closed-planner');
  } else {
    dailyPlannerCont.classList.add('closed-planner');
    weeklyPlannerCont.classList.add('closed-planner');
    monthlyPlannerCont.classList.remove('closed-planner');
  }
  updatePlanner(sidebarCalendar.date)
})
dayPlanDragZones.forEach((planDragZone) => {
  planDragZone.addEventListener('click', (event) => {
    if(event.target == planDragZone || event.target.classList.contains('block') || event.target.classList.contains('line')){
      createPlan(event.clientX, event.clientY, planDragZone);
      openAddPlanModal();
    }
  });

  planDragZone.addEventListener('scroll', (e) => {
    if(planDragged) {
      //e.preventDefault();
      const target = selectedPlan.el;
      const parentNode = target.parentNode;
      const parentRect = parentNode.getBoundingClientRect();

      const topPosition = initialMouseY - parentRect.top + parentNode.scrollTop;
      target.style.top = topPosition + 'px';
    }
  })
})

weekPlanDragZones.forEach((planDragZone) => {
  planDragZone.addEventListener('click', (event) => {
    if(event.target == planDragZone || event.target.classList.contains('block') || event.target.classList.contains('line')){
      createPlan(event.clientX, event.clientY, planDragZone);
      openAddPlanModal();
    }
  });

  planDragZone.addEventListener('scroll', (e) => {
    if(planDragged) {
      //e.preventDefault();
      const target = selectedPlan.el;
      const parentNode = target.parentNode;
      const parentRect = parentNode.getBoundingClientRect();

      const topPosition = initialMouseY - parentRect.top + parentNode.scrollTop;
      target.style.top = topPosition + 'px';
    }
  })
})

addPlanModalCloseBtn.addEventListener('click', () => {
  addPlanModal.classList.add('closed-modal');
  if(!selectedPlan.saved) {
    plans.find((plan, i) => {
      if(plan.id == selectedPlan.id) {
        plans.pop(i);
      }
    });
    selectedPlan.el.remove();
  }
  selectedPlan = {};
})

//open add plan modal
const planTitleCont = document.getElementById('subject-name');
const planDateCont = document.getElementById('date-input');
const planStartCont = document.getElementById('startTimeDisp');
const planStopCont = document.getElementById('stopTimeDisp');
const planRepeatCont = document.getElementById('repeat');
const planDescCont = document.querySelector('.ql-editor');
const planSubjectContainer = document.querySelector('#subject-type');
const planNotification = document.querySelector('#notification');
const planSaveBtn = document.getElementById('save-plan-btn');
const priorityCont = document.getElementById('priority');

function openAddPlanModal() {
  startTimeSettingModal.classList.add('removed');
  stopTimeSettingModal.classList.add('removed');
  addPlanModal.classList.remove('closed-modal');
  planTitleCont.value = selectedPlan.name;
  const [startHr, startMin, startampm, stopHr, stopMin, stopampm] = dispTime(selectedPlan);
  planStartCont.innerText = `${startHr}:${startMin.toString().padStart(2, '0')} ${startampm}`;
  planStopCont.innerText = `${stopHr}:${stopMin.toString().padStart(2, '0')} ${stopampm}`;
  updateEndTimeOptions(startHr, startMin);

  const selectedPlanSubject = planSubjectContainer.querySelector(`option[value="${selectedPlan.subject}"]`);
  selectedPlanSubject.selected = true;

  quill.root.innerHTML = selectedPlan.description;

  const selectedPlanRe = planRepeatCont.querySelector(`option[value="${selectedPlan.repeat}"]`);
  selectedPlanRe.selected = true;

  const selectedPlanNoti = planNotification.querySelector(`option[value="${selectedPlan.notification}"]`);
  selectedPlanNoti.selected = true;

  priorityCont.value = selectedPlan.priority;
}

planTitleCont.addEventListener('input', () => {
  const name = planTitleCont.value;
  selectedPlan.name = name;
  selectedPlan.nameDisp.innerText = name;
})

priorityCont.addEventListener('change', () => {
  selectedPlan.priority = priorityCont.value;
})

const notificationAlertSuccess = document.getElementById('notification-alert-success');
const notificationAlertFail = document.getElementById('notification-alert-fail');

planSaveBtn.addEventListener('click', async() => {
  updatePlan();
});

async function updatePlan () {
  /* const {name, id, date, startHr, startMin, length, repeat, description, subject, notification, priority} = selectedPlan;
  let response = await fetch('/study/update-plan', {
    method: 'post',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({name: name, id: id, date: date.setHours(0, 0, 0, 0) / 1000, hr: startHr, min: startMin, length: length, repeat: repeat, description: description, subject: subject, notification: notification, priority: priority})
  });

  response = await response.json();
  console.log(response);
  if(response.success) {
    notificationAlertSuccess.classList.remove('notify');
    notificationAlertSuccess.offsetHeight;
    notificationAlertSuccess.classList.add('notify');
    addPlanModal.classList.add('closed-modal');
    selectedPlan.saved = true;

    //events container
    const event = document.createElement('div');
    event.classList.add('ms-3');
    event.innerHTML = `
    <div class="numbers">
    <h6 class="mb-1 text-dark text-sm">${selectedPlan.name}</h6>
    <span class="text-sm">${selectedPlan.description}</span>    
    <span class="text-sm">${selectedPlan.el.querySelector('.plan-time span').innerText}</span>
    </div>
    `
    eventsContainer.appendChild(event);
  } else {
    notificationAlertFail.classList.remove('notify');
    notificationAlertSuccess.offsetHeight;
    notificationAlertFail.classList.add('notify');
  } */
}

planRepeatCont.addEventListener('change', () => {
  selectedPlan.repeat = planRepeatCont.value;
})

planSubjectContainer.addEventListener('change', () => {
  selectedPlan.subject = planSubjectContainer.value;
  const subject = subjects.find(subject => {return subject.id == selectedPlan.subject});
  selectedPlan.el.style.backgroundColor = subject.color;
  console.log(selectedPlan.subject, subject)
})

planNotification.addEventListener('change', () => {
  selectedPlan.notification = planNotification.value;
})
//create plan

function createPlan(x, y, planDragZone) {
  const planEl = document.createElement('div');
  const planId = generateRandomPlanId(10);
  const parentRect = planDragZone.getBoundingClientRect();
  const topPosition = y - parentRect.top + planDragZone.scrollTop - 7;
  const leftPosition = x - parentRect.left;

  let hr, min;
  if(planViewOption.value == 'day') {
    [hr, min] = getPlanTime(topPosition);
    planEl.style.top = hr * 60 + min + 'px';
  } else if(planViewOption.value == 'week') {
    const parentNode = weekPlanDragZones[weeklyPlanCalendar.activeIndex];
    [hr, min] = getPlanTime(topPosition - 60);
    planEl.style.top = (hr + 1) * 60 + min + 'px';
    const planWidth = (parentNode.offsetWidth - 100) / 7;
    planEl.style.width = planWidth + 'px';
    const day = Math.floor((x - parentNode.getBoundingClientRect().left - 100) / planWidth);
    planEl.style.left = 100 + (planWidth - 2) * day + 'px';
    console.log(day, parentNode.getBoundingClientRect().left);
    const newDate = new Date(sidebarCalendar.date);
    newDate.setDate(sidebarCalendar.date.getDate() + day - sidebarCalendar.date.getDay());
    sidebarCalendar.setDate(newDate);
    selectedPlan.date = newDate;
    startDateCalendar.updateInput(newDate)
  }
  let ampm = 'am';
  let dispStartHr = hr;
  let dispStartMin = min;
  if(dispStartHr > 12) {
    dispStartHr -= 12;
    ampm = 'pm';
  }
  planEl.classList.add('plan');
  planEl.id = `planId-${planId}`;
  planEl.draggable = true;
  planEl.innerHTML = `
  <div class="plan-name">
  <span>(No title)</span>
  </div>
  <div class="plan-time">
    <span>${dispStartHr}:${dispStartMin.toString().padStart(2, '0')} ${ampm}</span>
  </div>
  `

  const planInfo = {
    id: planId,
    name: '(No title)',
    el: planEl,
    date: new Date(sidebarCalendar.date),
    startHr: hr,
    startMin: min,
    endHr: hr + 1,
    length: 60,
    endMin: min,
    repeat: 'false',
    subject: '0000000000',
    repeat: 'false',
    notification: 'false',
    planDragZone: planDragZone,
    priority: 50,
    description: '',
    timeDisp: planEl.querySelector('.plan-time span'),
    nameDisp: planEl.querySelector('.plan-name span'),
    saved: false
  }
  planEl.addEventListener('mousedown', mouseDown.bind(null, planInfo), false);
  planEl.addEventListener('mouseup', mouseUp.bind(null, planInfo), false);
  selectedPlan = planInfo;
  plans.push(planInfo);
  planDragZone.appendChild(planEl);
  planEl.style.backgroundColor = '#039BE5';
}

function getPlanTime(x) {
  let hr = Math.floor(x / 60);
  let min = Math.round((x % 60) / 15) * 15;
  if(min == 60) {
    hr += 1;
    min = 0;
  }
  return [hr, min];
}

//plan id
function generateRandomPlanId(length) {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    result += characters.charAt(randomIndex);
  }

  return result;
}

let bind = null;
let planDragged = false;
let selectedPlan = {};
let initialMouseY = -1;
function mouseDown(planInfo, e) {
  planDragged = true;
  const target = planInfo.el;
  target.style.opacity = "0.8";
  selectedPlan = planInfo;
  if(planViewOption.value == 'day') {
    bind = divMoveX.bind(null, planInfo, planViewOption.value)
  } else if(planViewOption.value == 'week'){
    bind = divMoveXY.bind(null, planInfo, planViewOption.value)
  } else {
    bind = divMoveX.bind(null, planInfo, planViewOption.value)
  }
  target.parentNode.addEventListener('mousemove', bind);
}

function mouseUp(planInfo, e) {
  planDragged = false;
  const target = planInfo.el;
  target.style.opacity = "1";
  target.parentNode.removeEventListener('mousemove', bind);
  if(initialMouseY == -1) {
    selectedPlan = planInfo;
    openAddPlanModal();
    return 0;
  }
  const parentRect = target.parentNode.getBoundingClientRect();
  const topPosition = e.clientY - parentRect.top + target.parentNode.scrollTop - 7;
  const [hr, min] = getPlanTime(topPosition);
  target.style.top = hr * 60 + min + 'px';
  if(planViewOption.value == 'week') {
    const day = Math.floor((e.clientX - parentRect.left - 100) / target.offsetWidth);
    target.style.left = 100 + (target.offsetWidth) * day + 'px';
    //selectedPlan.date = new Date(selectedPlan.date.getFullYear(), sel)

    const newDate = new Date(sidebarCalendar.date);
    newDate.setDate(sidebarCalendar.date.getDate() + day - sidebarCalendar.date.getDay());
    sidebarCalendar.setDate(newDate);
    selectedPlan.date = newDate;
    startDateCalendar.updateInput(newDate);
    console.log(newDate)
  }
  initialMouseY = -1;
  updatePlan();
}

function divMoveX(planInfo, planViewOption, e) {
  e.preventDefault();
  const target = planInfo.el;
  let dropArea = target.parentNode;
  let parentRect = dropArea.getBoundingClientRect();
  let topPosition = e.clientY - parentRect.top + dropArea.scrollTop - 7;
  target.style.top = topPosition + 'px';
  initialMouseY = e.clientY;
  const [hr, min] = getPlanTime(topPosition);
  planInfo.startHr = hr;
  planInfo.startMin = min;
  dispTime(planInfo);
}

function divMoveXY(planInfo, planViewOption, e) {
  e.preventDefault();
  const target = planInfo.el;
  let dropArea = target.parentNode;
  let parentRect = dropArea.getBoundingClientRect();
  let topPosition = e.clientY - parentRect.top + dropArea.scrollTop - 7;
  let leftPosition = e.clientX - parentRect.left - 7;
  target.style.top = topPosition + 'px';
  target.style.left = leftPosition + 'px';
  initialMouseY = e.clientY;
  const [hr, min] = getPlanTime(topPosition - 60);
  planInfo.startHr = hr;
  planInfo.startMin = min;
  dispTime(planInfo);
}

function dispTime(planInfo) {
  const hr = planInfo.startHr;
  const min = planInfo.startMin;
  const length = planInfo.length;
  let dispStartHr = hr;
  let dispStartMin = min;
  let dispStopHr = hr;
  let dispStopMin = min + length;
  let startampm = 'am';
  let stopampm = 'am';

  while(dispStopMin >= 60) {
    dispStopMin -= 60;
    dispStopHr += 1;
  }
  if(dispStopHr >= 12 && dispStopHr < 24) {
    stopampm = 'pm'
  }
  if(dispStopHr > 12) {
    dispStopHr -= 12;
  }
  if(hr >= 12 && hr < 24) {
    startampm = 'pm'
  }
  if(hr > 12) {
    dispStartHr -= 12;
  }
  planInfo.timeDisp.innerText = `${dispStartHr}:${dispStartMin.toString().padStart(2, '0')} - ${dispStopHr}:${dispStopMin.toString().padStart(2, '0')}`
  return [dispStartHr, dispStartMin, startampm, dispStopHr, dispStopMin, stopampm]
}


//calendar selector

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

      const date = new Date(newYear, newMonth, newDay);

      const options = {
        weekday: 'long',
        month: 'long',
        day: 'numeric'
      };

      const formattedDate = date.toLocaleDateString('en-US', options);

      this.input.value = formattedDate;
      selectedPlan.date = new Date(date);
      sidebarCalendar.setDate(new Date(date));
      //updatePlanner(date);
  }

  updateInput(date) {
    const formattedDate = date.toLocaleString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
    this.input.value = formattedDate;
    selectedPlan.date = date;
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

const startDateCalendar = new inputCalendar('.date-input');

const startTimeSettingBtn = document.getElementById('startTimeSetting');
const stopTimeSettingBtn = document.getElementById('stopTimeSetting');
const startTimeSettingModal = document.querySelector('#startTimeSetting .options');
const stopTimeSettingModal = document.querySelector('#stopTimeSetting .options');
const startTimeDisp = document.getElementById('startTimeDisp');
const stopTimeDisp = document.getElementById('stopTimeDisp');

startTimeSettingBtn.addEventListener('click', () => {
  startTimeSettingModal.classList.toggle('removed');
})

stopTimeSettingBtn.addEventListener('click', () => {
  stopTimeSettingModal.classList.toggle('removed');  
})


//create start time options
for(let i = 0; i < 24; i++) {
  for(let j = 0; j < 60; j += 15) {
    const option = document.createElement('div');
    option.classList.add('option');
    option.setAttribute('data-value', `${i}.${j}`);
    let dispTimeVal;
    if(i == 0) {
      dispTimeVal = `12:${j.toString().padStart(2, '0')} am`;
    } else if(i > 12) {
      dispTimeVal = `${i - 12}:${j.toString().padStart(2, '0')} pm`;
    } else {
      dispTimeVal = `${i}:${j.toString().padStart(2, '0')} am`;
    }
    option.innerHTML = `
    <span>${dispTimeVal}</span>
    `

    startTimeSettingModal.appendChild(option);
    option.addEventListener('click', () => {
      updateEndTimeOptions(i, j)
      startTimeDisp.innerText = dispTimeVal;
      selectedPlan.startHr = i;
      selectedPlan.startMin = j;
      let stopMin = i * 60 + j + selectedPlan.length;
      let stopHr = Math.floor(stopMin / 60);
      stopMin = Math.floor(stopMin % 60);
      const [dispStartHr, dispStartMin, startampm, dispStopHr, dispStopMin, stopampm] = dispTime(selectedPlan);
      stopTimeDisp.innerText = `${dispStopHr}:${dispStopMin.toString().padStart(2, '0')} ${stopampm}`;
      const target = selectedPlan.el;
      if(planViewOption.value == 'day') {
        target.style.top = i * 60 + j + 'px';
      } else if(planViewOption.value == 'week') {
        target.style.top = (i + 1) * 60 + j + 'px';
      }
    })
  }
}

//update&create end time options
function updateEndTimeOptions(startHr, startMin) {
  stopTimeSettingModal.innerHTML = '';
  for(let hr = startHr; hr < startHr + 1; hr++) {
    for(let min = startMin; min < startMin + 60; min += 15) {
      const option = document.createElement('div');
      option.classList.add('option');
      let dispHr = hr;
      let dispMin = min;
      let ampm = 'am';
      if(min >= 60) {
        dispMin -= 60;
        dispHr += 1;
      }
      option.setAttribute('data-value', `${dispHr}.${dispMin}`);
      const origHr = dispHr;
      const origMin = dispMin;
      
      if(dispHr > 24) {
        dispHr -= 24;
      }

      if(12 < dispHr && dispHr != 24) {
        ampm = 'pm';
        dispHr -= 12;
      }

      if(dispHr == 0 || dispHr == 24) {
        dispHr = 12;
      } else if (dispHr == 12) {
        ampm = 'pm';
      }

      const stopOptVal = `${dispHr}:${(dispMin).toString().padStart(2, '0')} ${ampm} (${min - startMin} mins)`;
      option.innerText = stopOptVal;
      stopTimeSettingModal.appendChild(option);
      option.addEventListener('click', () => {
        stopTimeDisp.innerText = `${dispHr}:${(dispMin).toString().padStart(2, '0')} ${ampm}`;
        //const data = option.getAttribute('data-value').split('.');
        let diffMin = origHr * 60 + origMin - selectedPlan.startHr * 60 - selectedPlan.startMin;
        selectedPlan.length = diffMin;
        selectedPlan.el.style.height = diffMin + 'px';
        dispTime(selectedPlan);
      })
    }
  }

  for(let hr = startHr + 1; hr < startHr + 24; hr++) {
    for(let min = startMin; min < startMin + 60; min += 30) {
      const option = document.createElement('div');
      option.classList.add('option');
      let dispHr = hr;
      let dispMin = min;
      let ampm = 'am';
      let diffMin = 0;
      let diffHr = 0;

      if(min >= 60) {
        dispMin -= 60;
        dispHr += 1;
      }
      option.setAttribute('data-value', `${dispHr}.${dispMin}`);
      const origHr = dispHr;
      const origMin = dispMin;
      if(dispHr > 24) {
        dispHr -= 24;
      }
      
      if(12 < dispHr && dispHr != 24) {
        ampm = 'pm';
        dispHr -= 12;
      }

      if(dispHr == 0 || dispHr == 24) {
        dispHr = 12;
      } else if (dispHr == 12) {
        ampm = 'pm';
      }

      diffHr = hr - startHr;
      diffMin = min - startMin;
      if(diffMin >= 60) {
        diffMin -= 60;
        diffHr += 1;
      } else if (diffMin < 0) {
        diffMin += 60;
        diffHr -= 1;
      }

      const stopOptVal = `${dispHr}:${(dispMin).toString().padStart(2, '0')} ${ampm} (${diffHr}.${diffMin / 60 * 10} hr)`;
      option.innerText = stopOptVal;
      stopTimeSettingModal.appendChild(option);
      option.addEventListener('click', () => {
        stopTimeDisp.innerText = `${dispHr}:${(dispMin).toString().padStart(2, '0')} ${ampm}`;
        //const data = option.getAttribute('data-value').split('.');
        let diffMin = origHr * 60 + origMin - selectedPlan.startHr * 60 - selectedPlan.startMin;
        selectedPlan.length = diffMin;
        selectedPlan.el.style.height = diffMin + 'px';
        dispTime(selectedPlan);
      })
    }
  }
}
const now = new Date();
updateEndTimeOptions(now.getHours(), Math.ceil(now.getMinutes() / 15) * 15);

let quill = new Quill('#editor', {
  theme: 'snow' // Specify theme in configuration
});

quill.on('text-change', function(delta, oldDelta, source) {
  selectedPlan.description = quill.root.innerHTML;
});

function handleClick(row) {
  row.classList.toggle("active");
}

const todoWrappers = document.querySelectorAll('.plan-card .row');
todoWrappers.forEach(todoWrapper => {
  todoWrapper.addEventListener('click', () => {
    todoWrapper.classList.toggle('active')
  })
})

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
  
                                <i onclick="showMenu(this)" class="fa-solid fa-ellipsis"></i>
                                <ul class="task-menu">
                                    <li onclick='editTask(${id}, "${todo.name}")'><i class="fa-solid fa-pen"></i>Edit</li>
                                    <li onclick='deleteTask(${id}, "${filter}")'><i class="fa-solid fa-trash"></i>Delete</li>
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

/* dailyPlanCalendar  = new Swiper('.swiper-container#daily-planner', {

}); */