/** function for sorting the timeline
 * return structure
 * index 0~n is modified subject info
 * about index:
 * color: original
 * daily/weekly/monthly:
 *    .grouped: timeline divided into daily/weekly/monthly
 *    .total: total time divided into daily/weekly/monthly
 * 
 * 
 * .daily/weekly/monthly has {maxlength, datum_point, groupedTotal}
 * datum_point: the earliest datum_point between all the subjects
 * maxlength: get the subjects with the earliest datumpoint and return the dates/months/weeks passed from that datumpoint
 * groupedTotal: add all the subjects' timeline and divide them based on daily/weekly/monthly
*/
import { DateTime } from "luxon";

function timelineSort(subjects) {
  console.log('original', subjects);
  subjects.map(subject => {
    sortDaily(subject);
    sortWeekly(subject);
    sortMonthly(subject);
  })
};

const DATETOSEC = 60 * 60 * 24;
const WEEKTOSEC = DATETOSEC * 7;

function sortDaily ({timeline, datum_point}) {
  let timelineSum = 0;
  let startTime = new Date(datum_point * 1000).setHours(0, 0, 0, 0) / 1000;
  let stopTime = new Date(startTime * 1000).setHours(23, 59, 59, 0) / 1000;
  const sortedDaily = [[]];
  timeline.map(([start, duration]) => {
    const unixStart = datum_point + start + timelineSum;
    const unixStop = unixStart + duration;
    timelineSum += start * 2 + duration;
    let isIn = true;
    while (isIn) {
      if (startTime <= unixStart && unixStop <= stopTime) {
        sortedDaily[sortedDaily.length - 1].push([unixStart, unixStop]);
        isIn = false;
      } else if (startTime <= unixStart) {
        //case when start time is between 0:00 and 23:59, but stop time is new date
        //in this case, we will separte the activity into 2 arrays one activity with [start, 23:59], [0:00, stop]
  
        sortedDaily[sortedDaily.length - 1].push([unixStart, stopTime]);
        sortedDaily.push([]);
        sortedDaily[sortedDaily.length - 1].push([stopTime + 1, unixStop]);
        /* const missingDates = unixStop % (60 * 60 * 24) */
        isIn = false;
      } else {
        startTime += DATETOSEC;
        stopTime += DATETOSEC;
      };
    }
  });

  console.log('result', sortedDaily);
};

function sortWeekly ({timeline, datum_point}) {
  let timelineSum = 0;
  let startTime = DateTime.fromSeconds(datum_point).startOf('week').toSeconds();
  let stopTime = DateTime.fromSeconds(datum_point).endOf('week').toSeconds();
  console.log(new Date(startTime * 1000), 'ddd')
  const sortedDaily = [[]];
  timeline.map(([start, duration]) => {
    const unixStart = datum_point + start + timelineSum;
    const unixStop = unixStart + duration;
    timelineSum += start * 2 + duration;
    let isIn = true;
    while (isIn) {
      if (startTime <= unixStart && unixStop <= stopTime) {
        sortedDaily[sortedDaily.length - 1].push([unixStart, unixStop]);
        isIn = false;
      } else if (startTime <= unixStart) {
        //case when start time is between 0:00 and 23:59, but stop time is new date
        //in this case, we will separte the activity into 2 arrays one activity with [start, 23:59], [0:00, stop]
  
        sortedDaily[sortedDaily.length - 1].push([unixStart, stopTime]);
        sortedDaily.push([]);
        sortedDaily[sortedDaily.length - 1].push([stopTime + 1, unixStop]);
        isIn = false;
      } else {
        startTime += WEEKTOSEC;
        stopTime += WEEKTOSEC;
      };
    }
  });

  console.log('result week', sortedDaily);
};

function sortMonthly ({timeline, datum_point}) {
  let timelineSum = 0;
  let startTime = DateTime.fromSeconds(datum_point).startOf('month').toSeconds();
  let stopTime = DateTime.fromSeconds(datum_point).endOf('month').toSeconds();
  const sortedMonthly = [[]];
  timeline.map(([start, duration]) => {
    const unixStart = datum_point + start + timelineSum;
    const unixStop = unixStart + duration;
    timelineSum += start * 2 + duration;
    let isIn = true;
    while (isIn) {
      if (startTime <= unixStart && unixStop <= stopTime) {
        sortedMonthly[sortedMonthly.length - 1].push([unixStart, unixStop]);
        isIn = false;
      } else if (startTime <= unixStart) {
        //case when start time is between 0:00 and 23:59, but stop time is new date
        //in this case, we will separte the activity into 2 arrays one activity with [start, 23:59], [0:00, stop]
  
        sortedMonthly[sortedMonthly.length - 1].push([unixStart, stopTime]);
        sortedMonthly.push([]);
        sortedMonthly[sortedMonthly.length - 1].push([stopTime + 1, unixStop]);
        isIn = false;
      } else {
        const originalStart = DateTime.fromSeconds(startTime);
        const originalStop = DateTime.fromSeconds(stopTime); 
        startTime = DateTime.fromObject({year: originalStart.year, month: originalStart.month + 1});
        stopTime = DateTime.fromObject({year: originalStop.year, month: originalStop.month + 1});
      };
    }
  });

  console.log('result month', sortedMonthly);
};




export {timelineSort};