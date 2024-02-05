import React, { useState, useEffect, useRef } from 'react';
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBook, faFire, faGlobe, faRankingStar } from '@fortawesome/free-solid-svg-icons';
import PieChart from '../../UI/PieChart';
import LineChart from '../../UI/LineChart';
import BarChart from '../../UI/BarChart';
import StuckModal from '../../UI/StuckModal/StuckModal';
import Timeline from '../../UI/Timeline/Timeline';
import RadioBtn from '../../UI/RadioBtn/RadioBtn';
import ChartDataLabel from 'chartjs-plugin-datalabels';
import { colorsList } from '../../../constant';
import styles from './Stats.module.css';
import { plugins } from 'chart.js';
import { updateTimeUsagePie, updateHourlyMatrix, updateHourlyHistogram, updateTimeTrend, updateRankingTrend } from './StatTools';
import DateSelectorBtn from '../../UI/DateSelectorBtn/DateSelectorBtn';
import { DateTime } from 'luxon';
import CalendarModal from '../../UI/CalendarModal/CalendarModal';
import { secondConverter } from '../../../utils/Tool';
import ExtensionPie from '../../UI/ExtensionPie/ExtensionPie';
import DropDownButton from '../../UI/DropDownButton/DropDownButton';

import ApexChart from 'apexcharts';
import Chart from 'react-apexcharts';

const serverOrigin = process.env.REACT_APP_ORIGIN;

