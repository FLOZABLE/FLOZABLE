const { DateTime } = require("luxon");
const { subjectsTimelineCache, websiteUsageCache } = require("../services/redisLoader");
const { timelineSort } = require("../timelineSorting");
const { hex2rgb, secondConverter } = require("../tool");
const QuickChart = require('quickchart-js');
const { colorsList } = require("../Constant");

async function dailyReport(userId, timezone) {
  const subjects = await subjectsTimelineCache(userId);
  const websiteUsage = await websiteUsageCache(userId);
  console.log(websiteUsage);

  const sortedSubjects = timelineSort(subjects);
  const subjectsDatasets = sortedSubjects.map(subject => {
    const [total] = subject.daily.total.slice(-1);
    const {r, g, b} = hex2rgb(subject.color);
    return { name: subject.name, color: `rgb(${r}, ${g}, ${b})`, total };
  });

  const dailyTrend = subjects.daily.groupedTotal.slice(-7);
  const now = DateTime.now().setZone(timezone);
  const dailyTrendLabels = [];
  for (let i = 0; i < dailyTrend.length; i++) {
    dailyTrendLabels.push(now.minus({ day: i }).toFormat('M/d'));
  };

  dailyTrendLabels.reverse();

  const dailyTrendConfig = {
    type: 'line',
    data: {
      labels: dailyTrendLabels,
      datasets: [{
        label: 'Time',
        data: dailyTrend,
      }]
    },
    options: {
      scales: {
        yAxes: [{
          ticks: {
            callback: (sec) => {
              let value = sec ? sec : 0;
              let type = 's';
              if (sec >= 60 * 60) {
                value = (sec / (60 * 60)).toFixed(2);
                type = 'h';
              } else if (sec > 60) {
                value = Math.floor(sec / 60);
                type = 'm';
              };
            
              return (
                value + type
              );
            }
          },
        }],
      },
    }
  };

  const subjectsConfig = {
    type: "pie",
    data: {
      datasets: [
        {
          data: subjectsDatasets.map(subject => { return subject.total }),
          backgroundColor: subjectsDatasets.map(subject => { return subject.color })
        }
      ],
      labels: subjectsDatasets.map(subject => { return subject.name })
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
  };

  const websitesConfig = {
    type: "pie",
    data: {
      datasets: [
        {
          data: websiteUsage.map(website => { return website.t }),
          backgroundColor: colorsList
        }
      ],
      labels: websiteUsage.map(website => { return website.d }),
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
  };
  /* const dailyTrendChart = new QuickChart();
  dailyTrendChart.setConfig(dailyTrendChartConfig);

  console.log(dailyTrendChart.getUrl) */
  /* const subjectsURL = "https://quickchart.io/chart?c=" + JSON.stringify(subjectsPie);
  const dailyTrendURL = "https://quickchart.io/chart?c=" + JSON.stringify(dailyTrendChart); */

  const subjectPieChart = new QuickChart();
  subjectPieChart.setConfig(subjectsConfig);

  const dailyTrendChart = new QuickChart();
  dailyTrendChart.setConfig(dailyTrendConfig);

  const websiteChart = new QuickChart();
  websiteChart.setConfig(websitesConfig);

  console.log(subjectPieChart.getUrl())
  console.log(dailyTrendChart.getUrl())
  console.log(websiteChart.getUrl())
};

function weeklyReport() {

};

module.exports = { dailyReport };