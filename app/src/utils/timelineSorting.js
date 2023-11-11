/** function for sorting the timeline
 * return structure
 * index 0~n is modified subject info
 * about index:
 * color: original
 * daily/weekly/monthly:
 *    .grouped: timeline divided into daily/weekly/monthly
 *    .total: total time divided into daily/weekly/monthly
 * 
 * part2
 * .daily/weekly/monthly has {maxlength, datum_point, groupedTotal}
 * datum_point: the earliest datum_point between all the subjects
 * maxlength: get the subjects with the earliest datumpoint and return the dates/months/weeks passed from that datumpoint
 * groupedTotal: add all the subjects' timeline and divide them based on daily/weekly/monthly
*/
import { DateTime } from "luxon";

function timelineSort(subjects) {
  console.log('original', {...subjects});
  let firstDatumPoint = Math.floor(new Date().getTime() / 1000);
  subjects.map(({ datum_point }) => {
    //this code compares the current firstdatumPoint and current looped subject's datumpoint and updtate the firstDatunmPoint with
    //smaller value
    firstDatumPoint = datum_point < firstDatumPoint ? datum_point : firstDatumPoint;
  });
  subjects.firstDatumPoint = firstDatumPoint;

  subjects.daily = {maxLength: 0, datum_point: firstDatumPoint, groupedTotal: [], grouped: []};
  subjects.weekly = {maxLength: 0, datum_point: firstDatumPoint, groupedTotal: [], grouped: []};
  subjects.monthly = {maxLength: 0, datum_point: firstDatumPoint, groupedTotal: [], grouped: []};

  subjects.map((subject, i) => {
    const [dailySorted, dailyTotal] = timelineSorter(subject, 'daily', firstDatumPoint, (startTime, stopTime) => {
      return [startTime + DATETOSEC, stopTime + DATETOSEC];
    });
    const [weeklySorted, weeklyTotal] = timelineSorter(subject, 'weekly', firstDatumPoint, (startTime, stopTime) => {
      return [startTime + WEEKTOSEC, stopTime + WEEKTOSEC];
    });
    const [monthlySorted, monthlyTotal] = timelineSorter(subject, 'monthly', firstDatumPoint, (startTime, stopTime) => {
      const originalStart = DateTime.fromSeconds(startTime);
      const originalStop = DateTime.fromSeconds(stopTime);
      startTime = DateTime.fromObject({ year: originalStart.year, month: originalStart.month + 1 });
      stopTime = DateTime.fromObject({ year: originalStop.year, month: originalStop.month + 1 });
      return [startTime, stopTime];
    });

    subject.daily = {};
    subject.weekly = {};
    subject.monthly = {};
    subject.daily.grouped = dailySorted;
    subject.daily.total = dailyTotal;

    subject.weekly.grouped = weeklySorted;
    subject.weekly.total = weeklyTotal;

    subject.monthly.grouped = monthlySorted;
    subject.monthly.total = monthlyTotal;

    //fills array only when index is 0
    if (!i) {
      subjects.daily.grouped = Array(dailySorted.length).fill([]);
      subjects.weekly.grouped = Array(weeklySorted.length).fill([]);
      subjects.monthly.grouped = Array(monthlySorted.length).fill([]);

      subjects.daily.groupedTotal = Array(dailyTotal.length).fill(0);
      subjects.weekly.groupedTotal = Array(weeklyTotal.length).fill(0);
      subjects.monthly.groupedTotal = Array(monthlyTotal.length).fill(0);
    };

    subjects.daily.grouped = dailySorted.map((val, i) => {
      return [...val, ...subjects.daily.grouped[i]];
    });
    subjects.weekly.grouped = weeklySorted.map((val, i) => {
      return [...val, ...subjects.weekly.grouped[i]];
    });
    subjects.monthly.grouped = monthlySorted.map((val, i) => {
      return [...val, ...subjects.monthly.grouped[i]];
    });

    subjects.daily.groupedTotal = dailyTotal.map((val, i) => {
      return val + subjects.daily.groupedTotal[i];
    });
    subjects.weekly.groupedTotal = weeklyTotal.map((val, i) => {
      return val + subjects.weekly.groupedTotal[i];
    });
    subjects.monthly.groupedTotal = monthlyTotal.map((val, i) => {
      return val + subjects.monthly.groupedTotal[i];
    });
  });



  /* part2 */
  console.log('result subject', {...subjects});
  return subjects;
};

