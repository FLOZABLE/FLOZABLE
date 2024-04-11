import { DateTime } from 'luxon';

//time usage pie
function updateTimeUsagePie(subjects, viewDateTime, type) {
  const data = [];
  const labels = [];
  if (type === 'Daily') {
    subjects.map(subject => {
      const { daily } = subject;
      const index = daily.total.length + Math.floor(viewDateTime.diffNow('days').days);
      const value = daily.total[index] ? daily.total[index] : 0;
      data.push({ value, info: subject });
    });
  } else if (type === 'Weekly') {
    subjects.map(subject => {
      const { weekly } = subject;
      const index = weekly.total.length + Math.floor(viewDateTime.startOf('week').diffNow('weeks').weeks);
      const value = weekly.total[index] ? weekly.total[index] : 0;
      data.push({ value, info: subject });
    });
  } else {
    subjects.map(subject => {
      const { monthly } = subject;
      const index = monthly.total.length + Math.floor(viewDateTime.startOf('month').diffNow('months').months);
      const value = monthly.total[index] ? monthly.total[index] : 0;
      data.push({ value, info: subject });
    });
  }

  return data;
};

function updateTimeTrend(subjects, mode, sum) {
  const data = [];
  const labels = [];
  const datumPoint = DateTime.fromSeconds(subjects[mode].datum_point);
  subjects[mode].groupedTotal.map((val, i) => {
    const date = datumPoint.plus({ [sum]: i });
    const label = `${date.month}/${date.day}`;
    data.push(val);
    labels.push(label);
  });
  return { data, labels };
};

function updateSubjectsTrendChart(subjects, viewDate, type, change) {
  const data = [];
  const now = DateTime.now().startOf(change)
  let datumPoint = DateTime.fromJSDate(viewDate).startOf(change);
  const diff = datumPoint.diff(now, change).toObject()[change];
  if (diff > -7) {
    datumPoint = now.minus({ [change]: 6 })
  }
  for (let i = 0; i < 7; i++) {
    const date = datumPoint.plus({ [change]: i });
    const label = `${date.month}/${date.day}`;
    const subjectData = updateTimeUsagePie(subjects, date, type);
    const dayObj = {
      data: subjectData,
      label
    };
    data.push(dayObj);
  };
  return data;
};

function updateRankingTrend(rankings) {
  const data = [];
  const copiedArr = JSON.parse(JSON.stringify(rankings));
  console.log(copiedArr)
  copiedArr.data.map(rankingData => {
    const { date, ranking } = rankingData;
    const label = DateTime.fromSeconds(date).toISODate();
    //const label = DateTime.fromSeconds(date).toFormat('M/d');
    if (ranking === -1) {
      data.push({ ranking: copiedArr.maxLength, label });
    } else {
      data.push({ ranking: ranking + 1, label });
    }
  })

  return data;
}

export { updateTimeUsagePie, updateTimeTrend, updateRankingTrend, updateSubjectsTrendChart };