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
  let firstDatumPoint = Math.floor(new Date().getTime() / 1000);
  subjects.map(({ datum_point }) => {
    //this code compares the current firstdatumPoint and current looped subject's datumpoint and updtate the firstDatunmPoint with
    //smaller value
    firstDatumPoint = datum_point < firstDatumPoint ? datum_point : firstDatumPoint;
    return;
  });
  subjects.firstDatumPoint = firstDatumPoint;

  subjects.daily = { maxLength: 0, datum_point: firstDatumPoint, groupedTotal: [], grouped: [], focus: [] };
  subjects.weekly = { maxLength: 0, datum_point: firstDatumPoint, groupedTotal: [], grouped: [], focus: [] };
  subjects.monthly = { maxLength: 0, datum_point: firstDatumPoint, groupedTotal: [], grouped: [], focus: [] };

  subjects.map((subject, i) => {
    const [dailySorted, dailyTotal] = timelineSorter(subject, 'daily', firstDatumPoint, (startTime, stopTime) => {
      return [startTime + DATETOSEC, stopTime + DATETOSEC];
    });
    const [weeklySorted, weeklyTotal] = timelineSorter(subject, 'weekly', firstDatumPoint, (startTime, stopTime) => {
      return [startTime + WEEKTOSEC, stopTime + WEEKTOSEC];
    });
    const [monthlySorted, monthlyTotal] = timelineSorter(subject, 'monthly', firstDatumPoint, (startTime, stopTime) => {
      const newStart = DateTime.fromSeconds(startTime).plus({ months: 1 }).toSeconds();
      const newStop = DateTime.fromSeconds(stopTime).plus({ months: 1 }).toSeconds();
      return [newStart, newStop];
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

    subjects.daily.grouped = subjects.daily.grouped.map((val, i) => {
      /* if (!dailySorted[i]) {
        return [...val];
      }; */
      return [...val, ...dailySorted[i]];
    });

    subjects.weekly.grouped = subjects.weekly.grouped.map((val, i) => {
      /* if (!weeklySorted[i]) {
        return [...val];
      }; */
      return [...val, ...weeklySorted[i]];
    });

    subjects.monthly.grouped = subjects.monthly.grouped.map((val, i) => {
      /* if (!monthlySorted[i]) {
        return [...val];
      }; */
      return [...val, ...monthlySorted[i]];
    });

    subject.daily.focus = Array(subject.daily.grouped.length).fill(0);
    subject.daily.focus = subject.daily.grouped.map((val, i) => {
      let maxVal = 0;
      if (val.length > 0) {
        val.map((currentTimeline, i) => {
          maxVal = Math.max(maxVal, currentTimeline[1] - currentTimeline[0]);
        })
      }
      return Math.max(maxVal, subject.daily.focus[i]);
    })

    subject.weekly.focus = Array(subject.weekly.grouped.length).fill(0);
    subject.weekly.focus = subject.weekly.grouped.map((val, i) => {
      let maxVal = 0;
      if (val.length > 0) {
        val.map((currentTimeline, i) => {
          maxVal = Math.max(maxVal, currentTimeline[1] - currentTimeline[0]);
        })
      }
      return Math.max(maxVal, subject.daily.focus[i]);
    })

    subject.monthly.focus = Array(subject.monthly.grouped.length).fill(0);
    subject.monthly.focus = subject.monthly.grouped.map((val, i) => {
      let maxVal = 0;
      if (val.length > 0) {
        val.map((currentTimeline, i) => {
          maxVal = Math.max(maxVal, currentTimeline[1] - currentTimeline[0]);
        })
      }
      return Math.max(maxVal, subject.daily.focus[i]);
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

    subjects.daily.focus = subject.daily.focus.map((val, i) => {
      return Math.max(subjects.daily.focus[i] || 0, val);
    });
    subjects.weekly.focus = subject.weekly.focus.map((val, i) => {
      return Math.max(subjects.weekly.focus[i] || 0, val);
    });
    subjects.monthly.focus = subject.monthly.focus.map((val, i) => {
      return Math.max(subjects.monthly.focus[i] || 0, val);
    });

    return;
  });


  /* part2 */

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
    const dateStart = DateTime.fromSeconds(datum_point);
    startTime = dateStart.startOf('day').toSeconds();
    stopTime = dateStart.endOf('day').set({ millisecond: 0 }).toSeconds();
    const formattedFirstDatum = DateTime.fromSeconds(firstDatumPoint).startOf('day');
    indexDiff = (startTime - formattedFirstDatum.toSeconds()) / DATETOSEC;
    expectedLength =  DateTime.now().startOf('day').diff(formattedFirstDatum, 'day').days + 1;
  } else if (option === 'weekly') {
    startTime = DateTime.fromSeconds(datum_point).startOf('week').toSeconds();
    stopTime = Math.floor(DateTime.fromSeconds(datum_point).endOf('week').toSeconds());
    const formattedFirstDatum = DateTime.fromSeconds(firstDatumPoint).startOf('week').startOf('day');
    indexDiff = (startTime - formattedFirstDatum.toSeconds()) / (WEEKTOSEC);
    expectedLength = DateTime.now().startOf('week').diff(formattedFirstDatum, 'week').weeks + 1;
  } else {
    startTime = DateTime.fromSeconds(datum_point).startOf('month').toSeconds();
    stopTime = Math.floor(DateTime.fromSeconds(datum_point).endOf('month').toSeconds());
    const formattedFirstDatum = DateTime.fromSeconds(firstDatumPoint).startOf('month').startOf('day');
    indexDiff = DateTime.fromSeconds(datum_point).startOf('month').diff(formattedFirstDatum, 'month').toObject().months;
    expectedLength = DateTime.now().startOf('month').diff(formattedFirstDatum, 'month').months + 1;
  };


  const sortedTimeline = [[]];
  const totalTime = [0];

  //there could be a gap between first datumpoint and datumpoint.
  //So this code removes the gap by adding 0 as the activity
  //console.log('timelinex index diff', option,indexDiff, expectedLength)
  while (indexDiff > 0) {
    sortedTimeline.push([]);
    totalTime.push(0);
    indexDiff -= 1;
  };

  timeline.map(([start, duration]) => {
    const unixStart = datum_point + start + timelineSum;
    const unixStop = unixStart + duration;
    console.log('timelinex',DateTime.fromSeconds(unixStop).toFormat('M/dd hh:mm'))
    timelineSum += start + duration;
    let isIn = true;
    while (isIn) {
      if (startTime <= unixStart && unixStop <= stopTime) {
        sortedTimeline[sortedTimeline.length - 1].push([unixStart, unixStop]);
        totalTime[sortedTimeline.length - 1] += duration;
        isIn = false;
      }
      else {
        if (unixStart < stopTime) {
          sortedTimeline[sortedTimeline.length - 1].push([startTime, unixStop]);
          totalTime[sortedTimeline.length - 1] += duration;
          isIn = false;
        }
        [startTime, stopTime] = startTimeChange(startTime, stopTime);
        sortedTimeline.push([]);
        totalTime.push(0);
      };
    }
    return;
  });
  //console.log('timelinex',totalTime.length, option, expectedLength)

  //this code removes the gap between current time and the last activity
  //console.log('timelinex', expectedLength - totalTime.length, option)
  while (expectedLength - totalTime.length > 0) {
    totalTime.push(0);
    sortedTimeline.push([]);
  };

  return [sortedTimeline, totalTime];
};

/** sort new subject */
function sortNewSubject(subjects, newSubject) {

  const { daily, weekly, monthly } = subjects;
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


  return newSubject;
};

export { timelineSort, sortNewSubject };