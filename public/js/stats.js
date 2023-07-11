const todayTotalContainer = document.getElementById("today-total");
const thisWeekTotalContainer = document.getElementById("thisweek-total");
const thisMonthTotalContainer = document.getElementById("thismonth-total");
const dailyAvgContainer = document.getElementById("avg-daily");

let DoughnutChart;
let lineChart;
let calendarDate = new Date();
let subjects;
(async () => {
  let response = await fetch('/account/bring-my-info', {
    method: 'post',
  });

  response = await response.json();
  const userInfo = response.userInfo;
  let todayTotal = 0;
  let thisWeekTotal = 0;
  let thisMonthTotal = 0;
  let dailyAvg = 0;
  const now = new Date();
  const currentDay = now.getDay();
  if (response.success) {
    subjects = JSON.parse(userInfo.subjects);
    if (!subjects) {
      return 0
    }
    subjects.forEach((subject) => {
      const { name, total, datum_point, timeline, color } = subject;
      let today = filterTimeline(timeline, now.setHours(0, 0, 0, 0), now.setHours(23, 59, 59, 999), datum_point);
      let thisWeek = filterTimeline(timeline, new Date(now.getFullYear(), now.getMonth(), now.getDate() - currentDay + 1, 0, 0, 0), new Date(now.getFullYear(), now.getMonth(), now.getDate() + (7 - currentDay), 23, 59, 59), datum_point);
      let thisMonth = filterTimeline(timeline, new Date(now.getFullYear(), now.getMonth(), 1).getTime(), new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999).getTime(), datum_point);

      const date = new Date(datum_point * 1000);
      subject.daily = {};
      subject.daily.grouped = dailyTimelineSplit(timeline, datum_point);
      subject.daily.total = totalRangeTime(subject.daily.grouped);
      subject.monthly = {};
      subject.monthly.grouped = monthlyTimelineSplit(timeline, datum_point);
      subject.monthly.total = totalRangeTime(subject.monthly.grouped);
      subject.weekly = {};
      subject.weekly.grouped = weeklyTimelineSplit(timeline, datum_point);
      subject.weekly.total = totalRangeTime(subject.weekly.grouped);
      const dailyAvg = getAvg(timeline);
      subject.today = today[1];
      subject.todayTimeline = today[0];
      subject.thisWeek = thisWeek[1];
      subject.thisWeekTimeline = thisWeek[0];
      subject.thisMonth = thisMonth[1];
      subject.thisMonthTimeline = thisMonth[0];

      todayTotal += today[1];
      thisWeekTotal += thisWeek[1];
      thisMonthTotal += thisMonth[1];
    });
    subjects.daily = { maxlength: 0 };
    subjects.map(subject => {
      if (subject.daily.total.length > subjects.daily.maxlength) {
        subjects.daily.maxlength = subject.daily.total.length;
        subjects.daily.datum_point = subject.datum_point;
      }
    })
    todayTotalContainer.innerText = `${Math.floor(todayTotal / 60 / 60 * 10) / 10}hr`;
    thisWeekTotalContainer.innerText = `${Math.floor(thisWeekTotal / 60 / 60 * 10) / 10}hr`;
    thisMonthTotalContainer.innerText = `${Math.floor(thisMonthTotal / 60 / 60 * 10) / 10}hr`;
    dailyAvgContainer.innerText = `${Math.floor(todayTotal / 60 / 60 * 10) / 10}hr`;

    console.log(subjects)
    subjects.daily.groupedTotal = [];
    subjects.map((subject) => {
      let date = subject.daily.total;
      date = Array(subjects.daily.maxlength - date.length).fill(0).concat(date);
      date.map((el, j) => {
        subjects.daily.groupedTotal[j] = subjects.daily.groupedTotal[j] ? subjects.daily.groupedTotal[j] : 0;
        subjects.daily.groupedTotal[j] += el;
      })
    })

    var calendar = new FullCalendar.Calendar(document.getElementById("calendar"), {
      contentHeight: 'auto',
      initialView: "dayGridMonth",
      headerToolbar: {
        start: 'title', // will normally be on the left. if RTL, will be on the right
        center: '',
        end: 'today prev,next' // will normally be on the right. if RTL, will be on the left
      },
      selectable: true,
      editable: true,
      events: subjects.daily.groupedTotal.map((sec, i) => {
        const date = new Date((subjects.daily.datum_point + i * 60 * 60 * 24) * 1000);
        const year = date.getFullYear();
        const month = date.getMonth() + 1;
        const day = date.getDate();
        const startTime = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
        let hr = Math.floor(sec / 3600) % 60;
        let min = Math.floor(sec / 60) % 60;
        const disp = `${hr.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}`;
        const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        return { title: disp, start: startTime, end: startTime, classNames: ['calendar-time', `level-${hr}`], display: 'background',eventTimezone: userTimezone }
      }),
      views: {
        month: {
          titleFormat: {
            month: "long",
            year: "numeric"
          }
        },
        agendaWeek: {
          titleFormat: {
            month: "long",
            year: "numeric",
            day: "numeric"
          }
        },
        agendaDay: {
          titleFormat: {
            month: "short",
            year: "numeric",
            day: "numeric"
          }
        }
      },
      dateClick: function(info) {
        calendarDate = info.date;
        updateCharts();
      }
    });

    calendar.render();
  }


  //charts


  let ctx1 = document.getElementById("chart-line").getContext("2d");
  let ctx2 = document.getElementById("chart-doughnut").getContext("2d");

  let gradientStroke1 = ctx1.createLinearGradient(0, 230, 0, 50);

  gradientStroke1.addColorStop(1, 'rgba(203,12,159,0.2)');
  gradientStroke1.addColorStop(0.2, 'rgba(72,72,176,0.0)');
  gradientStroke1.addColorStop(0, 'rgba(203,12,159,0)'); //purple colors

  let gradientStroke2 = ctx1.createLinearGradient(0, 230, 0, 50);

  gradientStroke2.addColorStop(1, 'rgba(20,23,39,0.2)');
  gradientStroke2.addColorStop(0.2, 'rgba(72,72,176,0.0)');
  gradientStroke2.addColorStop(0, 'rgba(20,23,39,0)'); //purple colors

  // Line chart
  const lineGraphLabel = document.getElementById('line-graph-label');
  subjects.map((subject, i) => {
    const div = document.createElement('div');
    div.id = `sid-${subject.id}`;
    div.classList.add("linegraph-label");
    div.innerHTML = `
    <span class="badge badge-md badge-dot me-4">
    <i style = "background-color: ${subject.color}"></i>
    <span class="text-dark text-xs">${subject.name}</span>
    </span>
    `
    lineGraphLabel.appendChild(div);
    div.addEventListener('click', () => {
      if(lineChart.isDatasetVisible(i)){
        lineChart.hide(i);
        div.getElementsByClassName('text-dark')[0].innerHTML = `<del>${div.getElementsByClassName('text-dark')[0].innerText}</del>`
      } else {
        lineChart.show(i);
        div.getElementsByClassName('text-dark')[0].innerText = div.querySelector('.text-dark del').innerText;
      }
    })
  })
  lineChart = new Chart(ctx1, {
    type: "line",
    data: {
      labels: subjects.daily.groupedTotal.map((dailyTotal, i) => {
        const date = new Date(subjects.daily.datum_point * 1000 + i * 1000 * 60 * 60 * 24);
        return `${date.getMonth() + 1}/${date.getDate()}`
      }),
      datasets: subjects.map(subject => {
        const data = Array(subjects.daily.maxlength - subject.daily.total.length).fill(0).concat(subject.daily.total);
        return {label: subject.name, tension: 0.4, borderWidth: 0, pointRadius: 2, pointBackgroundColor: subject.color, borderColor: subject.color, borderWidth: 3, data: data, maxBarThickness: 6}
      }),
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false,
        }
      },
      interaction: {
        intersect: false,
        mode: 'index',
      },
      scales: {
        y: {
          grid: {
            drawBorder: false,
            display: true,
            drawOnChartArea: true,
            drawTicks: false,
            borderDash: [5, 5]
          },
          ticks: {
            display: true,
            padding: 10,
            color: '#9ca2b7'
          }
        },
        x: {
          grid: {
            drawBorder: false,
            display: true,
            drawOnChartArea: true,
            drawTicks: true,
            borderDash: [5, 5]
          },
          ticks: {
            display: true,
            color: '#9ca2b7',
            padding: 10
          }
        },
      },
    },
  });


  // Doughnut chart
  DoughnutChart = new Chart(ctx2, {
    type: "doughnut",
    data: {
      labels: subjects.map(subject => {return subject.name}),
      datasets: [{
        label: "Projects",
        weight: 9,
        cutout: 60,
        tension: 0.9,
        pointRadius: 2,
        borderWidth: 2,
        backgroundColor: subjects.map(subject => {return subject.color}),
        data: subjects.map(subject => {return subject.thisWeek}),
        fill: false
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false,
        }
      },
      interaction: {
        intersect: false,
        mode: 'index',
      },
      scales: {
        y: {
          grid: {
            drawBorder: false,
            display: false,
            drawOnChartArea: false,
            drawTicks: false,
          },
          ticks: {
            display: false
          }
        },
        x: {
          grid: {
            drawBorder: false,
            display: false,
            drawOnChartArea: false,
            drawTicks: false,
          },
          ticks: {
            display: false,
          }
        },
      },
    },
  });

  //heatmap
 
  

})();

