import { DateTime } from "luxon";
import { coldColorsList, SUBJECTS_PIE_COLORS } from "./Constant";
import { secondConverter } from "./Tool";

//time usage pie
function updateTimeUsagePie(subjects, viewDate, type) {
  const data = [];
  const now = DateTime.now().startOf("day").startOf(type);
  const viewDateTime = DateTime.fromJSDate(viewDate)
    .startOf("day")
    .startOf(type);

  if (type === "day") {
    subjects.map((subject) => {
      const { daily } = subject;
      const index = daily.total.length - now.diff(viewDateTime).days - 1;
      console.log(index, viewDate)
      const value = daily.total[index];
      if (value) {
        const fill =
          SUBJECTS_PIE_COLORS[data.length % SUBJECTS_PIE_COLORS.length];
        const labelVal = secondConverter(value, [
          "seconds",
          "minutes",
          "hours",
        ]);
        data.push({
          value,
          ...subject,
          fill,
          labelVal: `${labelVal.value} ${labelVal.type}`,
        });
      }
    });
  } else if (type === "week") {
    subjects.map((subject) => {
      const { daily } = subject;
      const index = daily.total.length - now.diff(viewDateTime).weeks - 1;
      const value = daily.total[index];
      if (value) {
        const fill =
          SUBJECTS_PIE_COLORS[data.length % SUBJECTS_PIE_COLORS.length];
        const labelVal = secondConverter(value, [
          "seconds",
          "minutes",
          "hours",
        ]);
        data.push({
          value,
          ...subject,
          fill,
          labelVal: `${labelVal.value} ${labelVal.type}`,
        });
      }
    });
  } else {
    subjects.map((subject) => {
      const { daily } = subject;
      const index = daily.total.length - now.diff(viewDateTime).months - 1;
      const value = daily.total[index];
      if (value) {
        const fill =
          SUBJECTS_PIE_COLORS[data.length % SUBJECTS_PIE_COLORS.length];
        const labelVal = secondConverter(value, [
          "seconds",
          "minutes",
          "hours",
        ]);
        data.push({
          value,
          ...subject,
          fill,
          labelVal: `${labelVal.value} ${labelVal.type}`,
        });
      }
    });
  }
  return data;
}

function updateTimeTrend(subjects, mode, sum) {
  const data = [];
  const labels = [];
  const datumPoint = DateTime.fromSeconds(subjects[mode].created_at);
  subjects[mode].total.map((val, i) => {
    const date = datumPoint.plus({ [sum]: i });
    const label = `${date.month}/${date.day}`;
    data.push(val);
    labels.push(label);
  });
  return { data, labels };
}

function updateSubjectsTrendChart(subjects, viewDate, type) {
  const data = [];
  const now = DateTime.now().startOf("day").startOf(type);
  let datumPoint = DateTime.fromJSDate(viewDate).startOf("day").startOf(type);
  const diff = datumPoint.diff(now, type).toObject()[type + "s"];
  if (diff > -7) {
    datumPoint = now.minus({ [type + "s"]: 6 });
  }
  for (let i = 0; i < 7; i++) {
    const date = datumPoint.plus({ [type + "s"]: i });
    console.log(date)
    const label = `${date.month}/${date.day}`;

    const subjectData = updateTimeUsagePie(subjects, date.toJSDate(), type);
    const dayObj = {
      data: subjectData,
      label,
    };
    data.push(dayObj);
  }
  return data;
}

function updateRankingTrend(rankings, maxLength) {
  const data = [];
  const copiedArr = JSON.parse(JSON.stringify(rankings));
  copiedArr.map((rankingData) => {
    const { date, ranking } = rankingData;
    const label = DateTime.fromSeconds(date).toISODate();
    //const label = DateTime.fromSeconds(date).toFormat('M/d');
    if (ranking === -1) {
      data.push({ ranking: maxLength, label });
    } else {
      data.push({ ranking, label });
    }
  });

  return data;
}

export {
  updateTimeUsagePie,
  updateTimeTrend,
  updateRankingTrend,
  updateSubjectsTrendChart,
};
