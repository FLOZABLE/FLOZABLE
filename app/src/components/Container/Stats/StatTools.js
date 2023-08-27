import styles from './Stats.module.css';

const usersList = [];
const myRanking = {
  daily: [],
  weekly: [],
  monthly: []
};

const sortSubjects = (subjects) => {
  try {
    subjects = JSON.parse(subjects);
    const now = new Date();
    const currentDay = now.getDay();
    subjects.forEach((subject) => {
      const { name, total, datum_point, timeline, color } = subject;

      subject.daily = {};
      subject.daily.grouped = dailyTimelineSplit(timeline, datum_point);
      subject.daily.total = totalRangeTime(subject.daily.grouped);
      subject.monthly = {};
      subject.monthly.grouped = monthlyTimelineSplit(timeline, datum_point);
      subject.monthly.total = totalRangeTime(subject.monthly.grouped);
      subject.weekly = {};
      subject.weekly.grouped = weeklyTimelineSplit(timeline, datum_point);
      subject.weekly.total = totalRangeTime(subject.weekly.grouped);
    });
    subjects.daily = { maxlength: 0 };
    subjects.map(subject => {
      if (subject.daily.total.length > subjects.daily.maxlength) {
        subjects.daily.maxlength = subject.daily.total.length;
        subjects.daily.datum_point = subject.datum_point;
      }
    })

    subjects.daily.groupedTotal = [];
    subjects.map((subject) => {
      let date = subject.daily.total;
      date = Array(subjects.daily.maxlength - date.length).fill(0).concat(date);
      date.map((el, j) => {
        subjects.daily.groupedTotal[j] = subjects.daily.groupedTotal[j] ? subjects.daily.groupedTotal[j] : 0;
        subjects.daily.groupedTotal[j] += el;
      })
    })

    subjects.weekly = { maxlength: 0 };
    subjects.map(subject => {
      if (subject.weekly.total.length > subjects.weekly.maxlength) {
        subjects.weekly.maxlength = subject.weekly.total.length;
        subjects.weekly.datum_point = subject.datum_point;
      }
    })

    subjects.weekly.groupedTotal = [];
    subjects.map((subject) => {
      let date = subject.weekly.total;
      date = Array(subjects.weekly.maxlength - date.length).fill(0).concat(date);
      date.map((el, j) => {
        subjects.weekly.groupedTotal[j] = subjects.weekly.groupedTotal[j] ? subjects.weekly.groupedTotal[j] : 0;
        subjects.weekly.groupedTotal[j] += el;
      })
    })


    subjects.monthly = { maxlength: 0 };
    subjects.map(subject => {
      if (subject.monthly.total.length > subjects.monthly.maxlength) {
        subjects.monthly.maxlength = subject.monthly.total.length;
        subjects.monthly.datum_point = subject.datum_point;
      }
    })

    subjects.monthly.groupedTotal = [];
    subjects.map((subject) => {
      let date = subject.monthly.total;
      date = Array(subjects.monthly.maxlength - date.length).fill(0).concat(date);
      date.map((el, j) => {
        subjects.monthly.groupedTotal[j] = subjects.monthly.groupedTotal[j] ? subjects.monthly.groupedTotal[j] : 0;
        subjects.monthly.groupedTotal[j] += el;
      })
    })
  } catch (error) {
    console.error(error);
  };

  return subjects;
};


