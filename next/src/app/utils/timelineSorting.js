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
 * .daily/weekly/monthly has {maxlength, datum_point, total}
 * datum_point: the earliest datum_point between all the subjects
 * maxlength: get the subjects with the earliest datumpoint and return the dates/months/weeks passed from that datumpoint
 * total: add all the subjects' timeline and divide them based on daily/weekly/monthly
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

  subjects.daily = { maxLength: 0, datum_point: firstDatumPoint, total: [], grouped: [], focus: [] };
  subjects.weekly = { maxLength: 0, datum_point: firstDatumPoint, total: [], grouped: [], focus: [] };
  subjects.monthly = { maxLength: 0, datum_point: firstDatumPoint, total: [], grouped: [], focus: [] };

  subjects.map((subject, i) => {
    subject.daily = {...timelineSorter(subject, 'day', firstDatumPoint)};
    subject.weekly = {...timelineSorter(subject, 'week', firstDatumPoint)};
    subject.monthly = {...timelineSorter(subject, 'month', firstDatumPoint)};

    //fills array only when index is 0d
    if (!i) {
      subjects.daily.grouped = Array(subject.daily.grouped.length).fill([]);
      subjects.weekly.grouped = Array(subject.weekly.grouped.length).fill([]);
      subjects.monthly.grouped = Array(subject.monthly.grouped.length).fill([]);

      subjects.daily.total = Array(subject.daily.total.length).fill(0);
      subjects.weekly.total = Array(subject.weekly.total.length).fill(0);
      subjects.monthly.total = Array(subject.monthly.total.length).fill(0);
    };

    subjects.daily.grouped = subjects.daily.grouped.map((val, i) => {
      return [...val, ...subject.daily.grouped[i]];
    });

    subjects.weekly.grouped = subjects.weekly.grouped.map((val, i) => {
      return [...val, ...subject.weekly.grouped[i]];
    });

    subjects.monthly.grouped = subjects.monthly.grouped.map((val, i) => {
      return [...val, ...subject.monthly.grouped[i]];
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

    subjects.daily.total = subject.daily.total.map((val, i) => {
      return val + subjects.daily.total[i];
    });
    subjects.weekly.total = subject.weekly.total.map((val, i) => {
      return val + subjects.weekly.total[i];
    });
    subjects.monthly.total = subject.monthly.total.map((val, i) => {
      return val + subjects.monthly.total[i];
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


  console.log('timelinex', subjects)
  return subjects;
};

function timelineSorter(subject, mode, firstDatumPoint) {
  const {datum_point, timeline} = subject;
  let total = [0];
  let grouped = [[]];

  let startDatetime = DateTime.fromSeconds(firstDatumPoint).startOf(mode);
  let stopDateTime = startDatetime.plus({[mode]: 1});

  const now = DateTime.now().startOf('day').startOf(mode);
  const expectedLength = now.diff(startDatetime, mode).toObject()[mode + 's'];

  timeline.map(([start, duration]) => {
    const startUnix = datum_point + start;
    const stopUnix = startUnix + duration;

    //console.log(DateTime.fromSeconds(startUnix).toFormat('MM/dd HH:ss'), subject.name)

    while (stopDateTime.toSeconds() < startUnix) {
      total.push(0);
      grouped.push([]);
      stopDateTime = stopDateTime.plus({[mode]: 1});
    };
    total[total.length - 1] += duration;
    grouped[grouped.length - 1].push([startUnix, stopUnix]);
  });

  total = total.concat(Array(expectedLength - total.length + 1).fill(0));
  grouped = grouped.concat(Array(expectedLength - grouped.length + 1).fill([]));

  //console.log(total, grouped, subject.name, total.length, expectedLength)
  return {total, grouped};
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