function Stats(props) {
  const { subjects } = props;
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  const [statsViewer, setStatsViewer] = useState('Daily');
  const [viewDate, setViewDate] = useState(new Date(new Date().setHours(0, 0, 0, 0)));
  const [calendarLabel, setCalendarLabel] = useState('Today');
  const [dailyTimeline, setDailyTimeline] = useState([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [totalStudy, setTotalStudy] = useState("");
  const [focus, setFocus] = useState("");
  const [ranking, setRanking] = useState(0);
  const [rankings, setRankings] = useState(0);
  const [websites, setWebsites] = useState([]);
  const [viewOption, setViewOption] = useState(0);
  const [websitesUsage, setWebsitesUsage] = useState(0);
  const [websitesVisit, setWebsitesVisit] = useState(0);

  //time usage pie chart
  const [timeUsagePie, setTimeUsagePie] = useState({
    labels: [], datasets: [
      {
        label: [],
        backgroundColor: colorsList,
        borderColor: colorsList,
        data: [],
      },
    ]
  });
  //hourly histogram
  const [hourlyHistogram, setHourlyHistogram] = useState({
    data: [],
  });

  //time trend
  const [timeTrend, setTimeTrend] = useState({
    labels: [],
    datasets: []
  });

  //rankings trend
  const [rankingTrend, setRankingTrend] = useState({
    labels: [],
    datasets: []
  })

  const timelineRef = useRef(null);

  const updateViewer = async (item) => {
    setStatsViewer(item);
  };

  const updateViewDate = (date) => {
    setViewDate(date);
  };

  useEffect(() => {
    updateCalendarLabel();
  }, [viewDate, statsViewer]);

  const updateCalendarLabel = () => {
    const viewDateTime = DateTime.fromJSDate(viewDate);
    let startMillis;
    let stopMillis;
    if (statsViewer === 'Daily') {
      startMillis = viewDateTime.startOf('day').toMillis();
      stopMillis = viewDateTime.endOf('day').toMillis();
      if (startMillis < new Date().getTime() && new Date().getTime() < stopMillis) {
        setCalendarLabel('Today');
      }
      else {
        setCalendarLabel(viewDateTime.month + "/" + viewDateTime.day);
      }

    } else if (statsViewer === 'Weekly') {
      startMillis = viewDateTime.startOf('week').toMillis();
      stopMillis = viewDateTime.endOf('week').toMillis();
      if (startMillis < new Date().getTime() && new Date().getTime() < stopMillis) {
        setCalendarLabel('This Week');
      }
      else {
        setCalendarLabel(viewDateTime.startOf('week').month + "/" + viewDateTime.startOf('week').day + " ~ " + viewDateTime.endOf('week').month + "/" + viewDateTime.endOf('week').day);
      }
    } else {
      startMillis = viewDateTime.startOf('month').toMillis();
      stopMillis = viewDateTime.endOf('month').toMillis();
      if (startMillis < new Date().getTime() && new Date().getTime() < stopMillis) {
        setCalendarLabel('This Month');
      }
      else {
        setCalendarLabel(viewDateTime.monthLong);
      }
    };
    setStartDate(startMillis);
    setEndDate(stopMillis);
  };

  useEffect(() => {
    if (!!!props.userInfo) return; // wait for userInfo to be defined
    const { user_id } = props.userInfo;
    const viewDateTime = DateTime.fromJSDate(viewDate).toUTC().toISODate().toString();
    fetch(`${serverOrigin}/ranking/user?userId=${user_id}&mode=${statsViewer.toLowerCase()}&date=${viewDateTime}`, {
      method: 'get'
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          //setRankings(data.rankings);
          const rankingTrend = updateRankingTrend(data.rankings, statsViewer);
          setRankingTrend({
            labels: rankingTrend[0],
            datasets: rankingTrend[1],
          });

          /* if (statsViewer === 'Daily') {
            const viewDateTime = DateTime.fromJSDate(viewDate);
            const index = DateTime.now().startOf('day').diff(viewDateTime.startOf('day'), 'days');

          } else if (statsViewer === 'Weekly') {

          } else {

          } */
        }
      })
      .catch((error) => console.error(error));
  }, [props.userInfo, startDate, statsViewer]);


  useEffect(() => {
    const labels = subjects.map((subject) => { return subject.name });

    const timeUsagePieData = updateTimeUsagePie(subjects, viewDate, statsViewer);
    setTimeUsagePie({
      labels: labels,
      datasets:
        [
          {
            backgroundColor: colorsList,
            borderColor: colorsList,
            data: timeUsagePieData.data,
          },
        ]
    });

    if (timelineRef.current) {
      setDailyTimeline(updateHourlyMatrix(subjects, timelineRef.current.offsetWidth, viewDate));
    }

    const hourlyHistogramData = updateHourlyHistogram(subjects, statsViewer, viewDate);
    setHourlyHistogram({
      data: hourlyHistogramData
    });

    const timeTrend = updateTimeTrend(subjects, statsViewer);
    setTimeTrend({
      labels: timeTrend[0],
      datasets: timeTrend[1]
    });

    //update main viewer components
    const viewDateTime = DateTime.fromJSDate(viewDate);
    const { daily, weekly, monthly } = subjects;
    if (!daily) return;
    if (statsViewer === 'Daily') {
      const index = viewDateTime.diff(DateTime.now().startOf('day'), 'days').toObject();
      const { groupedTotal, grouped } = daily;
      const actualIndex = grouped.length + index.days - 1;
      const totalStudyDisp = secondConverter(groupedTotal[actualIndex]);
      setTotalStudy(`${totalStudyDisp.value}${totalStudyDisp.type}`);
      const focus = focusCalculator(grouped[actualIndex]);
      const { value, type } = secondConverter(focus);
      setFocus(`${value}${type}`);
    } else if (statsViewer === 'Weekly') {
      const index = viewDateTime.startOf('week').diff(DateTime.now().startOf('week'), 'weeks').toObject();
      const { groupedTotal, grouped } = weekly;
      const actualIndex = grouped.length + index.weeks - 1;
      const totalStudyDisp = secondConverter(groupedTotal[actualIndex]);
      setTotalStudy(`${totalStudyDisp.value}${totalStudyDisp.type}`);
      const focus = focusCalculator(grouped[actualIndex]);
      const { value, type } = secondConverter(focus);
      setFocus(`${value}${type}`);
    } else {
      const index = viewDateTime.startOf('month').diff(DateTime.now().startOf('month'), 'months').toObject();
      const { groupedTotal, grouped } = monthly;
      const actualIndex = grouped.length + index.months - 1;
      const totalStudyDisp = secondConverter(groupedTotal[actualIndex]);
      setTotalStudy(`${totalStudyDisp.value}${totalStudyDisp.type}`);
      const focus = focusCalculator(grouped[actualIndex]);
      const { value, type } = secondConverter(focus);
      setFocus(`${value}${type}`);
    }
  }, [viewDate, statsViewer, subjects, timelineRef]);

  const focusCalculator = (grouped) => {
    if (!grouped) return 0;
    let focus = 0;
    grouped.map(([start, stop]) => {
      const duration = stop - start;
      if (duration > focus) {
        focus = duration;
      };
      return null;
    });
    return focus;
  };

  /*   useEffect(() => {
      const rankingTrend = updateRankingTrend(rankings, statsViewer);
      setRankingTrend({
        labels: rankingTrend[0],
        datasets:
          [
            {
              backgroundColor: "#fd7f6f",
              borderColor: "#fd7f6f",
              data: rankingTrend[1],
            },
          ]
      });
    }, [rankings]); */


  useEffect(() => {
    if (!viewDate) return;
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    console.log(timezone);
    const viewDateSec = DateTime.fromJSDate(viewDate).toSeconds();
    fetch(`${serverOrigin}/extension/usage?date=${viewDateSec}&mode=${viewOption}&timezone=${timezone}`,
      {
        method: "get",
      })
      .then((response) => response.json())
      .then((response) => {
        console.log(response)
        if (response.success) {
          setWebsites(response.websitesData);
          let websitesUsage = 0;
          let websitesVisit = 0;
          response.websitesData.map(website => {
            websitesUsage += website.t;
            websitesVisit += website.v;
          });
          const websitesUsagesDisp = secondConverter(websitesUsage);
          console.log(websitesUsage, websitesUsagesDisp, 'webu')
          setWebsitesUsage(`${websitesUsagesDisp.value} ${websitesUsagesDisp.type}`);
          setWebsitesVisit(`${websitesVisit} times`);
        }
      })
      .catch((error) => console.error(error));
  }, [viewDate, viewOption]);

  return (
    <div className={styles.StatsContainer}>
      <CalendarModal isCalendarOpen={isCalendarOpen} setIsCalendarOpen={setIsCalendarOpen} updateViewDate={updateViewDate} viewDate={viewDate} subjects={subjects} />
      <StuckModal />
      <div className={` Main ${props.isSidebarOpen || props.isSidebarHovered ? 'sidebarOpen' : ''}`}>
        <div className={styles.boxes}>
          <div className={styles.box} id="daily">
            <div className={styles.buttonArea}>
              <div className={styles.dateSelectorWrapper}>
                <DateSelectorBtn viewMode={statsViewer} className={styles.title} startDate={startDate} endDate={endDate} viewDate={viewDate} isCalendarOpen={isCalendarOpen} setIsCalendarOpen={setIsCalendarOpen}></DateSelectorBtn>
              </div>
              <RadioBtn items={[{ view: 'Daily', value: 'Daily' }, { view: 'Weekly', value: 'Weekly' }, { view: 'Monthly', value: 'Monthly' }]} changeEvent={updateViewer} defaultViewer={0} />
            </div>
            <div className={styles.container}>
              <div className={styles.divided}>
                <p className={styles.title}>{statsViewer} Time Usage by Subjects</p>
                <div className={styles.chartContainer}>
                  <div className={`${styles.noChart} ${timeUsagePie.datasets[0].data.reduce((accumulator, currentValue) => accumulator + currentValue, 0) ? styles.true : ''}`}>
                    <Link to="/dashboard/study">Study to see stats!</Link>
                  </div>
                  <PieChart
                    labels={timeUsagePie.labels}

                    datasets={timeUsagePie.datasets}

                    options={
                      {
                        plugins: {
                          legend: {
                            position: 'bottom',
                          },
                          datalabels: {
                            color: '#ffffff',
                            font: {
                              size: 32,
                              family: 'Arial',
                              weight: 700
                            },
                            formatter: (value, context, index) => {
                              const { chart, dataIndex } = context;
                              const labels = chart.data.labels;
                              const label = labels[dataIndex];
                              return ``;
                            }
                          }
                        }
                      }
                    }

                    plugins={
                      ChartDataLabel
                    }
                  />
                </div>
              </div>
              <div className={styles.divider}>
                <div className={styles.smallBox}>
                  <div className={styles.circle}>
                    <FontAwesomeIcon icon={faBook} style={{ color: "#fff", }} />
                  </div>
                  <p>Total<br /><strong>{totalStudy}</strong></p>
                </div>
                <div className={styles.smallBox}>
                  <div className={styles.circle}>
                    <FontAwesomeIcon icon={faGlobe} style={{ color: "#fff", }} />
                  </div>
                  <p>Website Usage<br /><strong>{websitesUsage} / {websitesVisit}</strong></p>
                </div>
                <div className={styles.smallBox}>
                  <div className={styles.circle}>
                    <FontAwesomeIcon icon={faRankingStar} style={{ color: "#fff", }} />
                  </div>
                  <p>Ranking<br /><strong>#{ranking}</strong></p>
                </div>
                <div className={styles.smallBox}>
                  <div className={styles.circle}>
                    <FontAwesomeIcon icon={faFire} style={{ color: "#fff", }} />
                  </div>
                  <p>Focus <br /><strong>{focus}</strong></p>
                </div>
              </div>
            </div>
            <div className={styles.secondContainer}>
              <div className={styles.smallBoxContainer}>
                <div className={`${styles.smallBox} ${styles.chartsBox}`}>
                  <p className={styles.title}>Timeline</p>
                  <div className={styles.chartContainer}>
                    <Timeline refT={timelineRef} dailyTimeline={dailyTimeline} />
                  </div>
                </div>
                <div className={`${styles.smallBox} ${styles.chartsBox}`}>
                  <p className={styles.title}>Hourly Histogram</p>
                  <div className={styles.chartContainer}>
                    <BarChart
                      labels={
                        [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23]
                      }

                      datasets={
                        [
                          {
                            data: hourlyHistogram.data,
                            backgroundColor: colorsList
                          }
                        ]
                      }

                      options={
                        {
                          maintainAspectRatio: false,
                          responsive: true,
                          plugins: {
                            legend: {
                              display: false,
                            }
                          },
                          interaction: {
                            intersect: false,
                            mode: 'index',
                          },
                          scales: {
                            y: {
                              grid: {
                                drawBorder: false,
                                display: true,
                                drawOnChartArea: true,
                                drawTicks: false,
                                borderDash: [5, 5]
                              },
                              ticks: {
                                display: true,
                                padding: 10,
                                color: '#9ca2b7',
                                stepSize: 1
                              }
                            },
                            x: {
                              grid: {
                                drawBorder: false,
                                display: true,
                                drawOnChartArea: true,
                                drawTicks: true,
                                borderDash: [5, 5]
                              },
                              ticks: {
                                display: true,
                                color: '#9ca2b7',
                                padding: 10
                              }
                            },
                          },
                        }
                      }
                    />

{/*                     <Chart
                    type="bar"
                      series={[{
                        name: 'Inflation',
                        data: hourlyHistogram.data
                      }]}
                      options={{
                        chart: {
                          height: 350,
                          type: 'bar',
                        },
                        plotOptions: {
                          bar: {
                            borderRadius: 10,
                            dataLabels: {
                              position: 'top', // top, center, bottom
                            },
                          }
                        },
                        dataLabels: {
                          enabled: true,
                          formatter: function (val) {
                            return val + "%";
                          },
                          offsetY: -20,
                          style: {
                            fontSize: '12px',
                            colors: ["#304758"]
                          }
                        },

                        xaxis: {
                          categories: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23],
                          position: 'top',
                          axisBorder: {
                            show: false
                          },
                          axisTicks: {
                            show: false
                          },
                          crosshairs: {
                            fill: {
                              type: 'gradient',
                              gradient: {
                                colorFrom: '#D8E3F0',
                                colorTo: '#BED1E6',
                                stops: [0, 100],
                                opacityFrom: 0.4,
                                opacityTo: 0.5,
                              }
                            }
                          },
                          tooltip: {
                            enabled: true,
                          }
                        },
                        yaxis: {
                          axisBorder: {
                            show: false
                          },
                          axisTicks: {
                            show: false,
                          },
                          labels: {
                            show: false,
                            formatter: function (val) {
                              return val + "%";
                            }
                          }

                        },
                        title: {
                          text: 'Monthly Inflation in Argentina, 2002',
                          floating: true,
                          offsetY: 330,
                          align: 'center',
                          style: {
                            color: '#444'
                          }
                        }
                      }}
                    /> */}
                  </div>
                </div>
              </div>
            </div>
            <div className={styles.thirdContainer}>
              <div className={styles.smallBoxContainer}>
                <div className={`${styles.smallBox} ${styles.chartsBox}`}>
                  <p className={styles.title}>Study Time Trend</p>
                  <div className={styles.chartContainer}>
                    {/* <LineChart
                      labels={
                        timeTrend.labels
                      }

                      datasets={timeTrend.datasets}

                      options={
                        {
                          responsive: true,
                          plugins: {
                            legend: {
                              display: false,
                            }
                          },
                          interaction: {
                            intersect: false,
                            mode: 'index',
                          },
                          scales: {
                            y: {
                              grid: {
                                drawBorder: false,
                                display: true,
                                drawOnChartArea: true,
                                drawTicks: false,
                                borderDash: [5, 5]
                              },
                              ticks: {
                                display: true,
                                padding: 10,
                                color: '#9ca2b7',
                                stepSize: 1
                              }
                            },
                            x: {
                              grid: {
                                drawBorder: false,
                                display: true,
                                drawOnChartArea: true,
                                drawTicks: true,
                                borderDash: [5, 5]
                              },
                              ticks: {
                                display: true,
                                color: '#9ca2b7',
                                padding: 10
                              }
                            },
                          },
                        }
                      }
                    /> */}
                    <Chart
                      type="line"
                      series={[{
                        name: "Study Time",
                        data: timeTrend.datasets
                      }]}
                      options={{
                        chart: {
                          height: 350,
                          type: 'line',
                          zoom: {
                            enabled: false
                          },
                          animations: {
                            enabled: true,
                            easing: 'easeinout',
                            speed: 800,
                            animateGradually: {
                              enabled: true,
                              delay: 150
                            },
                            dynamicAnimation: {
                              enabled: true,
                              speed: 350
                            }
                          }
                        },
                        yaxis: {
                          labels: {
                            formatter: function (sec) {
                              const {value, type} = secondConverter(sec);
                              return `${value} ${type}`;
                            }
                          },
                        },
                        stroke: {
                          curve: 'straight'
                        },
                        /* title: {
                          text: 'Product Trends by Month',
                          align: 'left'
                        }, */
                        grid: {
                          row: {
                            colors: ['#f3f3f3', 'transparent'], // takes an array which will be repeated on columns
                            opacity: 0.5
                          },
                        },
                        xaxis: {
                          categories: timeTrend.labels,
                          range: 7
                        },

                      }}
                    />
                  </div>
                </div>
                <div className={`${styles.smallBox} ${styles.chartsBox}`}>
                  <p className={styles.title}>Ranking Trend</p>
                  <div className={styles.chartContainer}>
                    <Chart
                      type="line"
                      series={[{
                        name: "Study Time",
                        data: rankingTrend.datasets
                      }]}
                      options={{
                        chart: {
                          height: 350,
                          type: 'line',
                          zoom: {
                            enabled: false
                          }
                        },
                        stroke: {
                          curve: 'straight'
                        },
                        /* title: {
                          text: 'Product Trends by Month',
                          align: 'left'
                        }, */
                        grid: {
                          row: {
                            colors: ['#f3f3f3', 'transparent'], // takes an array which will be repeated on columns
                            opacity: 0.5
                          },
                        },
                        xaxis: {
                          categories: rankingTrend.labels,
                          range: 7
                        },
                        yaxis: {
                          reversed: true,
                          labels: {
                            formatter: function (val) {
                              return `#${val}`;
                            }
                          },
                        },
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className={styles.fourthContainer}>
              <div className={styles.smallBoxContainer}>
                <div className={`${styles.smallBox} ${styles.chartsBox}`}>
                  <p className={styles.title}>Today's Website Usage while Studying</p>
                  <div className={styles.chartContainer}>
                    <DropDownButton
                      options={[
                        { name: "Active Time", value: 0 },
                        { name: "Visited Time", value: 1 },
                      ]}
                      setValue={setViewOption}
                    />
                    <PieChart
                      labels={websites.map(website => { return website.d })}

                      datasets={
                        [
                          {
                            label: viewOption ? "Visited Time" : "Active Time",
                            backgroundColor: colorsList,
                            borderColor: colorsList,
                            data: viewOption ? websites.map(website => { return website.v }) : websites.map(website => { return Math.floor(website.t / (60 * 60)) }),
                          },
                        ]
                      }

                      options={
                        {
                          plugins: {
                            legend: {
                              position: 'bottom',
                            },
                            datalabels: {
                              color: '#ffffff',
                              font: {
                                size: 32,
                                family: 'Arial',
                                weight: 700
                              },
                              formatter: (value, context, index) => {
                                const { chart, dataIndex } = context;
                                const labels = chart.data.labels;
                                const label = labels[dataIndex];
                                return ``;
                              }
                            }
                          }
                        }
                      }

                      plugins={
                        ChartDataLabel
                      }
                    />
                  </div>
                </div>
                <div className={`${styles.smallBox} ${styles.chartsBox}`}>
                  <p className={styles.title}>Today's App Usage while Studying</p>
                  <div className={styles.chartContainer}>
                    <PieChart
                      labels={
                        ["Math", "English", "History", "Sci", "Phy"]
                      }

                      datasets={
                        [
                          {
                            label: "My First dataset",
                            backgroundColor: colorsList,
                            borderColor: colorsList,
                            data: [2, 20, 30, 45],
                          },
                        ]
                      }

                      options={
                        {
                          plugins: {
                            legend: {
                              position: 'bottom',
                            },
                            datalabels: {
                              color: '#ffffff',
                              font: {
                                size: 32,
                                family: 'Arial',
                                weight: 700
                              },
                              formatter: (value, context, index) => {
                                const { chart, dataIndex } = context;
                                const labels = chart.data.labels;
                                const label = labels[dataIndex];
                                return ``;
                              }
                            }
                          }
                        }
                      }

                      plugins={
                        ChartDataLabel
                      }
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className={styles.faceOffContainer}>
              <div className={`${styles.smallBox} ${styles.chartsBox}`}>
                <div>
                  <p className={styles.title}>Face-off with @____</p>
                  {/* <ul>
                  <li>
                    <p>Run payroll <strong>Mar 4 at 5:00 pm</strong></p>
                  </li>
                  <li>
                    <p>Run payroll <strong>Mar 4 at 5:00 pm</strong></p>
                  </li>
                  <li>
                    <p>Run payroll <strong>Mar 4 at 5:00 pm</strong></p>
                  </li>
                  <li>
                    <p>Run payroll <strong>Mar 4 at 5:00 pm</strong></p>
                  </li>
                </ul> */}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Stats;