function filterTimeline(timeline, startTime, endTime, datum_point) {
  const filteredTimeline = timeline.filter(period => {
    const [start, end] = period.map(time => 1000 * (time + datum_point));
    return start >= startTime && end <= endTime;
  });
  let time = 0;
  filteredTimeline.map(period => time += period[1] - period[0]);
  return [filteredTimeline, time]
}


function timelinesplit(timeline, length, datum_point, duration_point, type = '') {
  const splitTime = [];

  let currentGroup = [];
  let groupStart = null;
  let groupEnd = null;

  timeline.forEach(([start, stop]) => {
    const durationStart = new Date((duration_point + start) * 1000);
    const durationEnd = new Date((duration_point + stop) * 1000);
    if(type == 'month') {
      const selectedDate = new Date((datum_point + start) * 1000);
      const year = selectedDate.getFullYear();
      const month = selectedDate.getMonth();
      const nextMonth = month === 11 ? 0 : month + 1;
      length = (new Date(year, nextMonth, 0).getDate()) * 24 * 60 * 60 * 1000;
    }
    if (groupStart === null) {
      groupStart = new Date(datum_point * 1000).setHours(0, 0, 0, 0);
      groupEnd = new Date(groupStart + length);
    }

    if (durationStart >= groupStart && durationEnd <= groupEnd) {
      currentGroup.push([durationStart.getTime() / 1000, durationEnd.getTime() / 1000]);
    } else {
      splitTime.push(currentGroup);
      currentGroup = [[durationStart.getTime() / 1000, durationEnd.getTime() / 1000]];
      groupStart = new Date(Math.floor(durationStart.getTime() / length) * length);
      groupEnd = new Date(groupStart.getTime() + length);
    }
  });

  if (currentGroup.length > 0) {
    splitTime.push(currentGroup);
  }

  // Add empty groups until today
  const currentDate = new Date().setHours(0, 0, 0, 0);

  let zeroEnd = new Date(groupEnd).getTime();

  while (zeroEnd < currentDate) {
    splitTime.push([[0, 0]]);
    zeroEnd += length;
  }

  return splitTime;
}

