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
      const labelVal = secondConverter(value, ["seconds", "minutes", "hours"]);
      data.push({
        value,
        ...subject,
        fill,
        labelVal: `${labelVal.value} ${labelVal.type}`,
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
    const label = date.toFormat(
      viewer === "month" ? "yy/M" : "M/d"
    );
    data.push(val);
    labels.push(label);
  });
  return { data, labels };
}

function updateSubjectsTrendChart(subjects, viewDate, type) {
  const data = [];
  const dates = getDates(viewDate, type, 7);

  dates.map((date) => {
    const label = date.toFormat(
      type === "month" ? "yy/M" : "M/d"
    );
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
  copiedArr.map(({date, ranking}) => {
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

export {
  updateTimeUsagePie,
  updateTimeTrend,
  updateRankingTrend,
  updateSubjectsTrendChart,
};