const DATETOSEC = 60 * 60 * 24;
const WEEKTOSEC = DATETOSEC * 7;

function timelineSorter({ timeline, datum_point, name }, option, firstDatumPoint, startTimeChange) {
  let timelineSum = 0;
  let startTime;
  let stopTime;

  let indexDiff;
  let expectedLength;

  if (option === 'daily') {
    startTime = new Date(datum_point * 1000).setHours(0, 0, 0, 0) / 1000;
    stopTime = new Date(startTime * 1000).setHours(23, 59, 59, 0) / 1000;
    const formattedFirstDatum = new Date(firstDatumPoint * 1000).setHours(0, 0, 0, 0) / 1000;
    indexDiff = (startTime - formattedFirstDatum) / DATETOSEC;
    const now = new Date().setHours(0, 0, 0, 0) / 1000;
    expectedLength = (now - formattedFirstDatum) / DATETOSEC + 1;
  } else if (option === 'weekly') {
    startTime = DateTime.fromSeconds(datum_point).startOf('week').toSeconds();
    stopTime = DateTime.fromSeconds(datum_point).endOf('week').toSeconds();
    const formattedFirstDatum = DateTime.fromSeconds(firstDatumPoint).startOf('week');
    indexDiff = (startTime - formattedFirstDatum.toSeconds()) / (WEEKTOSEC);
    expectedLength = DateTime.now().startOf('week').diff(formattedFirstDatum, 'week').weeks + 1;
  } else {
    startTime = DateTime.fromSeconds(datum_point).startOf('month').toSeconds();
    stopTime = DateTime.fromSeconds(datum_point).endOf('month').toSeconds();
    const formattedFirstDatum = DateTime.fromSeconds(firstDatumPoint).startOf('month');
    indexDiff = DateTime.fromSeconds(datum_point).startOf('month').diff(formattedFirstDatum, 'month').toObject().months;
    expectedLength = DateTime.now().startOf('month').diff(formattedFirstDatum, 'month').months + 1;
  };
  console.log('result', option,name, indexDiff, expectedLength)

  const sortedTimeline = [[]];
  const totalTime = [0];

  //there could be a gap between first datumpoint and datumpoint.
  //So this code removes the gap by adding 0 as the activity
  while (indexDiff > 0) {
    sortedTimeline.push([]);
    totalTime.push(0);
    indexDiff -= 1;
  };

  timeline.map(([start, duration]) => {
    const unixStart = datum_point + start + timelineSum;
    const unixStop = unixStart + duration;
    timelineSum += start + duration;
    let isIn = true;
    while (isIn) {
      if (startTime <= unixStart && unixStop <= stopTime) {
        sortedTimeline[sortedTimeline.length - 1].push([unixStart, unixStop]);
        totalTime[sortedTimeline.length - 1] += duration;
        isIn = false;
      }
       else {
        /* if (unixStart < stopTime) {
          sortedTimeline[sortedTimeline.length - 1].push([startTime, unixStop]);
          totalTime[sortedTimeline.length - 1] += duration;
          isIn = false;
        } */
        [startTime, stopTime] = startTimeChange(startTime, stopTime);
        sortedTimeline.push([]);
        totalTime.push(0);
      };
    }
  });

  //this code removes the gap between current time and the last activity
  while (expectedLength - totalTime.length > 0) {
    totalTime.push(0);
    sortedTimeline.push([]);
  };

  return [sortedTimeline, totalTime];
};

/** sort new subject */
function sortNewSubject(subjects, newSubject) {
  console.log('subjects', subjects, newSubject);
  const {daily, weekly, monthly} = subjects;
  newSubject.daily = {
    grouped: Array(daily.maxLength ? daily.maxLength : 1).fill([]),
    total: Array(daily.maxLength ? daily.maxLength : 1).fill(0)
  };
  newSubject.weekly = {
    grouped: Array(weekly.maxLength ? weekly.maxLength : 1).fill([]),
    total: Array(weekly.maxLength ? weekly.maxLength : 1).fill(0)
  };
  newSubject.monthly = {
    grouped: Array(monthly.maxLength ? monthly.maxLength : 1).fill([]),
    total: Array(monthly.maxLength ? monthly.maxLength : 1).fill(0)
  };

  console.log('new subject', newSubject)
  return newSubject;
}

export { timelineSort, sortNewSubject };