function dailyTimelineSplit(timeline, datum_point) {
  let dayStart = new Date(datum_point * 1000).setHours(0, 0, 0, 0);
  let dayStop = new Date(datum_point * 1000).setHours(23, 59, 59, 999);
  let cut = false;
  const dailyTimeline = [[]];
  timeline.forEach(([start, stop]) => {
    const acStart = new Date((datum_point + start) * 1000).getTime();
    const acStop = new Date((datum_point + stop) * 1000).getTime();

    while(dayStart < new Date(acStart).setHours(0, 0, 0, 0) && cut) {
      dayStart += 1000 * 60 * 60 * 24;
      dayStop += 1000 * 60 * 60 * 24;
      dailyTimeline.push([[0, 0]]);
    }


    if(dayStart <= acStart && dayStop >= acStop) {
      dailyTimeline[dailyTimeline.length - 1].push([acStart / 1000, acStop / 1000]);
      cut = true;
    } else if(dayStop > acStart && dayStop < acStop) {
      dailyTimeline[dailyTimeline.length - 1].push([acStart / 1000, (dayStop + 1) / 1000]);
      dailyTimeline.push([])
      dailyTimeline[dailyTimeline.length - 1].push([(dayStop + 1) / 1000, acStop / 1000]);
      dayStart += 1000 * 60 * 60 * 24;
      dayStop += 1000 * 60 * 60 * 24;
      cut = true;
    } else {
      dailyTimeline.push([]);
      dailyTimeline[dailyTimeline.length - 1].push([acStart / 1000, acStop / 1000]);
      dayStart += 1000 * 60 * 60 * 24;
      dayStop += 1000 * 60 * 60 * 24;
      cut = true;
    }
  })

  const now = new Date().setHours(0, 0, 0, 0);
  while(dayStop <= now) {
    dailyTimeline.push([[0, 0]]);
    dayStop += 1000 * 60 * 60 * 24;
  }

  return dailyTimeline
}