function dailyTimelineSplit(timeline, datum_point) {
  let dayStart = new Date(datum_point * 1000).setHours(0, 0, 0, 0);
  let dayStop = new Date(datum_point * 1000).setHours(23, 59, 59, 999);
  let cut = false;
  const dailyTimeline = [[]];
  timeline.forEach(([start, stop]) => {
    const acStart = new Date((datum_point + start) * 1000).getTime();
    const acStop = new Date((datum_point + stop) * 1000).getTime();

    while (dayStart < new Date(acStart).setHours(0, 0, 0, 0) && cut) {
      dayStart += 1000 * 60 * 60 * 24;
      dayStop += 1000 * 60 * 60 * 24;
      dailyTimeline.push([[0, 0]]);
    }


    if (dayStart <= acStart && dayStop >= acStop) {
      dailyTimeline[dailyTimeline.length - 1].push([acStart / 1000, acStop / 1000]);
      cut = true;
    } else if (dayStop > acStart && dayStop < acStop) {
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
  while (dayStop <= now) {
    dailyTimeline.push([[0, 0]]);
    dayStop += 1000 * 60 * 60 * 24;
  }

  return dailyTimeline
}

function weeklyTimelineSplit(timeline, datum_point) {
  let date = new Date(datum_point * 1000);
  let weekStart = date.setHours(0, 0, 0, 0) - date.getDay() * 24 * 60 * 60 * 1000;
  let weekStop = date.setHours(23, 59, 59, 999) + (6 - date.getDay()) * 24 * 60 * 60 * 1000 + 999;
  let cut = false;
  const weeklyTimeline = [[]];
  timeline.forEach(([start, stop]) => {
    const acStart = new Date((datum_point + start) * 1000).getTime();
    const acStop = new Date((datum_point + stop) * 1000).getTime();

    while (weekStart < new Date(acStart).setHours(0, 0, 0, 0) && cut) {
      weekStart += 1000 * 60 * 60 * 24 * 7;
      weekStop += 1000 * 60 * 60 * 24 * 7;
      weeklyTimeline.push([[0, 0]]);
    }


    if (weekStart <= acStart && weekStop >= acStop) {
      weeklyTimeline[weeklyTimeline.length - 1].push([acStart / 1000, acStop / 1000]);
      cut = false;
    } else if (weekStop > acStart && weekStop < acStop) {
      weeklyTimeline[weeklyTimeline.length - 1].push([acStart / 1000, (weekStop + 1) / 1000]);
      weeklyTimeline.push([])
      weeklyTimeline[weeklyTimeline.length - 1].push([(weekStop + 1) / 1000, acStop / 1000]);
      weekStart += 1000 * 60 * 60 * 24 * 7;
      weekStop += 1000 * 60 * 60 * 24 * 7;
      cut = false;
    } else {
      weeklyTimeline.push([]);
      weeklyTimeline[weeklyTimeline.length - 1].push([acStart / 1000, acStop / 1000]);
      weekStart += 1000 * 60 * 60 * 24 * 7;
      weekStop += 1000 * 60 * 60 * 24 * 7;
      cut = false;
    }
  })

  const now = new Date().setHours(0, 0, 0, 0) - new Date().getDay() * 24 * 60 * 60 * 1000;
  weekStop = Math.floor(weekStop / 1000) * 1000;
  while (weekStop <= now) {
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

    while (monthStart < new Date(acStart).setHours(0, 0, 0, 0) && cut) {
      startMonth += 1
      if (startMonth >= 11) {
        startMonth = 0;
        startYear += 1;
      }
      [monthStart, monthStop] = [new Date(startYear, startMonth, 1).setHours(0, 0, 0, 0), new Date(startYear, startMonth + 1, 0).setHours(23, 59, 59, 999)];
      monthlyTimeline.push([[0, 0]]);
    }


    if (monthStart <= acStart && monthStop >= acStop) {
      monthlyTimeline[monthlyTimeline.length - 1].push([acStart / 1000, acStop / 1000]);
      cut = false;
    } else if (monthStop > acStart && monthStop < acStop) {
      monthlyTimeline[monthlyTimeline.length - 1].push([acStart / 1000, (monthStop + 1) / 1000]);
      monthlyTimeline.push([])
      monthlyTimeline[monthlyTimeline.length - 1].push([(monthStop + 1) / 1000, acStop / 1000]);
      startMonth += 1;
      if (startMonth >= 11) {
        startMonth = 0;
        startYear += 1;
      }
      [monthStart, monthStop] = [new Date(startYear, startMonth, 1).setHours(0, 0, 0, 0), new Date(startYear, startMonth + 1, 0).setHours(23, 59, 59, 999)];
      cut = false;
    } else {
      monthlyTimeline.push([]);
      monthlyTimeline[monthlyTimeline.length - 1].push([acStart / 1000, acStop / 1000]);
      startMonth += 1;
      if (startMonth >= 11) {
        startMonth = 0;
        startYear += 1;
      }
      [monthStart, monthStop] = [new Date(startYear, startMonth, 1).setHours(0, 0, 0, 0), new Date(startYear, startMonth + 1, 0).setHours(23, 59, 59, 999)];
      cut = false;
    }
  })

  const now = new Date();
  const nowMonth = new Date(now.getFullYear(), now.getMonth(), 1).setHours(0, 0, 0, 0);
  monthStop = Math.floor(monthStop / 1000) * 1000;
  while (monthStop <= nowMonth) {
    monthlyTimeline.push([[0, 0]]);
    startMonth += 1;
    if (startMonth >= 11) {
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
};


//time usage pie
function getTimeUsagePieData(subjects, viewDate, type) {
  let data = [];
  const labels = subjects.map(subject => {
    const index = Math.floor((viewDate.getTime() / 1000 - subject.datum_point) / (60 * 60 * 24)) + 1;
    return subject.daily.total[index] ? subject.daily.total[index] : 0;
  });

  if (type === 'Daily') {
    data = subjects.map(subject => {
      const index = Math.floor((viewDate / 1000 - subject.datum_point) / (60 * 60 * 24)) + 1;
      return subject.daily.total[index] ? subject.daily.total[index] : 0
    });
  } else if (type === 'Weekly') {
    data = subjects.map(subject => {
      const calendarWeekStart = viewDate - viewDate.getDay() * 24 * 60 * 60 * 1000;
      const timelineStart = subject.weekly.grouped[0][0][0] ? new Date(subject.weekly.grouped[0][0][0] * 1000) : new Date(subject.datum_point * 1000);
      const timelineWeekStart = timelineStart.setHours(0, 0, 0, 0) - timelineStart.getDay() * 24 * 60 * 60 * 1000;
      const index = (calendarWeekStart - timelineWeekStart) / (1000 * 60 * 60 * 24 * 7)
      return subject.weekly.total[index] ? subject.weekly.total[index] : 0
    });
  } else {
    data = subjects.map(subject => {
      const calendarYear = viewDate.getFullYear();
      const calendarMonth = viewDate.getMonth();
      const timelineStart = subject.monthly.grouped[0][0][0] ? new Date(subject.monthly.grouped[0][0][0] * 1000) : new Date(subject.datum_point * 1000);
      const timelineYear = timelineStart.getFullYear();
      const timelineMonth = timelineStart.getMonth();
      const index = (calendarYear - timelineYear) * 12 + calendarMonth - timelineMonth;
      return subject.monthly.total[index] ? subject.monthly.total[index] : 0
    });
  };

  return ({ labels: labels, data: data });
};

function updateHourlyMatrix(subjects, matrixChartWidth, viewDate) {
  const matrixChart = [];
  subjects.map((subject) => {
    console.log('subfdfdf', subject);
    const datumPoint = new Date(subject.datum_point * 1000).setHours(0, 0, 0, 0);

    if (subject.daily) {
      subject.daily.grouped.map(day => {
        day.map(([start, stop], i) => {
          console.log(new Date(datumPoint + 1000 * 60 * 60 * 24 * i) == viewDate.getTime())
          if (new Date(datumPoint + 1000 * 60 * 60 * 24 * i) == viewDate.getTime()) {
            let startTimeHr = new Date(start * 1000).getHours();
          let startTimeMin = new Date(start * 1000).getMinutes();
          let stopTimeHr = new Date(stop * 1000).getHours();
          let stopTimeMin = new Date(stop * 1000).getMinutes();
          if (stopTimeMin - startTimeMin && (startTimeHr == stopTimeHr)) {
    /*         const div1 = document.createElement('div');
            div1.style.top = 27 + startTimeHr * 30 + 'px';
            div1.style.left = 100 + (matrixChartWidth - 100) / 60 * startTimeMin + 'px';
            div1.style.width = (matrixChartWidth - 100) / 60 * (stopTimeMin - startTimeMin) + 'px';
            div1.style.backgroundColor = subjectInfo[i][1];
            div1.classList.add('activity'); */
            matrixChart.push(
              <div className={styles.activity} style={{top: 27 + startTimeHr * 30 + 'px', left: 100 + (matrixChartWidth - 100) / 60 * startTimeMin + 'px', width: (matrixChartWidth - 100) / 60 * (stopTimeMin - startTimeMin) + 'px',backgroundColor: 'red'}}>
              </div>
            );
          } else if (stopTimeMin - startTimeMin) {
            /* const div1 = document.createElement('div');
            div1.style.top = 27 + startTimeHr * 30 + 'px';
            div1.style.left = 100 + (matrixChartWidth - 100) / 60 * startTimeMin + 'px';
            div1.style.width = (matrixChartWidth - 100 - ((matrixChartWidth - 100) / 60 * startTimeMin)) + 'px';
            div1.style.backgroundColor = subjectInfo[i][1];
            div1.classList.add('activity');
            matrixChart.appendChild(div1); */
            matrixChart.push(
              <div className={styles.activity} style={{top: 27 + startTimeHr * 30 + 'px', left: 100 + (matrixChartWidth - 100) / 60 * startTimeMin + 'px', width: (matrixChartWidth - 100) / 60 * (stopTimeMin - startTimeMin) + 'px',backgroundColor: 'red'}}>
              </div>
            );
            while (startTimeHr < stopTimeHr - 1) {
              startTimeHr++;
              /* const divs = document.createElement('div');
              divs.style.top = 27 + startTimeHr * 30 + 'px';
              divs.style.left = '100px';
              divs.style.width = matrixChartWidth - 100 + 'px';
              divs.style.backgroundColor = subjectInfo[i][1];
              divs.classList.add('activity');
              matrixChart.appendChild(divs); */
              matrixChart.push(
                <div className={styles.activity} style={{top: 27 + startTimeHr * 30 + 'px', left: 100 + (matrixChartWidth - 100) / 60 * startTimeMin + 'px', width: (matrixChartWidth - 100) / 60 * (stopTimeMin - startTimeMin) + 'px',backgroundColor: 'red'}}>
                </div>
              );
            }
            /* startTimeHr++;
            const div2 = document.createElement('div');
            div2.style.top = 27 + startTimeHr * 30 + 'px';
            div2.style.left = 100 + 'px';
            div2.style.width = (matrixChartWidth - 100) / 60 * stopTimeMin + 'px';
            div2.style.backgroundColor = subjectInfo[i][1];
            div2.classList.add('activity');
            matrixChart.appendChild(div2); */
            matrixChart.push(
              <div className={styles.activity} style={{top: 27 + startTimeHr * 30 + 'px', left: 100 + (matrixChartWidth - 100) / 60 * startTimeMin + 'px', width: (matrixChartWidth - 100) / 60 * (stopTimeMin - startTimeMin) + 'px',backgroundColor: 'red'}}>
              </div>
            );
          }
          }
        })
      })
    }
    
  })
};

export { sortSubjects, getTimeUsagePieData,updateHourlyMatrix };