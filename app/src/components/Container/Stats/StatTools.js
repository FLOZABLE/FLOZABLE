import { DateTime } from 'luxon';
import styles from './Stats.module.css';

const DATETOSEC = 60 * 60 * 24;

//time usage pie
function updateTimeUsagePie(subjects, viewDate, type) {
  let data = [];
  const {firstDatumPoint} = subjects;
  if (type === 'Daily') {
    data = subjects.map(subject => {
      const {daily} = subject;
      const viewDateTime = DateTime.fromJSDate(viewDate).startOf('day');
      const index = daily.total.length + Math.floor(viewDateTime.diffNow('days').days);
      return daily.total[index] ? daily.total[index] : 0;
    });
  } else if (type === 'Weekly') {
    data = subjects.map(subject => {
      const {weekly} = subject;
      const viewDateTime = DateTime.fromJSDate(viewDate).startOf('week');
      const index = weekly.total.length + Math.floor(viewDateTime.diffNow('weeks').weeks);
      return weekly.total[index] ? weekly.total[index] : 0;
    });
  } else {
    data = subjects.map(subject => {
      const {monthly} = subject;
      const viewDateTime = DateTime.fromJSDate(viewDate).startOf('month');
      const index = monthly.total.length + Math.floor(viewDateTime.diffNow('months').months);
      return monthly.total[index] ? monthly.total[index] : 0;
    });
  }
  
  return ({ data: data });
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
  const histogramData = new Array(24).fill(0);
  if (type == 'Daily') {
    subjects.map(subject => {
      const datumPoint = new Date(subject.datum_point * 1000).setHours(0, 0, 0, 0);
      const diff = (viewDate.getTime() - datumPoint) / (1000 * 60 * 60 * 24);
      if (subject.daily.total[diff]) {
        subject.daily.grouped[diff].map(([start, stop], i) => {
          let startTime = new Date(start * 1000);
          let startTimeHr = startTime.getHours();
          //let startTimeMin = startTime.getMinutes();
          let stopTime = new Date(stop * 1000);
          let stopTimeHr = stopTime.getHours();
          //let stopTimeMin = stopTime.getMinutes();
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
            //let startTimeMin = startTime.getMinutes();
            let stopTime = new Date(stop * 1000);
            let stopTimeHr = stopTime.getHours();
            //let stopTimeMin = stopTime.getMinutes();
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
      const datumWeekStart = new Date(datumPoint.setDate(datumPoint.getDate() - datumPoint.getDay())).setHours(0, 0, 0, 0);
      const viewWeekStart = new Date(new Date(viewDate).setDate(viewDate.getDate() - viewDate.getDay())).setHours(0, 0, 0, 0);
      let diff = (viewWeekStart - datumWeekStart) / (1000 * 60 * 60 * 24);
      for (let i = 0; i < 7; i++) {
        if (subject.daily.total[diff]) {
          subject.daily.grouped[diff].map(([start, stop]) => {
            let startTime = new Date(start * 1000);
            let startTimeHr = startTime.getHours();
            //let startTimeMin = startTime.getMinutes();
            let stopTime = new Date(stop * 1000);
            let stopTimeHr = stopTime.getHours();
            //let stopTimeMin = stopTime.getMinutes();
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
  }
  return histogramData;
};

function updateTimeTrend(subjects, type) {
  const data = [];
  const labels = [];
  if (subjects.daily) {
    if (type === 'Daily') {
      const datumPoint = DateTime.fromSeconds(subjects.daily.datum_point);
      subjects.daily.groupedTotal.map((val, i) => {
        const date = datumPoint.plus({days: i});
        const label = `${date.month}/${date.day}`;
        data.push(val);
        labels.push(label);
      });
    } else if (type === 'Weekly') {
      const datumPoint = DateTime.fromSeconds(subjects.weekly.datum_point).startOf('week');
      subjects.weekly.groupedTotal.map((val, i) => {
        const date = datumPoint.plus({weeks: i});
        const label = `${date.month}/${date.day}`;
        data.push(val);
        labels.push(label);
      });
    } else {
      const datumPoint = DateTime.fromSeconds(subjects.monthly.datum_point).startOf('month');
      subjects.monthly.groupedTotal.map((val, i) => {
        const date = datumPoint.plus({months: i});
        const label = `${date.month}/${date.day}`;
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

function updateRankingTrend(rankings) {
  const data = [];
  const labels = [];
  
  if (rankings) {
    rankings.data.map(rankingData => {
      const {date, ranking} = rankingData;
      labels.push(DateTime.fromSeconds(date, {zone: 'utc'}).toISODate());
      if (ranking === -1) {
        data.push(rankings.maxLength);
      } else {
        data.push(ranking + 1);
      }
    })
  };
  
  return [labels, data];
}

export { updateTimeUsagePie, updateHourlyMatrix, updateHourlyHistogram, updateTimeTrend, sortRanking, updateRankingTrend };