function weeklyTimelineSplit(timeline, datum_point) {
  let date = new Date(datum_point * 1000);
  let weekStart = date.setHours(0, 0, 0, 0) - date.getDay() * 24 * 60 * 60 * 1000;
  let weekStop = date.setHours(23,59, 59, 999) + (6 - date.getDay()) * 24 * 60 * 60 * 1000 + 999;
  let cut = false;
  const weeklyTimeline = [[]];
  timeline.forEach(([start, stop]) => {
    const acStart = new Date((datum_point + start) * 1000).getTime();
    const acStop = new Date((datum_point + stop) * 1000).getTime();

    while(weekStart < new Date(acStart).setHours(0, 0, 0, 0) && cut) {
      weekStart += 1000 * 60 * 60 * 24 * 7;
      weekStop += 1000 * 60 * 60 * 24 * 7;
      weeklyTimeline.push([[0, 0]]);
    }


    if(weekStart <= acStart && weekStop >= acStop) {
      weeklyTimeline[weeklyTimeline.length - 1].push([acStart / 1000, acStop / 1000]);
      cut = true;
    } else if(weekStop > acStart && weekStop < acStop) {
      weeklyTimeline[weeklyTimeline.length - 1].push([acStart / 1000, (weekStop + 1) / 1000]);
      weeklyTimeline.push([])
      weeklyTimeline[weeklyTimeline.length - 1].push([(weekStop + 1) / 1000, acStop / 1000]);
      weekStart += 1000 * 60 * 60 * 24 * 7;
      weekStop += 1000 * 60 * 60 * 24 * 7;
      cut = true;
    } else {
      weeklyTimeline.push([]);
      weeklyTimeline[weeklyTimeline.length - 1].push([acStart / 1000, acStop / 1000]);
      weekStart += 1000 * 60 * 60 * 24 * 7;
      weekStop += 1000 * 60 * 60 * 24 * 7;
      cut = true;
    }
  })

  const now = new Date().setHours(0, 0, 0, 0) - new Date().getDay() * 24 * 60 * 60 * 1000;
  weekStop = Math.floor(weekStop / 1000) * 1000;
  while(weekStop <= now) {
    weeklyTimeline.push([[0, 0]]);
    weekStop += 1000 * 60 * 60 * 24 * 7;
  }

  return weeklyTimeline
}

function monthlyTimelineSplit(timeline, datum_point) {
  let date = new Date(datum_point * 1000);
  let startYear = date.getFullYear();
  let startMonth = date.getMonth();
  let [monthStart, monthStop] = [new Date(startYear, startMonth, 1).setHours(0, 0, 0, 0), new Date(startYear, startMonth + 1, 0).setHours(23, 59, 59, 999)];
  let cut = false;
  const monthlyTimeline = [[]];
  timeline.forEach(([start, stop]) => {
    const acStart = new Date((datum_point + start) * 1000).getTime();
    const acStop = new Date((datum_point + stop) * 1000).getTime();

    while(monthStart < new Date(acStart).setHours(0, 0, 0, 0) && cut) {
      startMonth += 1
      if(startMonth >= 11) {
        startMonth = 0;
        startYear += 1;
      }
      [monthStart, monthStop] = [new Date(startYear, startMonth, 1).setHours(0, 0, 0, 0), new Date(startYear, startMonth + 1, 0).setHours(23, 59, 59, 999)];
      monthlyTimeline.push([[0, 0]]);
    }


    if(monthStart <= acStart && monthStop >= acStop) {
      monthlyTimeline[monthlyTimeline.length - 1].push([acStart / 1000, acStop / 1000]);
      cut = true;
    } else if(monthStop > acStart && monthStop < acStop) {
      monthlyTimeline[monthlyTimeline.length - 1].push([acStart / 1000, (monthStop + 1) / 1000]);
      monthlyTimeline.push([])
      monthlyTimeline[monthlyTimeline.length - 1].push([(monthStop + 1) / 1000, acStop / 1000]);
      startMonth += 1;
      if(startMonth >= 11) {
        startMonth = 0;
        startYear += 1;
      }
      [monthStart, monthStop] = [new Date(startYear, startMonth, 1).setHours(0, 0, 0, 0), new Date(startYear, startMonth + 1, 0).setHours(23, 59, 59, 999)];
      cut = true;
    } else {
      monthlyTimeline.push([]);
      monthlyTimeline[monthlyTimeline.length - 1].push([acStart / 1000, acStop / 1000]);
      startMonth += 1;
      if(startMonth >= 11) {
        startMonth = 0;
        startYear += 1;
      }
      [monthStart, monthStop] = [new Date(startYear, startMonth, 1).setHours(0, 0, 0, 0), new Date(startYear, startMonth + 1, 0).setHours(23, 59, 59, 999)];
      cut = true;
    }
  })

  const now = new Date();
  const nowMonth = new Date(now.getFullYear(), now.getMonth(), 1).setHours(0, 0, 0, 0);
  monthStop = Math.floor(monthStop / 1000) * 1000;
  while(monthStop <= nowMonth) {
    monthlyTimeline.push([[0, 0]]);
    startMonth += 1;
    if(startMonth >= 11) {
      startMonth = 0;
      startYear += 1;
    }
    monthStop = new Date(startYear, startMonth + 1, 0).setHours(23, 59, 59, 999);
  }

  return monthlyTimeline
}


