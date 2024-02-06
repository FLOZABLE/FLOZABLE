const { DateTime } = require("luxon");
const { subjectsTimelineCache } = require("../services/redisLoader");
const { timelineSort } = require("../timelineSorting");
const { default: QuickChart } = require("quickchart-js");
const { hex2rgb } = require("../tool");


async function dailyReport(userId, timezone) {
  const subjects = await subjectsTimelineCache(userId);
  const sortedSubjects = timelineSort(subjects);
  const subjectsInformation = sortedSubjects.map(subject => {
    const [total] = subject.daily.total.slice(-1);
    const {r, g, b} = hex2rgb(subject.color);
    return { name: subject.name, color: `rgb(${r}, ${g}, ${b})`, total };
  });

  const dailyTrend = subjects.daily.groupedTotal.slice(-7);
  console.log(subjectsInformation, dailyTrend);
  const now = DateTime.now().setZone(timezone);
  const dailyTrendLabels = [];
  for (let i = 0; i < dailyTrend.length; i++) {
    dailyTrendLabels.push(now.minus({ day: i }).toFormat('M/d'));
  };

  dailyTrendLabels.reverse();

  const dailyTrendChart = {
    type: 'line',
    data: {
      labels: dailyTrendLabels,
      datasets: [{
        label: 'Hours',
        data: dailyTrend
      }]
    }
  };

  const subjectsPie = {
    type: "pie",
    data: {
      datasets: [
        {
          data: subjectsInformation.map(subject => { return subject.total }),
          backgroundColor: subjectsInformation.map(subject => { return subject.color })
        }
      ],
      labels: subjectsInformation.map(subject => { return subject.name })
    },
    options: {
      legend: {
        display: true,
      },
      scales: {
        xAxes: [
          {
            display: false,
          }
        ],
        yAxes: []
      },
      plugins: {
        datalabels: {
          display: false,
        },
      },
    }
  }
  /* const dailyTrendChart = new QuickChart();
  dailyTrendChart.setConfig(dailyTrendChartConfig);

  console.log(dailyTrendChart.getUrl) */
  const subjectsURL = "https://quickchart.io/chart?c=" + JSON.stringify(subjectsPie);
  const dailyTrendURL = "https://quickchart.io/chart?c=" + JSON.stringify(dailyTrendChart);
  console.log(dailyTrendURL, subjectsURL)
};

function weeklyReport() {

};

module.exports = { dailyReport };