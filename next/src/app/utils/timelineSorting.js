import { DateTime } from "luxon";

/** function for sorting the timeline
 * return structure
 */


/* const example = {
  subjects: [
    {
      subject_id: "",
      color,
      created_at: 1,
      timeline: [[start, duration]],
      day: {
        timeline: [{ date: "2024-1-1", data: [[start, duration]] }],
        total: [{ date: "2024-1-1", data: 0 }],
        focus: [{ date: "2024-1-1", data: 0 }],
      },
      week: {
        timeline: [{ date: "2024-1-1", data: [[start, duration]] }],
        total: [{ date: "2024-1-1", data: 0 }],
        focus: [{ date: "2024-1-1", data: 0 }],
      },
      month: {
        timeline: [{ date: "2024-1-1", data: [[start, duration]] }],
        total: [{ date: "2024-1-1", data: 0 }],
        focus: [{ date: "2024-1-1", data: 0 }],
      },
    },
  ],
  groupedSubjects: [
    {
      day: {
        timeline: [{ date: "2024-1-1", data: [[start, duration]] }],
        total: [{ date: "2024-1-1", data: 0 }],
        focus: [{ date: "2024-1-1", data: 0 }],
      },
      week: {
        timeline: [{ date: "2024-1-1", data: [[start, duration]] }],
        total: [{ date: "2024-1-1", data: 0 }],
        focus: [{ date: "2024-1-1", data: 0 }],
      },
      month: {
        timeline: [{ date: "2024-1-1", data: [[start, duration]] }],
        total: [{ date: "2024-1-1", data: 0 }],
        focus: [{ date: "2024-1-1", data: 0 }],
      },
    },
  ],
}; */

function timelineSorter(subjects) {
  try {
    if (!subjects || !subjects.length) {
      return { subjects: [], groupedSubjects: [] };
    }

    subjects.sort((a, b) => a.created_at - b.created_at);

    const groupedSubjects = {};

    const dayStart = DateTime.fromSeconds(subjects[0].created_at).startOf(
      "day"
    );
    const weekStart = dayStart.startOf("week");
    const monthStart = dayStart.startOf("month");

    const now = DateTime.now().startOf("day");

    //console.log("test tq", dayStart.toSeconds(), now.toSeconds()); tq

    const daysLength = now.diff(dayStart, "days").days + 1;
    const weeksLength = now.startOf("week").diff(weekStart, "weeks").weeks + 1;
    const monthsLength =
      now.startOf("month").diff(monthStart, "months").months + 1;

    const { dataArray: dayData, timelineArray: dayTimeline } = arrayGenerator(
      daysLength,
      dayStart,
      "day"
    );

    const { dataArray: weekData, timelineArray: weekTimeline } = arrayGenerator(
      weeksLength,
      weekStart,
      "week"
    );

    const { dataArray: monthData, timelineArray: monthTimeline } =
      arrayGenerator(monthsLength, monthStart, "month");

    groupedSubjects.day = {
      created_at: dayStart.toISODate(),
      timeline: structuredClone(dayTimeline),
      total: structuredClone(dayData),
      focus: structuredClone(dayData),
    };

    groupedSubjects.week = {
      created_at: weekStart.toISODate(),
      timeline: structuredClone(weekTimeline),
      total: structuredClone(weekData),
      focus: structuredClone(weekData),
    };

    groupedSubjects.month = {
      created_at: monthStart.toISODate(),
      timeline: structuredClone(monthTimeline),
      total: structuredClone(monthData),
      focus: structuredClone(monthData),
    };

    subjects.map((subject) => {
      subject.day = {
        timeline: structuredClone(dayTimeline),
        total: structuredClone(dayData),
        focus: structuredClone(dayData),
      };

      subject.week = {
        timeline: structuredClone(weekTimeline),
        total: structuredClone(weekData),
        focus: structuredClone(weekData),
      };

      subject.month = {
        timeline: structuredClone(monthTimeline),
        total: structuredClone(monthData),
        focus: structuredClone(monthData),
      };

      subject.timeline.forEach(([start, duration]) => {
        const endDateTime = DateTime.fromSeconds(start + duration).startOf(
          "day"
        );
        const dayIndex = endDateTime.diff(dayStart, "day").days;

        if (subject.day.timeline[dayIndex]) {
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

        const weekIndex = endDateTime
          .startOf("week")
          .diff(weekStart, "week").weeks;

        if (subject.week.timeline[weekIndex]) {
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

        const monthIndex = endDateTime
          .startOf("month")
          .diff(monthStart, "month").months;
        if (subject.month.timeline[monthIndex]) {
          subject.month.timeline[monthIndex].data.push([
            start,
            start + duration,
          ]);
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

    return { subjects, groupedSubjects };
  } catch (err) {
    console.log(err);
    return { subjects: [], groupedSubjects: [] };
  }
}

function arrayGenerator(length, date, mode) {
  try {
    const dataArray = Array.from({ length }, (_, i) => {
      return { date: date.plus({ [mode]: i }).toISODate(), data: 0 };
    });

    const timelineArray = dataArray.map((day) => ({ ...day, data: [] }));
    return { dataArray, timelineArray };
  } catch (err) {
    console.log(err);
    return { dataArray: [], timelineArray: [] };
  }
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
      timeline: structuredClone(
        dailyArray.map((val) => ({ ...val, data: [] }))
      ),
      total: structuredClone(dailyArray),
      focus: structuredClone(dailyArray),
    };

    subject.week = {
      timeline: structuredClone(
        weeklyArray.map((val) => ({ ...val, data: [] }))
      ),
      total: structuredClone(weeklyArray),
      focus: structuredClone(weeklyArray),
    };

    subject.month = {
      timeline: structuredClone(
        monthlyArray.map((val) => ({ ...val, data: [] }))
      ),
      total: structuredClone(monthlyArray),
      focus: structuredClone(monthlyArray),
    };

    subjects.push(subject);
    return subjects;
  } catch (err) {
    console.log(err);
    return subjects;
  }
}

export { timelineSorter, sortNewSubject };
