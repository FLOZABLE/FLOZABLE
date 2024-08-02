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
 * .daily/weekly/monthly has {maxlength, created_at, total}
 * created_at: the earliest created_at between all the subjects
 * maxlength: get the subjects with the earliest datumpoint and return the dates/months/weeks passed from that datumpoint
 * total: add all the subjects' timeline and divide them based on daily/weekly/monthly
 */
import { DateTime } from "luxon";

function timelineSort(subjects) {
  subjects.sort((a, b) => a.created_at - b.created_at);

  const groupedSubjects = {};

  const dayDate = DateTime.fromSeconds(subjects[0].created_at).startOf("day");
  const weekDate = dayDate.startOf("week");
  const monthDate = dayDate.startOf("month");

  const now = DateTime.now().startOf("day");

  const daysLength = now.diff(dayDate, "days").days + 1;
  const weeksLength = now.diff(weekDate.startOf("week"), "weeks").weeks + 1;
  const monthsLength =
    now.diff(monthDate.startOf("month"), "months").months + 1;

  const dailyArray = [];
  for (let i = 0; i < daysLength; i++) {
    dailyArray.push({ date: dayDate.plus({ day: i }).toISODate(), data: 0 });
  }

  const weeklyArray = [];
  for (let i = 0; i < weeksLength; i++) {
    weeklyArray.push({
      date: weekDate.plus({ week: i }).toISODate(),
      data: 0,
    });
  }

  const monthlyArray = [];
  for (let i = 0; i < monthsLength; i++) {
    monthlyArray.push({
      date: monthDate.plus({ month: i }).toISODate(),
      data: 0,
    });
  }

  groupedSubjects.daily = {
    created_at: dayDate.toISODate(),
    timeline: JSON.parse(
      JSON.stringify(dailyArray.map((val) => ({ ...val, data: [] })))
    ),
    total: JSON.parse(JSON.stringify(dailyArray)),
    focus: JSON.parse(JSON.stringify(dailyArray)),
  };

  groupedSubjects.weekly = {
    created_at: weekDate.toISODate(),
    timeline: JSON.parse(
      JSON.stringify(weeklyArray.map((val) => ({ ...val, data: [] })))
    ),
    total: JSON.parse(JSON.stringify(weeklyArray)),
    focus: JSON.parse(JSON.stringify(weeklyArray)),
  };

  groupedSubjects.monthly = {
    created_at: monthDate.toISODate(),
    timeline: JSON.parse(
      JSON.stringify(monthlyArray.map((val) => ({ ...val, data: [] })))
    ),
    total: JSON.parse(JSON.stringify(monthlyArray)),
    focus: JSON.parse(JSON.stringify(monthlyArray)),
  };

  subjects.map((subject) => {
    subject.daily = {
      timeline: JSON.parse(
        JSON.stringify(dailyArray.map((val) => ({ ...val, data: [] })))
      ),
      total: JSON.parse(JSON.stringify(dailyArray)),
      focus: JSON.parse(JSON.stringify(dailyArray)),
    };

    subject.weekly = {
      timeline: JSON.parse(
        JSON.stringify(weeklyArray.map((val) => ({ ...val, data: [] })))
      ),
      total: JSON.parse(JSON.stringify(weeklyArray)),
      focus: JSON.parse(JSON.stringify(weeklyArray)),
    };

    subject.monthly = {
      timeline: JSON.parse(
        JSON.stringify(monthlyArray.map((val) => ({ ...val, data: [] })))
      ),
      total: JSON.parse(JSON.stringify(monthlyArray)),
      focus: JSON.parse(JSON.stringify(monthlyArray)),
    };

    subject.timeline.map(([start, duration]) => {
      const startDateTime = DateTime.fromSeconds(start).startOf("day");
      const dayIndex = subject.daily.timeline.findIndex(
        (day) => day.date === startDateTime.toISODate()
      );
      if (dayIndex !== -1) {
        subject.daily.timeline[dayIndex].data.push([start, start + duration]);
        subject.daily.total[dayIndex].data += duration;
        if (duration > subject.daily.focus[dayIndex].data) {
          subject.daily.focus[dayIndex].data = duration;
        }

        //grouped subjects
        groupedSubjects.daily.timeline[dayIndex].data.push([
          start,
          start + duration,
        ]);
        groupedSubjects.daily.total[dayIndex].data += duration;
        if (duration > groupedSubjects.daily.focus[dayIndex].data) {
          groupedSubjects.daily.focus[dayIndex].data = duration;
        }
      }

      const weekIndex = subject.weekly.timeline.findIndex(
        (day) => day.date === startDateTime.startOf("week").toISODate()
      );
      if (weekIndex !== -1) {
        subject.weekly.timeline[weekIndex].data.push([start, start + duration]);
        subject.weekly.total[weekIndex].data += duration;
        if (duration > subject.weekly.focus[weekIndex].data) {
          subject.weekly.focus[weekIndex].data = duration;
        }

        //grouped subjects
        groupedSubjects.weekly.timeline[weekIndex].data.push([
          start,
          start + duration,
        ]);
        groupedSubjects.weekly.total[weekIndex].data += duration;
        if (duration > groupedSubjects.weekly.focus[weekIndex].data) {
          groupedSubjects.weekly.focus[weekIndex].data = duration;
        }
      }

      const monthIndex = subject.monthly.timeline.findIndex(
        (day) => day.date === startDateTime.startOf("month").toISODate()
      );
      if (monthIndex !== -1) {
        subject.monthly.timeline[monthIndex].data.push([
          start,
          start + duration,
        ]);
        subject.monthly.total[monthIndex].data += duration;
        if (duration > subject.monthly.focus[monthIndex].data) {
          subject.monthly.focus[monthIndex].data = duration;
        }

        //grouped subjects
        groupedSubjects.monthly.timeline[monthIndex].data.push([
          start,
          start + duration,
        ]);
        groupedSubjects.monthly.total[monthIndex].data += duration;
        if (duration > groupedSubjects.monthly.focus[monthIndex].data) {
          groupedSubjects.monthly.focus[monthIndex].data = duration;
        }
      }
    });
  });

  console.log(subjects, groupedSubjects, "gd");
  return { subjects, groupedSubjects };
}

export { timelineSort };
