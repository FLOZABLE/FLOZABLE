import { DateTime } from 'luxon';

//time usage pie
function updateTimeUsagePie(subjects, viewDateTime, type) {
  const data = [];
  const labels = [];
  if (type === 'Daily') {
    subjects.map(subject => {
      const { daily } = subject;
      const index = daily.total.length + Math.floor(viewDateTime.diffNow('days').days);
      data.push(daily.total[index] ? daily.total[index] : 0);
      labels.push(subject.name);
    });
  } else if (type === 'Weekly') {
    subjects.map(subject => {
      const { weekly } = subject;
      const index = weekly.total.length + Math.floor(viewDateTime.diffNow('weeks').weeks);
      data.push(weekly.total[index] ? weekly.total[index] : 0);
      labels.push(subject.name);
    });
  } else {
    subjects.map(subject => {
      const { monthly } = subject;
      const index = monthly.total.length + Math.floor(viewDateTime.diffNow('months').months);
      data.push(monthly.total[index] ? monthly.total[index] : 0);
      labels.push(subject.name);
    });
  }

  return ({ data, labels });
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
  return {data, labels};
};

function updateStackedAreaGraph(subjects, type) {
  const data = [];
  const labels = [];
  if (subjects.daily) {
    if (type === 'Daily') {
      const datumPoint = DateTime.now().minus({ days: 6 });
      for (let i = 0; i < 7; i++) {
        const date = datumPoint.plus({ days: i });
        const label = `${date.month}/${date.day}`;
        const subjectData = updateTimeUsagePie(subjects, date, "Daily");
        
        let dayObj = {};
        let studyTotal = 0;
        for (let j = 0; j < subjectData.data.length; j++){
          dayObj[subjectData.labels[j]] = subjectData.data[j];
          studyTotal += subjectData.data[j];
        }
        dayObj["Total"] = studyTotal;
        dayObj["name"] = label;
        data.push(dayObj);
      }
    } else if (type === 'Weekly') {
      const datumPoint = DateTime.now().minus({ weeks: 6 });
      for (let i = 0; i < 7; i++) {
        const date = datumPoint.plus({ weeks: i }).startOf("week");
        const label = `${date.month}/${date.day}`;
        const subjectData = updateTimeUsagePie(subjects, date, "Weekly");

        let weekObj = {};
        let studyTotal = 0;
        for (let j = 0; j < subjectData.data.length; j++){
          weekObj[subjectData.labels[j]] = subjectData.data[j];
          studyTotal += subjectData.data[j];
        }
        weekObj["Total"] = studyTotal;
        weekObj["name"] = label;
        data.push(weekObj);
      }
    } else {
      const datumPoint = DateTime.now().minus({ months: 6 });
      for (let i = 0; i < 7; i++) {
        const date = datumPoint.plus({ months: i }).startOf("month");
        const label = `${date.month}/${date.day}`;
        const subjectData = updateTimeUsagePie(subjects, date, "Monthly");
        
        let monthObj = {};
        let studyTotal = 0;
        for (let j = 0; j < subjectData.data.length; j++){
          monthObj[subjectData.labels[j]] = subjectData.data[j];
          studyTotal += subjectData.data[j];
        }
        monthObj["Total"] = studyTotal;
        monthObj["name"] = label;
        data.push(monthObj);
      }
    };
  };
  return {labels, data};
};

function updateRankingTrend(rankings) {
  const data = [];
  const labels = [];

  if (rankings) {
    rankings.data.map(rankingData => {
      const { date, ranking } = rankingData;
      labels.push(DateTime.fromSeconds(date, { zone: 'utc' }).toFormat('M/d'));
      if (ranking === -1) {
        data.push(rankings.maxLength);
      } else {
        data.push(ranking + 1);
      }
    })
  };

  return [labels, data];
}

export { updateTimeUsagePie, updateTimeTrend, updateRankingTrend, updateStackedAreaGraph };