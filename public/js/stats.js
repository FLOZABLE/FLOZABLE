const todayTotalContainer = document.getElementById("today-total");
const thisWeekTotalContainer = document.getElementById("thisweek-total");
const thisMonthTotalContainer = document.getElementById("thismonth-total");
const dailyAvgContainer = document.getElementById("avg-daily");

//charts

let rankingChart;
let subjectDoughnutChart;
let timelineHistogramChart;
let subjectLineChart;
let compareChart;
let webUsageChart;
let appUsageChart;

let rankingChartContainer = document.getElementById('rankingChart');
let subjectDoughnutChartContainer = document.getElementById('subjectDoughnutChart');
let timelineHistogramChartContainer = document.getElementById('timelineHistogramChart');
let subjectLineChartContainer = document.getElementById('subjectLinceChart');
let compareChartContainer = document.getElementById('rankingChart');
let webUsageChartContainer = document.getElementById('webUsageChart');
let appUsageChartContainer = document.getElementById('rankingChart');

colorsList = ["#fd7f6f", "#7eb0d5", "#b2e061", "#bd7ebe", "#ffb55a", "#ffee65", "#beb9db", "#fdcce5", "#8bd3c7", "#e60049", "#0bb4ff", "#50e991", "#e6d800", "#9b19f5", "#ffa300", "#dc0ab4", "#b3d4ff", "#00bfa0"];

rankingChart = new Chart(rankingChartContainer, {
  type: "line",
  data: {
    labels: [],
    datasets: []
  },
  options: {
    responsive: true,
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
        reverse: true,
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
          color: '#9ca2b7',
          stepSize: 1
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
  }
});

