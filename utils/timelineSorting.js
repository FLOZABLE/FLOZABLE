const { DateTime } = require("luxon");

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
  groupedSubjects: 
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
  ,
}; */

function timelineSorter(subjects, timezone) {
  try {
    if (!subjects || !subjects.length) {
      return { subjects: [], groupedSubjects: [] };
    }

    subjects.sort((a, b) => a.created_at - b.created_at);

    const groupedSubjects = {};

    const dayStart = DateTime.fromSeconds(subjects[0].created_at, {
      zone: timezone,
    }).startOf("day");
    const weekStart = dayStart.startOf("week");
    const monthStart = dayStart.startOf("month");

    const now = DateTime.now().setZone(timezone).startOf("day");

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

    // Initialize groupedSubjects
    groupedSubjects.day = {
      created_at: dayStart.toISODate(),
      timeline: dayTimeline.map((t) => ({ date: t.date, data: [] })),
      total: dayData.map((d) => ({ date: d.date, data: 0 })),
      focus: dayData.map((d) => ({ date: d.date, data: 0 })),
    };

    groupedSubjects.week = {
      created_at: weekStart.toISODate(),
      timeline: weekTimeline.map((t) => ({ date: t.date, data: [] })),
      total: weekData.map((d) => ({ date: d.date, data: 0 })),
      focus: weekData.map((d) => ({ date: d.date, data: 0 })),
    };

    groupedSubjects.month = {
      created_at: monthStart.toISODate(),
      timeline: monthTimeline.map((t) => ({ date: t.date, data: [] })),
      total: monthData.map((d) => ({ date: d.date, data: 0 })),
      focus: monthData.map((d) => ({ date: d.date, data: 0 })),
    };

    subjects.forEach((subject) => {
      // Initialize subject's timelines
      subject.day = {
        timeline: dayTimeline.map((t) => ({ date: t.date, data: [] })),
        total: dayData.map((d) => ({ date: d.date, data: 0 })),
        focus: dayData.map((d) => ({ date: d.date, data: 0 })),
      };

      subject.week = {
        timeline: weekTimeline.map((t) => ({ date: t.date, data: [] })),
        total: weekData.map((d) => ({ date: d.date, data: 0 })),
        focus: weekData.map((d) => ({ date: d.date, data: 0 })),
      };

      subject.month = {
        timeline: monthTimeline.map((t) => ({ date: t.date, data: [] })),
        total: monthData.map((d) => ({ date: d.date, data: 0 })),
        focus: monthData.map((d) => ({ date: d.date, data: 0 })),
      };

      subject.timeline.forEach(([start, duration]) => {
        const end = start + duration;
        const endDateTime = DateTime.fromSeconds(end, {
          zone: timezone,
        }).startOf("day");

        // Update day data
        const dayIndex = endDateTime.diff(dayStart, "day").days;
        if (dayIndex >= 0 && dayIndex < daysLength) {
          updateTimeline(
            subject.day,
            groupedSubjects.day,
            dayIndex,
            start,
            end,
            duration
          );
        }

        // Update week data
        const weekIndex = endDateTime
          .startOf("week")
          .diff(weekStart, "week").weeks;
        if (weekIndex >= 0 && weekIndex < weeksLength) {
          updateTimeline(
            subject.week,
            groupedSubjects.week,
            weekIndex,
            start,
            end,
            duration
          );
        }

        // Update month data
        const monthIndex = endDateTime
          .startOf("month")
          .diff(monthStart, "month").months;
        if (monthIndex >= 0 && monthIndex < monthsLength) {
          updateTimeline(
            subject.month,
            groupedSubjects.month,
            monthIndex,
            start,
            end,
            duration
          );
        }
      });
    });

    return { subjects, groupedSubjects };
  } catch (err) {
    console.log(err);
    return { subjects: [], groupedSubjects: [] };
  }
}

function updateTimeline(
  subjectPeriod,
  groupedPeriod,
  index,
  start,
  end,
  duration
) {
  subjectPeriod.timeline[index].data.push([start, end]);
  subjectPeriod.total[index].data += duration;
  if (duration > subjectPeriod.focus[index].data) {
    subjectPeriod.focus[index].data = duration;
  }

  groupedPeriod.timeline[index].data.push([start, end]);
  groupedPeriod.total[index].data += duration;
  if (duration > groupedPeriod.focus[index].data) {
    groupedPeriod.focus[index].data = duration;
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

module.exports = { timelineSorter };
