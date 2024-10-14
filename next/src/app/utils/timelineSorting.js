/** function for sorting the timeline
 * return structure
 * index 0~n is modified subject info
 * about index:
 * color: original
 * day/week/month:
 *    .grouped: timeline divided into day/week/month
 *    .total: total time divided into day/week/month
 *
 * part2
 * .day/week/month has {maxlength, created_at, total}
 * created_at: the earliest created_at between all the subjects
 * maxlength: get the subjects with the earliest datumpoint and return the dates/months/weeks passed from that datumpoint
 * total: add all the subjects' timeline and divide them based on day/week/month
 */
import { DateTime } from "luxon";

function timelineSort(subjects) {
  if (!subjects || !subjects.length)
    return { subjects: [], groupedSubjects: [] };

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

  groupedSubjects.day = {
    created_at: dayDate.toISODate(),
    timeline: JSON.parse(
      JSON.stringify(dailyArray.map((val) => ({ ...val, data: [] })))
    ),
    total: JSON.parse(JSON.stringify(dailyArray)),
    focus: JSON.parse(JSON.stringify(dailyArray)),
  };

  groupedSubjects.week = {
    created_at: weekDate.toISODate(),
    timeline: JSON.parse(
      JSON.stringify(weeklyArray.map((val) => ({ ...val, data: [] })))
    ),
    total: JSON.parse(JSON.stringify(weeklyArray)),
    focus: JSON.parse(JSON.stringify(weeklyArray)),
  };

  groupedSubjects.month = {
    created_at: monthDate.toISODate(),
    timeline: JSON.parse(
      JSON.stringify(monthlyArray.map((val) => ({ ...val, data: [] })))
    ),
    total: JSON.parse(JSON.stringify(monthlyArray)),
    focus: JSON.parse(JSON.stringify(monthlyArray)),
  };

  subjects.map((subject) => {
    subject.day = {
      timeline: JSON.parse(
        JSON.stringify(dailyArray.map((val) => ({ ...val, data: [] })))
      ),
      total: JSON.parse(JSON.stringify(dailyArray)),
      focus: JSON.parse(JSON.stringify(dailyArray)),
    };

    subject.week = {
      timeline: JSON.parse(
        JSON.stringify(weeklyArray.map((val) => ({ ...val, data: [] })))
      ),
      total: JSON.parse(JSON.stringify(weeklyArray)),
      focus: JSON.parse(JSON.stringify(weeklyArray)),
    };

    subject.month = {
      timeline: JSON.parse(
        JSON.stringify(monthlyArray.map((val) => ({ ...val, data: [] })))
      ),
      total: JSON.parse(JSON.stringify(monthlyArray)),
      focus: JSON.parse(JSON.stringify(monthlyArray)),
    };

    subject.timeline.map(([start, duration]) => {
      const endDateTime = DateTime.fromSeconds(start + duration).startOf("day");
      const dayIndex = subject.day.timeline.findIndex(
        (day) => day.date === endDateTime.toISODate()
      );
      if (dayIndex !== -1) {
        subject.day.timeline[dayIndex].data.push([start, start + duration]);
        subject.day.total[dayIndex].data += duration;
        if (duration > subject.day.focus[dayIndex].data) {
          subject.day.focus[dayIndex].data = duration;
        }

        //grouped subjects
        groupedSubjects.day.timeline[dayIndex].data.push([
          start,
          start + duration,
        ]);
        groupedSubjects.day.total[dayIndex].data += duration;
        if (duration > groupedSubjects.day.focus[dayIndex].data) {
          groupedSubjects.day.focus[dayIndex].data = duration;
        }
      }

      const weekIndex = subject.week.timeline.findIndex(
        (day) => day.date === endDateTime.startOf("week").toISODate()
      );
      if (weekIndex !== -1) {
        subject.week.timeline[weekIndex].data.push([start, start + duration]);
        subject.week.total[weekIndex].data += duration;
        if (duration > subject.week.focus[weekIndex].data) {
          subject.week.focus[weekIndex].data = duration;
        }

        //grouped subjects
        groupedSubjects.week.timeline[weekIndex].data.push([
          start,
          start + duration,
        ]);
        groupedSubjects.week.total[weekIndex].data += duration;
        if (duration > groupedSubjects.week.focus[weekIndex].data) {
          groupedSubjects.week.focus[weekIndex].data = duration;
        }
      }

      const monthIndex = subject.month.timeline.findIndex(
        (day) => day.date === endDateTime.startOf("month").toISODate()
      );
      if (monthIndex !== -1) {
        subject.month.timeline[monthIndex].data.push([start, start + duration]);
        subject.month.total[monthIndex].data += duration;
        if (duration > subject.month.focus[monthIndex].data) {
          subject.month.focus[monthIndex].data = duration;
        }

        //grouped subjects
        groupedSubjects.month.timeline[monthIndex].data.push([
          start,
          start + duration,
        ]);
        groupedSubjects.month.total[monthIndex].data += duration;
        if (duration > groupedSubjects.month.focus[monthIndex].data) {
          groupedSubjects.month.focus[monthIndex].data = duration;
        }
      }
    });
  });

  console.log(subjects, groupedSubjects, "timelinesorter");
  return { subjects, groupedSubjects };
}

function sortNewSubject(subjects, subject) {
  try {
    subjects.sort((a, b) => a.created_at - b.created_at);

    const dayDate = DateTime.fromSeconds(subjects[0].created_at).startOf("day");
    const weekDate = dayDate.startOf("week");
    const monthDate = dayDate.startOf("month");

    const daysLength = subjects[0].day.total.length;
    const weeksLength = subjects[0].week.total.length;
    const monthsLength = subjects[0].month.total.length;

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

    subject.day = {
      timeline: JSON.parse(
        JSON.stringify(dailyArray.map((val) => ({ ...val, data: [] })))
      ),
      total: JSON.parse(JSON.stringify(dailyArray)),
      focus: JSON.parse(JSON.stringify(dailyArray)),
    };

    subject.week = {
      timeline: JSON.parse(
        JSON.stringify(weeklyArray.map((val) => ({ ...val, data: [] })))
      ),
      total: JSON.parse(JSON.stringify(weeklyArray)),
      focus: JSON.parse(JSON.stringify(weeklyArray)),
    };

    subject.month = {
      timeline: JSON.parse(
        JSON.stringify(monthlyArray.map((val) => ({ ...val, data: [] })))
      ),
      total: JSON.parse(JSON.stringify(monthlyArray)),
      focus: JSON.parse(JSON.stringify(monthlyArray)),
    };

    subjects.push(subject);
    return subjects;
  } catch (err) {
    console.log(err);
    return subjects;
  }
}

export { timelineSort, sortNewSubject };