subjectLineChart = new Chart(subjectLineChartContainer, {
  type: "line",
  data: {
    labels: [],
    datasets: [],
  },
  options: {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
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

subjectDoughnutChart = new Chart(subjectDoughnutChartContainer, {
  type: "doughnut",
  data: {
    labels: [],
    datasets: [{
      label: "Projects",
      weight: 9,
      cutout: 60,
      tension: 0.9,
      pointRadius: 2,
      borderWidth: 2,
      backgroundColor: colorsList,
      data: [],
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

timelineHistogramChart = new Chart(timelineHistogramChartContainer, {
  type: 'bar',
  data: {
    labels: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23],
    datasets: [
      {
        data: [],
        backgroundColor: colorsList
      }
    ]
  },
  options: {
    plugins: {
      legend: {
        display: false
      }
    },
    scales: {
      y: {
        beginAtZero: true
      },
      x: {
        grid: {
          display: false
        }
      }
    }
  }
})

webUsageChart = new Chart(webUsageChartContainer, {
  type: "doughnut",
  data: {
    labels: [],
    datasets: [{
      label: "Projects",
      backgroundColor: colorsList,
      data: [],
      fill: false
    }],
  },
  options: {
    responsive: true,

  },
});

let calendarDate = new Date(new Date().setHours(0, 0, 0, 0));

let subjects;
let activities;
let myInfo;
let ranking;
const usersList = [];
const myRanking = {
  daily: [],
  weekly: [],
  monthly: []
};

const activitiesWrapper = document.getElementById('activities-wrapper');

(async () => {
  myInfo = await fetch('/account/bring-my-info', {
    method: 'post',
  });

  ranking = await fetch('/ranking', {
    method: 'post',
  });

  activities = await fetch('/api/bring-activities', {
    method: 'post'
  });

  myInfo = await myInfo.json();
  ranking = await ranking.json();
  activities = await activities.json();

  //organize data

  let userId;
  let userInfo;
  if (myInfo.success) {
    userInfo = myInfo.userInfo;
    userId = userInfo.user_id;
    subjects = JSON.parse(userInfo.subjects);
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

    console.log(subjects)

    //add labels for doughtnut
    subjectDoughnutChart.data.labels = subjects.map(subject => {
      return subject.name
    })

    //color sync
    /* subjectDoughnutChart.data.datasets[0].backgroundColor = subjects.map(subject => {
      return subject.color
    }) */

    subjectDoughnutChart.data.datasets[0].backgroundColor = colorsList;
  }

  if (ranking.success) {
    const dailyRanking = ranking.dailyRanking;
    const weeklyRanking = ranking.weeklyRanking;
    const monthlyRanking = ranking.monthlyRanking;

    dailyRanking.map(dayRanking => {
      dayRanking.map((user, rank) => {
        if (user.user_id == userId) {
          myRanking.daily.push(rank + 1);
        }
      })
    })

    weeklyRanking.map(weekRanking => {
      weekRanking.map((user, rank) => {
        if (user.user_id == userId) {
          myRanking.weekly.push(rank + 1);
        }
      })
    })

    monthlyRanking.map(monthRanking => {
      monthRanking.map((user, rank) => {
        if (user.user_id == userId) {
          myRanking.monthly.push(rank + 1);
        }
      })
    })

    myRanking.daily.reverse();
    myRanking.weekly.reverse();
    myRanking.monthly.reverse();
  }

  const calendar = new FullCalendar.Calendar(document.getElementById("calendar"), {
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
      return { title: disp, start: startTime, end: startTime, classNames: ['calendar-time', `level-${hr}`], display: 'background', eventTimezone: userTimezone }
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
    dateClick: function (info) {
      calendarDate = new Date(info.date);
      updateCharts();
    }
  });

  calendar.render();

  updateCharts();
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
    if (type == 'month') {
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
}


function getAvg(timeline, length) {
  let durration
  timeline.map(period => {
    const [start, end] = period;
  })
}

const todayTime = new Date().setHours(0, 0, 0, 0);

const rankingType = document.getElementById('ranking-type');
//const ranking = document.getElementById('ranking');
const rankingDiff = document.getElementById('ranking-diff');

function updateCharts() {
  if (graphViewOpt == 'day') {

    updateRankingChart(myRanking.daily, (() => {
      return myRanking.daily.map((day, index) => {
        const date = new Date(todayTime - (myRanking.daily.length - index - 1) * 1000 * 60 * 60 * 24);
        return `${date.getMonth() + 1}/${date.getDate()}`
      })
    }), 'Daily Ranking');

    updateSubjectLineChart(() => {
      return subjects.map((subject, index) => {
        const data = Array(subjects.daily.maxlength - subject.daily.total.length).fill(0).concat(subject.daily.total);
        //sync bg
        //return { label: subject.name, tension: 0.4, borderWidth: 0, pointRadius: 2, pointBackgroundColor: subject.color, borderColor: subject.color, borderWidth: 3, data: data, maxBarThickness: 6 }
        //orig bg
        return { label: subject.name, tension: 0.4, borderWidth: 0, pointRadius: 2, pointBackgroundColor: colorsList[index], borderColor: colorsList[index], backgroundColor: colorsList[index], borderWidth: 3, data: data, maxBarThickness: 6 }
      })
    }, () => {
      return subjects.daily.groupedTotal.map((dailyTotal, i) => {
        const date = new Date(subjects.daily.datum_point * 1000 + i * 1000 * 60 * 60 * 24);
        return `${date.getMonth() + 1}/${date.getDate()}`
      })
    })

    //update doughnut chart
    subjectDoughnutChart.data.datasets[0].labels = subjects.map(subject => {
      const index = Math.floor((calendarDate / 1000 - subject.datum_point) / (60 * 60 * 24)) + 1;
      return subject.daily.total[index] ? subject.daily.total[index] : 0
    });

    subjectDoughnutChart.data.datasets[0].data = subjects.map(subject => {
      const index = Math.floor((calendarDate / 1000 - subject.datum_point) / (60 * 60 * 24)) + 1;
      return subject.daily.total[index] ? subject.daily.total[index] : 0
    });

    const hourlyTimeline = subjects.map(subject => {
      const index = Math.floor((calendarDate / 1000 - subject.datum_point) / (60 * 60 * 24)) + 1;
      return subject.daily.grouped[index] ? subject.daily.grouped[index] : [[0, 0], [0, 0]]
    });

    const hourlyTimelineInfo = subjects.map(subject => {
      return [subject.name, subject.color]
    })
    subjectDoughnutChart.update();

    //timeline
    updateHourlyMatrix(hourlyTimeline, hourlyTimelineInfo);

    //timelineHistogramChart
    updateHistogram(hourlyTimeline)

    //manage activity
    updateWebUsageChart();
    /* 
    labels: Object.keys(activities.data[calendarDate / 1000]),
    datasets: [{
      label: "Projects",
      backgroundColor: colorsList,
      data: Object.values(activities.data[calendarDate / 1000]).map(web => {
        return web.totalTime
      }),
      fill: false
    }],
    */
    

  } else if (graphViewOpt == 'week') {
    updateRankingChart(myRanking.weekly, (() => {
      return myRanking.weekly.map((day, index) => {
        const date = new Date(todayTime - (myRanking.weekly.length - index - 1) * 1000 * 60 * 60 * 24 * 7);
        return `${date.getMonth() + 1}/${date.getDate()}`
      })
    }), 'Weekly Ranking');


    updateSubjectLineChart(() => {
      return subjects.map(subject => {
        const data = Array(subjects.weekly.maxlength - subject.weekly.total.length).fill(0).concat(subject.weekly.total);
        return { label: subject.name, tension: 0.4, borderWidth: 0, pointRadius: 2, pointBackgroundColor: colorsList[index], borderColor: colorsList[index], backgroundColor: colorsList[index], borderWidth: 3, data: data, maxBarThickness: 6 }
      })
    }, () => {
      return subjects.weekly.groupedTotal.map((weeklyTotal, i) => {
        const date = new Date(subjects.weekly.datum_point * 1000 + i * 1000 * 60 * 60 * 24 * 7);
        return `${date.getMonth() + 1}/${date.getDate()}`
      })
    })
    //update doughnut chart
    subjectDoughnutChart.data.datasets[0].data = subjects.map(subject => {
      const calendarWeekStart = calendarDate - calendarDate.getDay() * 24 * 60 * 60 * 1000;
      const timelineStart = subject.weekly.grouped[0][0][0] ? new Date(subject.weekly.grouped[0][0][0] * 1000) : new Date(subject.datum_point * 1000);
      const timelineWeekStart = timelineStart.setHours(0, 0, 0, 0) - timelineStart.getDay() * 24 * 60 * 60 * 1000;
      const index = (calendarWeekStart - timelineWeekStart) / (1000 * 60 * 60 * 24 * 7)
      return subject.weekly.total[index] ? subject.weekly.total[index] : 0
    });
    subjectDoughnutChart.update();

  } else {
    //ranking chart

    updateRankingChart(myRanking.monthly, (() => {
      return myRanking.monthly.map((month, index) => {
        const date = new Date(todayTime - (Math.round(myRanking.monthly.length - index - 1) * 1000 * 60 * 60 * 24 * 30.4375));
        return `${date.getMonth() + 1}`
      })
    }), 'Monthly Ranking', 'than last month');


    updateSubjectLineChart(() => {
      return subjects.map(subject => {
        const data = Array(subjects.monthly.maxlength - subject.monthly.total.length).fill(0).concat(subject.monthly.total);
        return { label: subject.name, tension: 0.4, borderWidth: 0, pointRadius: 2, pointBackgroundColor: colorsList[index], borderColor: colorsList[index], backgroundColor: colorsList[index], borderWidth: 3, data: data, maxBarThickness: 6 }
      })
    }, () => {
      return subjects.monthly.groupedTotal.map((monthlyTotal, i) => {
        const month = new Date(subjects.monthly.datum_point * 1000).getMonth() + 1 + i;
        return `${month}`
      })
    })
    //doughnut chart
    subjectDoughnutChart.data.datasets[0].data = subjects.map(subject => {
      const calendarYear = calendarDate.getFullYear();
      const calendarMonth = calendarDate.getMonth();
      const timelineStart = subject.monthly.grouped[0][0][0] ? new Date(subject.monthly.grouped[0][0][0] * 1000) : new Date(subject.datum_point * 1000);
      const timelineYear = timelineStart.getFullYear();
      const timelineMonth = timelineStart.getMonth();
      const index = (calendarYear - timelineYear) * 12 + calendarMonth - timelineMonth;
      return subject.monthly.total[index] ? subject.monthly.total[index] : 0
    });
    subjectDoughnutChart.update();


    rankingType.innerText = 'Monthly Ranking';
    ranking.innerText = `#${myRanking.monthly[myRanking.monthly.length - 1]}`;
    if (myRanking.monthly.length > 1) {
      const thisMonthRanking = myRanking.monthly[myRanking.monthly.length - 1];
      const lastMonthRanking = myRanking.monthly[myRanking.monthly.length - 2];
      if (thisMonthRanking < lastMonthRanking) {
        rankingDiff.innerHTML = `
        <span class="text-success text-sm font-weight-bolder">${thisMonthRanking - lastMonthRanking} </span>than last month
        `
      } else if (thisMonthRanking > lastMonthRanking) {
        rankingDiff.innerHTML = `
        <span class="text-danger text-sm font-weight-bolder">+${thisMonthRanking - lastMonthRanking} </span>than last month
        `
      }
    } else {
      rankingDiff.innerHTML = ``
    }

  }
  updateDoughnutPercentage();
}

function updateRankingChart(data, labels, rankingText = 'Daily Ranking', compareText = 'than yesterday') {
  rankingChart.data.labels = labels();
  rankingChart.data.datasets = [{tension: 0.4, borderWidth: 0, pointRadius: 2, pointBackgroundColor: '#fd7f6f', borderColor: '#fd7f6f', borderWidth: 3, data: data, maxBarThickness: 6}];
  rankingChart.update();

  rankingType.innerText = rankingText;
  if (data.length > 1) {
    const currentRanking = data[data.length - 1];
    const prevRanking = data[data.length - 2];
    if (currentRanking < prevRanking) {
      rankingDiff.innerHTML = `
      <span class="text-success text-sm font-weight-bolder">${currentRanking - prevRanking} </span>${compareText}
      `
    } else if (currentRanking > prevRanking) {
      rankingDiff.innerHTML = `
      <span class="text-danger text-sm font-weight-bolder">+${currentRanking - prevRanking} </span>than ${compareText}
      `
    } else {
      rankingDiff.innerHTML = '';
    }
  } else {
    rankingDiff.innerHTML = ``
  }
}

function updateSubjectLineChart(data, labels) {
  subjectLineChart.data.datasets = data();
  subjectLineChart.data.labels = labels();
  subjectLineChart.update();
}

const doughnutPercentageContainer = document.getElementById('doughnut-percentage');
const doughnutChartBlocker = document.getElementById('sbj-doughnut-blocker');

function updateDoughnutPercentage() {
  doughnutPercentageContainer.innerHTML = ''
  let total = 0;
  subjectDoughnutChart.data.datasets[0].data.map((subjectHr) => total += subjectHr);
  if (!total) {
    doughnutChartBlocker.classList.remove('hidden');
    return 0;
  } else {
    doughnutChartBlocker.classList.add('hidden')
  }
  total = total ? total : 1;
  subjects.map((subject, i) => {
    const time = subjectDoughnutChart.data.datasets[0].data[i]// ? subjectDoughnutChart.data.datasets[0].data[i] : 0;
    const percentage = Math.floor(time / total * 100);
    doughnutPercentageContainer.innerHTML += `
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
      if (stopTimeMin - startTimeMin && (startTimeHr == stopTimeHr)) {
        const div1 = document.createElement('div');
        div1.style.top = 27 + startTimeHr * 30 + 'px';
        div1.style.left = 100 + (matrixChart.clientWidth - 100) / 60 * startTimeMin + 'px';
        div1.style.width = (matrixChart.clientWidth - 100) / 60 * (stopTimeMin - startTimeMin) + 'px';
        div1.style.backgroundColor = subjectInfo[i][1];
        div1.classList.add('activity');
        matrixActivities.appendChild(div1);
      } else if (stopTimeMin - startTimeMin) {
        const div1 = document.createElement('div');
        div1.style.top = 27 + startTimeHr * 30 + 'px';
        div1.style.left = 100 + (matrixChart.clientWidth - 100) / 60 * startTimeMin + 'px';
        div1.style.width = (matrixChart.clientWidth - 100 - ((matrixChart.clientWidth - 100) / 60 * startTimeMin)) + 'px';
        div1.style.backgroundColor = subjectInfo[i][1];
        div1.classList.add('activity');
        matrixActivities.appendChild(div1);
        while (startTimeHr < stopTimeHr - 1) {
          startTimeHr++;
          const divs = document.createElement('div');
          divs.style.top = 27 + startTimeHr * 30 + 'px';
          divs.style.left = '100px';
          divs.style.width = matrixChart.clientWidth - 100 + 'px';
          divs.style.backgroundColor = subjectInfo[i][1];
          divs.classList.add('activity');
          matrixActivities.appendChild(divs);
        }
        startTimeHr++;
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

function updateHistogram(subjects) {
  const histogramData = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,];

  subjects.map(subject => {
    subject.map(([start, stop]) => {
      let startTime = new Date(start * 1000);
      let startTimeHr = startTime.getHours();
      let startTimeMin = startTime.getMinutes();
      let stopTime = new Date(stop * 1000);
      let stopTimeHr = stopTime.getHours();
      let stopTimeMin = stopTime.getMinutes();

      if (startTimeHr == stopTimeHr) {
        histogramData[startTimeHr] += stop - start
      } else {
        const hourEndMin = new Date(start * 1000).setHours(startTimeHr, 59, 59, 0);
        histogramData[startTimeHr] += hourEndMin / 1000 - start;
        while (startTimeHr < stopTimeHr - 1) {
          startTimeHr++;
          histogramData[startTimeHr] += 60 * 60;
        }
        startTimeHr++;
        const hourStartMin = new Date(start * 1000).setHours(startTimeHr, 0, 0, 0);
        histogramData[startTimeHr] += stop - hourStartMin / 1000
      }
    })
  })
  timelineHistogramChart.data.datasets[0].data = histogramData;
  timelineHistogramChart.update();
}

function updateWebUsageChart() {
  const selectedActivity = activities.data[calendarDate / 1000];
  if (selectedActivity) {
    const webTitles = Object.keys(selectedActivity);
    const webs = Object.values(selectedActivity);
    webUsageChart.data.labels = webTitles;
    webUsageChart.data.datasets[0].data = webs.map((web, index) => {
      const activityWrapper = document.createElement('li');
      activityWrapper.classList.add('list-group-item');
      activityWrapper.classList.add('border-0');
      activityWrapper.classList.add('d-flex');
      activityWrapper.classList.add('align-items-center');
      activityWrapper.classList.add('px-0');
      activityWrapper.classList.add('mb-2');

      let activityTimeDisp = '';
      const totalSec = Math.floor(web.totalTime / 1000);
      let activityHr = Math.floor(totalSec / (60 * 60));
      let activityMin = Math.floor((totalSec / 60) % (60));
      let activitySec = totalSec % 60;
      if (activityHr) {
        activityTimeDisp += `${activityHr}hr `
      }
      if (activityMin) {
        activityTimeDisp += `${activityMin}min `
      }
      activityTimeDisp += `${activitySec}sec / ${web.usageCount} times`
      activityWrapper.innerHTML = `
      <div class="w-100">
      <div class="d-flex align-items-center mb-2">
        <a class="btn btn-facebook btn-simple mb-0 p-0" target = "_blank" href="https://${webTitles[index]}">

          <div class = "favicon-wrapper">
          </div>
        </a>
        <span class="me-2 text-sm font-weight-normal text-capitalize ms-2">${webTitles[index]}</span>
        <span class="ms-auto text-sm font-weight-normal">${activityTimeDisp}</span>
      </div>
      <div>
        <div class="progress progress-md">
          <div class="progress-bar bg-gradient-dark w-80" role="progressbar" aria-valuenow="60"
            aria-valuemin="0" aria-valuemax="100"></div>
        </div>
      </div>
    </div>
      `;
      const faviconWrapper = activityWrapper.querySelector('.favicon-wrapper');
      if (web.favicon) {
        faviconWrapper.innerHTML = `<img src = "${web.favicon}"/>`
      }
      activitiesWrapper.appendChild(activityWrapper);
      return web.totalTime;
    });
  } else {
    console.log(activitiesWrapper)
    activitiesWrapper.innerHTML = '';
    webUsageChart.data.labels = [];
    webUsageChart.data.datasets[0].data = [] ;
  }
  webUsageChart.update();
}

function updateAppUsage() {

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


//sidebar toggle

const sidebarToggleBtn = document.querySelector('.sidenav-toggler.sidenav-toggler-inner');

sidebarToggleBtn.addEventListener('click', () => {
  const hourlyTimeline = subjects.map(subject => {
    const index = Math.floor((calendarDate.setHours(0, 0, 0, 0) / 1000 - subject.datum_point) / (60 * 60 * 24)) + 1;
    return subject.daily.grouped[index] ? subject.daily.grouped[index] : [[0, 0], [0, 0]]
  });

  const hourlyTimelineInfo = subjects.map(subject => {
    return [subject.name, subject.color]
  })
  setTimeout(() => {
    updateHourlyMatrix(hourlyTimeline, hourlyTimelineInfo);
  }, 2000)
})

//compare

const addCompareTargetBtn = document.querySelector("#compare-target u");
const addCompareTargetModal = document.getElementById("compare-target-modal");
const docmain = document.getElementsByTagName('main')[0];
const userSearch = document.getElementById('user-search');
let compareUserselected = false;

addCompareTargetBtn.addEventListener('click', () => {
  addCompareTargetModal.classList.toggle('closed-modal');
  docmain.classList.toggle('blurbg')
})


let inputBox = document.querySelector('.input-box'),
  searchIcon = document.querySelector('.search'),
  closeIcon = document.querySelector('.close-icon');

// ---- ---- Open Input ---- ---- //
searchIcon.addEventListener('click', () => {
  inputBox.classList.add('open');
});
// ---- ---- Close Input ---- ---- //
closeIcon.addEventListener('click', () => {
  inputBox.classList.remove('open');
  userSearch.value = '';
  usersList.forEach(user => {
    user.el.classList.remove('closed-user');
  })
});

userSearch.addEventListener('input', () => {
  const query = userSearch.value;

  usersList.forEach(user => {
    if (user.name.includes(query)) {
      user.el.classList.remove('closed-user');
    } else {
      user.el.classList.add('closed-user');
    }
  })
})

const userSearchCloseBtn = document.getElementById('user-search-close');
userSearchCloseBtn.addEventListener('click', () => {
  addCompareTargetModal.classList.add('closed-modal');
  docmain.classList.remove('blurbg');
})
/* {label: subject.name, tension: 0.4, borderWidth: 0, pointRadius: 2, pointBackgroundColor: subject.color, borderColor: subject.color, borderWidth: 3, data: data, maxBarThickness: 6} */
const compareGraphContainer = document.getElementById('compare-graph').getContext("2d");
compareChart = new Chart(compareGraphContainer, {
  type: "line",
  data: {
    labels: [1, 2],
    datasets: [
      {
        label: 'me',
        tension: 0.4,
        borderWidth: 0,
        pointRadius: 2,
        pointBackgroundColor: '#FF6666',
        borderColor: '#FF6666',
        backgroundColor: '#FF6666',
        borderWidth: 3,
      },
      {
        label: 'Select User',
        tension: 0.4,
        borderWidth: 0,
        pointRadius: 2,
        pointBackgroundColor: '#3b44ed',
        borderColor: '#3b44ed',
        backgroundColor: '#3b44ed',
        borderWidth: 3,
      }
    ]
  },
  options: {
    scales: {
      y: {
        stacked: true
      }
    }
  }
});