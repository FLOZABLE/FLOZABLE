const { DateTime } = require("luxon");

/** function for sorting the timeline
 * return structure
 */

/*  {
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
  groupedSubjects: [],
}; */
function timelineSorter(subjects, timezone) {
  try {
    if (!subjects?.length) {
      return { subjects: [], groupedSubjects: {} };
    }

    const firstSubjectTime = subjects[0].created_at;
    const now = DateTime.now().setZone(timezone);

    const periods = {
      day: {
        start: DateTime.fromSeconds(firstSubjectTime, {
          zone: timezone,
        }).startOf("day"),
        diff: "days",
        unit: "day",
      },
      week: {
        start: DateTime.fromSeconds(firstSubjectTime, {
          zone: timezone,
        }).startOf("week"),
        diff: "weeks",
        unit: "week",
      },
      month: {
        start: DateTime.fromSeconds(firstSubjectTime, {
          zone: timezone,
        }).startOf("month"),
        diff: "months",
        unit: "month",
      },
    };

    // Deep cloning function to create completely independent copies
    const deepClone = (obj) => {
      if (obj === null || typeof obj !== "object") return obj;

      if (Array.isArray(obj)) {
        return obj.map(deepClone);
      }

      const clone = {};
      for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
          clone[key] = deepClone(obj[key]);
        }
      }
      return clone;
    };

    // Memoize timeline creation
    const timelineCache = {};
    const createTimelineArray = (start, length, unit) => {
      const cacheKey = `${start.toISODate()}_${length}_${unit}`;
      if (!timelineCache[cacheKey]) {
        timelineCache[cacheKey] = Array.from({ length }, (_, i) => {
          const date = start.plus({ [unit]: i }).toISODate();
          return { date, data: 0 };
        });
      }
      return deepClone(timelineCache[cacheKey]);
    };

    // Preallocate grouped subjects structure
    const groupedSubjects = {};
    for (const [key, { start, diff, unit }] of Object.entries(periods)) {
      const length = now.startOf(unit).diff(start, diff).toObject()[diff] + 1;

      groupedSubjects[key] = {
        created_at: start.toISODate(),
        timeline: createTimelineArray(start, length, unit).map(({ date }) => ({
          date,
          data: [],
        })),
        total: createTimelineArray(start, length, unit),
        focus: createTimelineArray(start, length, unit),
      };
    }

    // Process timeline for each subject with deep cloning
    const processedSubjects = subjects.map((subject) => {
      // Create deep clones of grouped subjects for each subject
      const subjectData = {
        ...subject, // Preserve original subject properties including color
        day: deepClone(groupedSubjects.day),
        week: deepClone(groupedSubjects.week),
        month: deepClone(groupedSubjects.month),
      };

      subject.timeline.forEach(([start, duration]) => {
        const updatePeriodGroups = (periodKey, unitStartFn) => {
          const periodData = subjectData[periodKey];

          const unitStart = unitStartFn(start + duration);
          const periodIndex = periodData.timeline.findIndex(
            ({ date }) => date === unitStart.toISODate()
          );

          if (periodIndex !== -1) {
            const end = start + duration;

            // Update subject's period data
            periodData.timeline[periodIndex].data.push([start, end]);
            periodData.total[periodIndex].data += duration;
            periodData.focus[periodIndex].data = Math.max(
              periodData.focus[periodIndex].data,
              duration
            );
          }
        };

        updatePeriodGroups("day", (timestamp) =>
          DateTime.fromSeconds(timestamp, { zone: timezone }).startOf("day")
        );

        updatePeriodGroups("week", (timestamp) =>
          DateTime.fromSeconds(timestamp, { zone: timezone }).startOf("week")
        );

        updatePeriodGroups("month", (timestamp) =>
          DateTime.fromSeconds(timestamp, { zone: timezone }).startOf("month")
        );
      });

      return subjectData;
    });

    return {
      subjects: processedSubjects,
      groupedSubjects,
    };
  } catch (err) {
    console.error("Error in newTimelineSorter:", err);
    return { subjects: [], groupedSubjects: {} };
  }
}

module.exports = { timelineSorter };