function totalRangeTime(timeline) {
  let times = [];
  timeline.map((date) => {
    let time = 0;
    date.map(([start, stop]) => {
      time += stop - start;
    })
    times.push(time);
  })
  return times
}


function getAvg(timeline, length) {
  let durration
  timeline.map(period => {
    const [start, end] = period;
  })
}

function updateCharts() {
  if(graphViewOpt == 'day') {
    DoughnutChart.data.datasets[0].data = subjects.map(subject => {
      const index = Math.floor((calendarDate.setHours(0, 0, 0, 0) / 1000 - subject.datum_point) / (60 * 60 * 24)) + 1;
      return subject.daily.total[index] ? subject.daily.total[index] : 0
    });
    const hourlyTimeline = subjects.map(subject => {
      const index = Math.floor((calendarDate.setHours(0, 0, 0, 0) / 1000 - subject.datum_point) / (60 * 60 * 24)) + 1;
      return subject.daily.grouped[index] ? subject.daily.grouped[index] : [[0, 0], [0, 0]]
    });

    const hourlyTimelineInfo = subjects.map(subject => {
      return [subject.name, subject.color]
    })
    updateHourlyMatrix(hourlyTimeline, hourlyTimelineInfo)
    DoughnutChart.update();
  } else if (graphViewOpt == 'week') {
    DoughnutChart.data.datasets[0].data = subjects.map(subject => {
      const calendarWeekStart = calendarDate - calendarDate.getDay() * 24 * 60 * 60 * 1000;
      const timelineStart = subject.weekly.grouped[0][0][0] ? new Date(subject.weekly.grouped[0][0][0] * 1000) : new Date(subject.datum_point * 1000);
      const timelineWeekStart = timelineStart.setHours(0, 0, 0, 0) - timelineStart.getDay() * 24 * 60 * 60 * 1000;
     const index = (calendarWeekStart - timelineWeekStart) / (1000 * 60 * 60 * 24 * 7)
      return subject.weekly.total[index] ? subject.weekly.total[index] : 0
    });
    DoughnutChart.update();
  } else {
    DoughnutChart.data.datasets[0].data = subjects.map(subject => {
      const calendarYear = calendarDate.getFullYear();
      const calendarMonth = calendarDate.getMonth();
      const timelineStart = subject.monthly.grouped[0][0][0] ? new Date(subject.monthly.grouped[0][0][0] * 1000) : new Date(subject.datum_point * 1000);
      const timelineYear = timelineStart.getFullYear();
      const timelineMonth = timelineStart.getMonth();
      const index = (calendarYear - timelineYear) * 12 + calendarMonth - timelineMonth;
      return subject.monthly.total[index] ? subject.monthly.total[index] : 0
    });
    DoughnutChart.update();
  }
  updateDoughnutPercentage();
}

const doughnutPercentageContainer = document.getElementById('doughnut-percentage');

