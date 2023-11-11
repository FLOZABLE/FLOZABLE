import { DateTime } from 'luxon';
import styles from './Stats.module.css';

const usersList = [];
const myRanking = {
  daily: [],
  weekly: [],
  monthly: []
};

const sortSubjects = (subjects) => {
  try {
    //subjects = JSON.parse(subjects);
    const now = new Date();
    const currentDay = now.getDay();
    subjects.forEach((subject) => {
      const { datum_point, timeline } = subject;
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
  const dailyTimeline = [[]];
  timeline.forEach(([start, stop]) => {
    const acStart = new Date((datum_point + start) * 1000).getTime();
    const acStop = new Date((datum_point + stop) * 1000).getTime();
    while (dayStart < new Date(acStart).setHours(0, 0, 0, 0) ) {
      dayStart += 1000 * 60 * 60 * 24;
      dayStop += 1000 * 60 * 60 * 24;
      dailyTimeline.push([[0, 0]]);
    }


    if (dayStart <= acStart && dayStop >= acStop) {
      dailyTimeline[dailyTimeline.length - 1].push([acStart / 1000, acStop / 1000]);
    } else if (dayStop > acStart && dayStop < acStop) {
      dailyTimeline[dailyTimeline.length - 1].push([acStart / 1000, (dayStop + 1) / 1000]);
      dailyTimeline.push([])
      dailyTimeline[dailyTimeline.length - 1].push([(dayStop + 1) / 1000, acStop / 1000]);
      dayStart += 1000 * 60 * 60 * 24;
      dayStop += 1000 * 60 * 60 * 24;
    } else {
      dailyTimeline.push([]);
      dailyTimeline[dailyTimeline.length - 1].push([acStart / 1000, acStop / 1000]);
      dayStart += 1000 * 60 * 60 * 24;
      dayStop += 1000 * 60 * 60 * 24;
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
  console.log('stuff week', timeline)
  let date = new Date(datum_point * 1000);
  let weekStart = date.setHours(0, 0, 0, 0) - date.getDay() * 24 * 60 * 60 * 1000;
  let weekStop = date.setHours(23, 59, 59, 999) + (6 - date.getDay()) * 24 * 60 * 60 * 1000 + 999;
  const weeklyTimeline = [[]];
  timeline.forEach(([start, stop]) => {
    const acStart = new Date((datum_point + start) * 1000).getTime();
    const acStop = new Date((datum_point + stop) * 1000).getTime();

    while (weekStart < new Date(acStart).setHours(0, 0, 0, 0)) {
      weekStart += 1000 * 60 * 60 * 24 * 7;
      weekStop += 1000 * 60 * 60 * 24 * 7;
      weeklyTimeline.push([[0, 0]]);
    }


    if (weekStart <= acStart && weekStop >= acStop) {
      weeklyTimeline[weeklyTimeline.length - 1].push([acStart / 1000, acStop / 1000]);
    } else if (weekStop > acStart && weekStop < acStop) {
      weeklyTimeline[weeklyTimeline.length - 1].push([acStart / 1000, (weekStop + 1) / 1000]);
      weeklyTimeline.push([])
      weeklyTimeline[weeklyTimeline.length - 1].push([(weekStop + 1) / 1000, acStop / 1000]);
      weekStart += 1000 * 60 * 60 * 24 * 7;
      weekStop += 1000 * 60 * 60 * 24 * 7;
    } else {
      weeklyTimeline.push([]);
      weeklyTimeline[weeklyTimeline.length - 1].push([acStart / 1000, acStop / 1000]);
      weekStart += 1000 * 60 * 60 * 24 * 7;
      weekStop += 1000 * 60 * 60 * 24 * 7;
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
  const monthlyTimeline = [[]];
  timeline.forEach(([start, stop]) => {
    const acStart = new Date((datum_point + start) * 1000).getTime();
    const acStop = new Date((datum_point + stop) * 1000).getTime();

    while (monthStart < new Date(acStart).setHours(0, 0, 0, 0)) {
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
    } else {
      monthlyTimeline.push([]);
      monthlyTimeline[monthlyTimeline.length - 1].push([acStart / 1000, acStop / 1000]);
      startMonth += 1;
      if (startMonth >= 11) {
        startMonth = 0;
        startYear += 1;
      }
      [monthStart, monthStop] = [new Date(startYear, startMonth, 1).setHours(0, 0, 0, 0), new Date(startYear, startMonth + 1, 0).setHours(23, 59, 59, 999)];
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
function updateTimeUsagePie(subjects, viewDate, type) {
  let data = [];
  const labels = subjects.map(subject => {
    const index = Math.floor((viewDate.getTime() / 1000 - subject.datum_point) / (60 * 60 * 24));
    return subject.daily.total[index] ? subject.daily.total[index] : 0;
  });

  /* if (type === 'Daily') {
    data = subjects.map(subject => {
      const index = Math.floor((viewDate.getTime() / 1000 - subject.datum_point) / (60 * 60 * 24));
      console.log('index',index, viewDate)
      return subject.daily.total[index] ? subject.daily.total[index] : 0
    });
  } else if (type === 'Weekly') {
    data = subjects.map(subject => {
      const datumPoint = new Date(subject.datum_point * 1000);
      const datumWeekStart = new Date(datumPoint.setDate(datumPoint.getDate() - datumPoint.getDay())).setHours(0, 0, 0, 0);
      const viewWeekStart = new Date(new Date(viewDate).setDate(viewDate.getDate() - viewDate.getDay())).setHours(0, 0, 0, 0);
      let diff = (viewWeekStart - datumWeekStart) / (1000 * 60 * 60 * 24);
      return subject.weekly.total[diff] ? subject.weekly.total[diff] : 0;
    });
  } else {
    data = subjects.map(subject => {
      const datumPoint = new Date(subject.datum_point * 1000);
      let datumMonthStart = new Date(datumPoint.getFullYear(), datumPoint.getMonth(), 1);
      const viewMonthStart = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1);
      let diff = (viewMonthStart - datumMonthStart) / (1000 * 60 * 60 * 24);
      return subject.monthly.total[diff] ? subject.monthly.total[diff] : 0;
    });
  }; */
  const {firstDatumPoint} = subjects;
  if (type === 'Daily') {
    data = subjects.map(subject => {
      const {daily} = subject;
      const index = Math.floor((viewDate.getTime() / 1000 - firstDatumPoint) / (60 * 60 * 24)) + 1;
      return daily.total[index] ? daily.total[index] : 0;
    });
  } else if (type === 'Weekly') {
    data = subjects.map(subject => {
      const {weekly} = subject;
      const index = Math.round(DateTime.fromJSDate(viewDate).startOf('week').diff(DateTime.fromSeconds(firstDatumPoint), 'week').weeks);
      console.log('g', index)
      return weekly.total[index] ? weekly.total[index] : 0;
    });
  } else {
    data = subjects.map(subject => {
      const {monthly} = subject;
      const datumPoint = new Date(firstDatumPoint * 1000);
      let datumMonthStart = new Date(datumPoint.getFullYear(), datumPoint.getMonth(), 1);
      const viewMonthStart = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1);
      let diff = (viewMonthStart - datumMonthStart) / (1000 * 60 * 60 * 24);
      return monthly.total[diff] ? monthly.total[diff] : 0;
    });
  }
  console.log('tisdf', data)
  return ({ labels: labels, data: data });
};

function updateHourlyMatrix(subjects, matrixChartWidth, viewDate) {
  const matrixChart = [];
  let key = 1;
  subjects.map((subject) => {
      const datumPoint = new Date(subject.datum_point * 1000).setHours(0, 0, 0, 0);
      const diff = (viewDate.getTime() - datumPoint) / (1000 * 60 * 60 * 24);
      if (subject.daily.total[diff]) {
        subject.daily.grouped[diff].map(([start, stop], i) => {
          let startTimeHr = new Date(start * 1000).getHours();
          let startTimeMin = new Date(start * 1000).getMinutes();
          let stopTimeHr = new Date(stop * 1000).getHours();
          let stopTimeMin = new Date(stop * 1000).getMinutes();
          if (startTimeHr == stopTimeHr) {
            const top = 27 + startTimeHr * 30 + 'px';
            const left = 50 + matrixChartWidth / 60 * startTimeMin + 'px';
            const width = (matrixChartWidth / 60 * (stopTimeMin - startTimeMin) - 50) / (matrixChartWidth - 50) * 100 + '%';
            matrixChart.push(
              <div className={styles.activity} style={{ position: 'absolute', top: top, left: left, width: width, height: '30px', backgroundColor: 'red' }} key={key}>
              </div>
            );
            key++;
          } else {
            let top = 50 + startTimeHr * 30 + 'px';
            let left = 50 + matrixChartWidth / 60 * startTimeMin + 'px';
            let width = (matrixChartWidth / 60 * (60 - startTimeMin) - 50) / matrixChartWidth * 100 + '%';
            matrixChart.push(
              <div className={styles.activity} style={{ position: 'absolute', top: top, left: left, width: width, height: '30px', backgroundColor: 'red' }} key={key}>
              </div>
            );
            key++;
            while (startTimeHr < stopTimeHr - 1) {
              startTimeHr++;
              top = 50 + startTimeHr * 30 + 'px';
              left = '50px';
              width = (matrixChartWidth - 50) / matrixChartWidth * 100 + '%';
              matrixChart.push(
                <div className={styles.activity} style={{ position: 'absolute', top: top, left: left, width: width, height: '30px', backgroundColor: 'red' }} key={key}>
                </div>
              );
              key++;
            };
            top = 50 + (startTimeHr + 1) * 30 + 'px';
            left = '50px';
            width = (matrixChartWidth / 60 * stopTimeMin - 50) / (matrixChartWidth - 50) * 100 >= 0 ? (matrixChartWidth / 60 * stopTimeMin - 50) / (matrixChartWidth - 50) * 100 + '%' : '0%';
            matrixChart.push(
              <div className={styles.activity} style={{ position: 'absolute', top: top, left: left, width: width, height: '30px', backgroundColor: 'red' }} key={key}>
              </div>
            );
            key++;
          }
        })
      }

  });
  return matrixChart;
};

function updateHourlyHistogram(subjects, type, viewDate) {
  const histogramData = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,];
  if (type == 'Daily') {
    subjects.map(subject => {
      const datumPoint = new Date(subject.datum_point * 1000).setHours(0, 0, 0, 0);
      const diff = (viewDate.getTime() - datumPoint) / (1000 * 60 * 60 * 24);
      if (subject.daily.total[diff]) {
        subject.daily.grouped[diff].map(([start, stop], i) => {
          let startTime = new Date(start * 1000);
          let startTimeHr = startTime.getHours();
          let startTimeMin = startTime.getMinutes();
          let stopTime = new Date(stop * 1000);
          let stopTimeHr = stopTime.getHours();
          let stopTimeMin = stopTime.getMinutes();
          if (startTimeHr == stopTimeHr) {
            histogramData[startTimeHr] += stop - start;
          } else {
            histogramData[startTimeHr] += Math.floor((new Date(start * 1000).setMinutes(60) - startTime.getTime()) / 1000);
            while (startTimeHr < stopTimeHr - 1) {
              startTimeHr++;
              histogramData[startTimeHr] += 3600;
            }
            histogramData[startTimeHr + 1] += stop - new Date(stop * 1000).setMinutes(0) / 1000;
          }
        });
      }
    });
  } else if (type == 'Weekly') {
    subjects.map(subject => {
      const datumPoint = new Date(subject.datum_point * 1000);
      const datumWeekStart = new Date(datumPoint.setDate(datumPoint.getDate() - datumPoint.getDay())).setHours(0, 0, 0, 0);
      const viewWeekStart = new Date(new Date(viewDate).setDate(viewDate.getDate() - viewDate.getDay())).setHours(0, 0, 0, 0);
      let diff = (viewWeekStart - datumWeekStart) / (1000 * 60 * 60 * 24);
      for (let i = 0; i < 7; i++) {
        if (subject.daily.total[diff]) {
          subject.daily.grouped[diff].map(([start, stop]) => {
            let startTime = new Date(start * 1000);
            let startTimeHr = startTime.getHours();
            let startTimeMin = startTime.getMinutes();
            let stopTime = new Date(stop * 1000);
            let stopTimeHr = stopTime.getHours();
            let stopTimeMin = stopTime.getMinutes();
            if (startTimeHr == stopTimeHr) {
              histogramData[startTimeHr] += stop - start;
            } else {
              histogramData[startTimeHr] += Math.floor((new Date(start * 1000).setMinutes(60) - startTime.getTime()) / 1000);
              while (startTimeHr < stopTimeHr - 1) {
                startTimeHr++;
                histogramData[startTimeHr] += 3600;
              }
              histogramData[startTimeHr + 1] += stop - new Date(stop * 1000).setMinutes(0) / 1000;
            }
          });
        };
        diff++;
      }
    });
  } else {
    subjects.map(subject => {
      const datumPoint = new Date(subject.datum_point * 1000);
      let datumMonthStart = new Date(datumPoint.getFullYear(), datumPoint.getMonth(), 1);
      const viewMonthStart = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1);
      let diff = (viewMonthStart - datumMonthStart) / (1000 * 60 * 60 * 24);
      while (datumMonthStart.getMonth() <= viewDate.getMonth()) {
        if (subject.daily.total[diff]) {
          subject.daily.grouped[diff].map(([start, stop]) => {
            let startTime = new Date(start * 1000);
            let startTimeHr = startTime.getHours();
            let startTimeMin = startTime.getMinutes();
            let stopTime = new Date(stop * 1000);
            let stopTimeHr = stopTime.getHours();
            let stopTimeMin = stopTime.getMinutes();
            if (startTimeHr == stopTimeHr) {
              histogramData[startTimeHr] += stop - start;
            } else {
              histogramData[startTimeHr] += Math.floor((new Date(start * 1000).setMinutes(60) - startTime.getTime()) / 1000);
              while (startTimeHr < stopTimeHr - 1) {
                startTimeHr++;
                histogramData[startTimeHr] += 3600;
              }
              histogramData[startTimeHr + 1] += stop - new Date(stop * 1000).setMinutes(0) / 1000;
            }
          });
        }
        diff += 1;
        datumMonthStart = new Date(datumMonthStart.getTime() + 1000 * 60 * 60 * 24);
      };
    });
  }
  return histogramData;
};

function updateTimeTrend(subjects, type) {
  const data = [];
  const labels = [];
  if (subjects.daily) {
    const datumPoint = new Date(subjects.daily.datum_point * 1000).setHours(0, 0, 0, 0);
    if (type === 'Daily') {
      subjects.daily.groupedTotal.map((val, i) => {
        const date = new Date(datumPoint + i * 60 * 60 * 1000 * 24);
        const label = `${date.getMonth() + 1}/${date.getDate()}`;
        data.push(val);
        labels.push(label);
      });
    } else if (type === 'Weekly') {
      subjects.weekly.groupedTotal.map((val, i) => {
        const date = new Date(datumPoint + i * 60 * 60 * 1000 * 24 * 7);
        const label = `${date.getMonth() + 1}/${date.getDate()}`;
        data.push(val);
        labels.push(label);
      });
    } else {
      subjects.monthly.groupedTotal.map((val, i) => {
        const date = new Date(new Date(datumPoint).getFullYear(), new Date(datumPoint).getMonth() + i, 1);
        const label = `${date.getFullYear()}/${date.getMonth() + 1}`;
        data.push(val);
        labels.push(label);
      });
    };
  };
  return [labels, data];
};

function sortRanking(ranking, userInfo) {
  const myRanking = {
    daily: [],
    weekly: [],
    monthly: []
  };
  const userId = userInfo.user_id;
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
  return myRanking;
}

function updateRankingTrend(ranking, type) {
  const data = [];
  const labels = [];
  if (ranking.daily) {
    if (type === 'Daily') {
      const now  = new Date();
      const datumPoint = new Date(now.getFullYear(), now.getMonth(), now.getDate() - ranking.daily.length).setHours(0, 0, 0, 0);
      ranking.daily.map((val, i) => {
        const date = new Date(datumPoint + i * 60 * 60 * 1000 * 24);
        const label = `${date.getMonth() + 1}/${date.getDate()}`;
        data.push(val);
        labels.push(label);
      });
    } else if (type === 'Weekly') {
      const now  = new Date();
      const datumPoint = new Date(now.getFullYear(), now.getMonth(), now.getDate() - ranking.daily.length);
      const datumWeekStart = new Date(datumPoint.setDate(datumPoint.getDate() - datumPoint.getDay())).setHours(0, 0, 0, 0);
      ranking.weekly.map((val, i) => {
        const date = new Date(datumWeekStart + i * 60 * 60 * 1000 * 24 * 7);
        const label = `${date.getMonth() + 1}/${date.getDate()}`;
        data.push(val);
        labels.push(label);
      });
    } else {
      const now  = new Date();
      const datumPoint = new Date(now.getFullYear(), now.getMonth(), now.getDate() - ranking.daily.length);
      const datumMonthStart = new Date(datumPoint.getFullYear(), datumPoint.getMonth(), 1);
      ranking.monthly.map((val, i) => {
        const date = new Date(datumMonthStart.getFullYear(), datumMonthStart.getMonth() + i);
        const label = `${date.getFullYear()}/${date.getMonth() + 1}`;
        data.push(val);
        labels.push(label);
      });
    };
  };
  return [labels, data];
}

export { sortSubjects, updateTimeUsagePie, updateHourlyMatrix, updateHourlyHistogram, updateTimeTrend, sortRanking, updateRankingTrend };