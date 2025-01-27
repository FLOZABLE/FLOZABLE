import { DateTime } from "luxon";
import { coldColorsList, SUBJECTS_PIE_COLORS } from "./Constant";
import { getDates, secondConverter } from "./Tool";

//time usage pie
function updateTimeUsagePie(subjects, viewDate, type) {
  const data = [];
  const viewDateTime = DateTime.fromJSDate(viewDate)
    .startOf("day")
    .startOf(type);

  subjects.map((subject) => {
    const date = subject[type].total.find(
      (day) => day.date === viewDateTime.toISODate()
    );
    if (date) {
      const fill =
        SUBJECTS_PIE_COLORS[data.length % SUBJECTS_PIE_COLORS.length];
      const value = date.data;
      const labelVal = secondConverter({
        sec: value,
        options: ["seconds", "minutes", "hours"],
      });
      data.push({
        value,
        ...subject,
        fill,
        labelVal,
      });
    }
  });

  return data;
}

function updateTimeTrend(subjects, mode, sum) {
  const data = [];
  const labels = [];
  const datumPoint = DateTime.fromSeconds(subjects[mode].created_at);
  subjects[mode].total.map((val, i) => {
    const date = datumPoint.plus({ [sum]: i });
    const label = date.toFormat(viewer === "month" ? "yy/M" : "M/d");
    data.push(val);
    labels.push(label);
  });
  return { data, labels };
}

function updateSubjectsTrendChart(subjects, viewDate, type) {
  const data = [];
  const dates = getDates(viewDate, type, 7);

  dates.map((date) => {
    const label = date.toFormat(type === "month" ? "yy/M" : "M/d");
    const subjectData = updateTimeUsagePie(subjects, date.toJSDate(), type);
    const day = {
      label,
    };
    subjectData.map((subject) => {
      day[subject.subject_id] = subject.value;
    });
    data.push(day);
  });
  return data;
}

function updateRankingTrend(rankings, viewer, maxLength) {
  const data = [];
  const copiedArr = JSON.parse(JSON.stringify(rankings));
  copiedArr.map(({ date, ranking }) => {
    const label = DateTime.fromSeconds(date).toFormat(
      viewer === "month" ? "yy/M" : "M/d"
    );
    if (ranking === -1) {
      data.push({ ranking: maxLength, label });
    } else {
      data.push({ ranking, label });
    }
  });

  return data;
}

function getAnalysis(viewer, viewDate, subjects) {
  if (!viewer || !viewDate || !subjects) return;

  const now = DateTime.now();
  let viewDateTime = DateTime.fromJSDate(viewDate);

  const data = [];

  let label1 =
    viewer === "week"
      ? `${viewDateTime.startOf("week").toFormat("M/d")} - ${viewDateTime
          .endOf("week")
          .toFormat("M/d")}`
      : viewDateTime.toFormat(viewer === "month" ? "yy/M" : "M/d");

  //if same day, move it to prev day/week/month
  if (viewDateTime.hasSame(now, viewer) && viewDateTime.hasSame(now, "year")) {
    viewDateTime = viewDateTime.minus({ [viewer]: 1 });
  }

  //is today/this week/month
  const yesterday = now.minus({ [viewer]: 1 });
  if (
    viewDateTime.hasSame(yesterday, viewer) &&
    viewDateTime.hasSame(yesterday, "year")
  ) {
    label1 =
      viewer === "day"
        ? "Yesterday"
        : viewer === "week"
        ? "Last week"
        : "Last month";
  }

  data.push({ label: label1, date: viewDateTime, total: 0 });

  const label2 =
    viewer === "day" ? "Today" : viewer === "week" ? "This week" : "This month";
  data.push({ label: label2, date: now, total: 0 });

  data.map((day, i) => {
    subjects.map((subject) => {
      const selectedDay = subject[viewer].total.find((dataDay) =>
        DateTime.fromISO(dataDay.date).hasSame(day.date, viewer)
      );
      const value = selectedDay?.data ?? 0;
      console.log(value);
      day[subject.name] = value;
      day.total += value;
    });
  });

  let summary;
  const diff = data[1].total - data[0].total;
  const formattedDiff = secondConverter({
    sec: Math.abs(diff),
    options: ["seconds", "minutes", "hours"],
  });
  
  if (diff > 0) {
    summary = `Compared to yesterday, you studied ${formattedDiff} more! Keep up the great work!`;
  } else {
    summary = `You studied ${formattedDiff} less than yesterday. Try to regain your streak!`;
  }

  return { data, summary };
}

export {
  updateTimeUsagePie,
  updateTimeTrend,
  updateRankingTrend,
  updateSubjectsTrendChart,
  getAnalysis,
};