function updateDoughnutPercentage() {
  doughnutPercentageContainer.innerHTML = ''
  let total = 0;
  DoughnutChart.data.datasets[0].data.map((subjectHr) => total += subjectHr);
  total = total ? total : 1;
  subjects.map((subject, i) => {
    const time = DoughnutChart.data.datasets[0].data[i]// ? DoughnutChart.data.datasets[0].data[i] : 0;
    const percentage = Math.floor(time / total * 100);
    doughnutPercentageContainer.innerHTML +=`
    <tr>
    <td>
      <div class="d-flex px-2 py-1">
        <div>
        </div>
          <div class="d-flex flex-column justify-content-center">
            <h6 class="mb-0 text-sm">${subject.name}</h6>
          </div>
        </div>
      </td>
      <td class="align-middle text-center text-sm">
        <span class="text-xs font-weight-bold"> ${percentage}% </span>
      </td>
    </tr>`
  })
}
const matrixChart = document.getElementById('matrix-chart');
const matrixActivities = document.getElementById("activities")
function updateHourlyMatrix(subjects, subjectInfo) {
  matrixActivities.innerHTML = ''
  subjects.map((subject, i) => {
    subject.map(([start, stop]) => {
      let startTimeHr = new Date(start * 1000).getHours();
      let startTimeMin = new Date(start * 1000).getMinutes();
      let stopTimeHr = new Date(stop * 1000).getHours();
      let stopTimeMin = new Date(stop * 1000).getMinutes();
      if(stopTimeMin - startTimeMin && (startTimeHr == stopTimeHr)) {
        const div1 = document.createElement('div');
        div1.style.top = 27 + startTimeHr * 30 + 'px';
        div1.style.left = 100 + (matrixChart.clientWidth - 100) / 60 * startTimeMin + 'px';
        div1.style.width = (matrixChart.clientWidth - 100) / 60 * (stopTimeMin - startTimeMin) + 'px';
        div1.style.backgroundColor = subjectInfo[i][1];
        div1.classList.add('activity');
        matrixActivities.appendChild(div1);
      } else if(stopTimeMin - startTimeMin){
        console.log(startTimeHr, startTimeMin, stopTimeHr, stopTimeMin)
        const div1 = document.createElement('div');
        div1.style.top = 27 + startTimeHr * 30 + 'px';
        div1.style.left = 100 + (matrixChart.clientWidth - 100) / 60 * startTimeMin + 'px';
        div1.style.width = (matrixChart.clientWidth - 100 - ((matrixChart.clientWidth - 100) / 60 * startTimeMin))+ 'px';
        div1.style.backgroundColor = subjectInfo[i][1];
        div1.classList.add('activity');
        matrixActivities.appendChild(div1);
        while(startTimeHr < stopTimeHr - 1) {
          startTimeHr ++;
          const divs = document.createElement('div');
          divs.style.top = 27 + startTimeHr * 30 + 'px';
          divs.style.left = matrixChart.clientWidth - 100 + 'px';
          divs.style.width = matrixChart.clientWidth - 100 + 'px';
          divs.style.backgroundColor = subjectInfo[i][1];
          divs.classList.add('activity');
          matrixActivities.appendChild(divs);
        }
        startTimeHr ++;
        const div2 = document.createElement('div');
        div2.style.top = 27 + startTimeHr * 30 + 'px';
        div2.style.left = 100 + 'px';
        div2.style.width = (matrixChart.clientWidth - 100) / 60 * stopTimeMin + 'px';
        div2.style.backgroundColor = subjectInfo[i][1];
        div2.classList.add('activity');
        matrixActivities.appendChild(div2);
      }
    })
  })
}

let graphViewOpt = 'day';
const graphViewOptContainer = document.getElementById('view-opt');
const graphViewOptDay = document.getElementById('view-opt-day');
const graphViewOptWeek = document.getElementById('view-opt-week');
const graphViewOptMonth = document.getElementById('view-opt-month');

graphViewOptDay.addEventListener('click', () => {
  graphViewOptContainer.innerText = 'DAY';
  graphViewOpt = 'day';
  updateCharts();
})

graphViewOptWeek.addEventListener('click', () => {
  graphViewOptContainer.innerText = 'WEEK';
  graphViewOpt = 'week';
  updateCharts();
})

graphViewOptMonth.addEventListener('click', () => {
  graphViewOptContainer.innerText = 'MONTH';
  graphViewOpt = 'month';
  updateCharts();
})
