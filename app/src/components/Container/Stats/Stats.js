import React, { useState, useEffect, useRef } from 'react'; import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
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
import { updateTimeUsagePie, updateHourlyMatrix, updateHourlyHistogram, updateTimeTrend, updateRankingTrend, updateStackedAreaGraph } from './StatTools';
import DateSelectorBtn from '../../UI/DateSelectorBtn/DateSelectorBtn';
import { DateTime } from 'luxon';
import CalendarModal from '../../UI/CalendarModal/CalendarModal';
import { secondConverter } from '../../../utils/Tool';
import ExtensionPie from '../../UI/ExtensionPie/ExtensionPie';
import DropDownButton from '../../UI/DropDownButton/DropDownButton';

import ApexChart from 'apexcharts';
import Chart from 'react-apexcharts';
import { IconBook, IconEyeOutline, IconMonitor, IconStatsChart } from '../../../utils/svgs';

const serverOrigin = process.env.REACT_APP_ORIGIN;

function Stats({ subjects, userInfo }) {

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

  //stacked area graph
  const [areaGraphTrend, setAreaGraphTrend] = useState({
    datasets: [],
    labels: [],
  })

  const timelineRef = useRef(null);

  const updateViewer = async (item) => {
    setStatsViewer(item);
  };

  const updateViewDate = (date) => {
    setViewDate(date);
  };

  useEffect(() => {
    if (!userInfo) return;
    const { user_id } = userInfo;
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
  }, [userInfo, startDate, statsViewer]);


  /* useEffect(() => {
    const labels = subjects.map((subject) => { return subject.name });

    const { data } = updateTimeUsagePie(subjects, viewDate, statsViewer);
    const areaData = updateStackedAreaGraph(subjects, statsViewer).data;
    console.log(areaData);

    setTimeUsagePie({
      labels: labels,
      datasets: data
    });

    setAreaGraphTrend({
      datasets: areaData,
    })

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
  }, [viewDate, statsViewer, subjects, timelineRef]); */

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

  const [subjectsPie, setSubjectsPie] = useState([]);

  useEffect(() => {
    if (!viewDate || !statsViewer || !subjects) return;

    const { daily, weekly, monthly } = subjects;
    
    if (!daily) return;
    
    const now = DateTime.now().startOf('day');
    const viewDateTime = DateTime.fromJSDate(viewDate);

    if (statsViewer === 'Daily') {
      const index = viewDateTime.diff(now, 'days').toObject();
      const { groupedTotal, grouped } = daily;
      const actualIndex = grouped.length + index.days - 1;
      const totalStudyDisp = secondConverter(groupedTotal[actualIndex]);
      setTotalStudy(`${totalStudyDisp.value}${totalStudyDisp.type}`);
      const focus = focusCalculator(grouped[actualIndex]);
      const { value, type } = secondConverter(focus);
      setFocus(`${value}${type}`);
      const datumPoint = DateTime.fromSeconds(subjects.daily.datum_point);
      //updateTimeTrend(datumPoint, subjects.daily.groupedTotal)
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
  }, [viewDate, statsViewer, subjects]);

  return (
    <div className={styles.StatsContainer}>
      <CalendarModal isCalendarOpen={isCalendarOpen} setIsCalendarOpen={setIsCalendarOpen} updateViewDate={updateViewDate} viewDate={viewDate} subjects={subjects} showHeatmap={true} />
      <div className="Main">
        <div className={styles.optionsHeader}>
          <div className={styles.dateSelectorWrapper}>
            <DateSelectorBtn viewMode={statsViewer} className={styles.title} startDate={startDate} endDate={endDate} viewDate={viewDate} isCalendarOpen={isCalendarOpen} setIsCalendarOpen={setIsCalendarOpen}></DateSelectorBtn>
          </div>
          <RadioBtn items={[{ view: 'Daily', value: 'Daily' }, { view: 'Weekly', value: 'Weekly' }, { view: 'Monthly', value: 'Monthly' }]} changeEvent={updateViewer} defaultViewer={0} />
        </div>
        <div>
          <div className={styles.bigBox}>
            <div className={styles.chartWrapper}>
            </div>
            <div>
              <div className={styles.overflow}>
                <i>
                  <IconBook />
                </i>
                Total Study Time {totalStudy}
              </div>
              <div className={styles.overflow}>
                <i>
                  <IconMonitor />
                </i>
                Website Usage Time {websitesUsage} / {websitesVisit} times
              </div>
              <div className={styles.overflow}>
                <i>
                  <IconStatsChart />
                </i>
                Ranking {ranking}
              </div>
              <div className={styles.overflow}>
                <i>
                  <IconEyeOutline />
                </i>
                Focus {focus}
              </div>
            </div>
          </div>
          <div className={styles.bigBox}>

          </div>
        </div>
      </div>
      {/*       <CalendarModal isCalendarOpen={isCalendarOpen} setIsCalendarOpen={setIsCalendarOpen} updateViewDate={updateViewDate} viewDate={viewDate} subjects={subjects} showHeatmap={true} />
      <div className={styles.Main}>
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
                  <div className={`${styles.noChart} ${timeUsagePie.datasets.reduce((accumulator, currentValue) => accumulator + currentValue, 0) ? styles.true : ''}`}>
                    <Link to="/dashboard/study">Study to see stats!</Link>
                  </div>
                  <Chart
                    type="pie"
                    series={timeUsagePie.datasets}
                    options={{
                      chart: {
                        type: 'pie',
                        height: '500px',
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
                      colors: colorsList,
                      labels: timeUsagePie.labels,
                      legend: {
                        position: 'bottom',
                        fontSize: '24px',
                        fontWeight: 600,
                      },
                    }}
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
                  </div>
                </div>
              </div>
            </div>
            <div className={styles.thirdContainer}>
              <div className={styles.smallBoxContainer}>
                <div className={`${styles.smallBox} ${styles.chartsBox}`}>
                  <p className={styles.title}>Study Time Trend</p>
                  <div className={styles.chartContainer}>
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
                              const { value, type } = secondConverter(sec);
                              return `${value} ${type}`;
                            }
                          },
                        },
                        stroke: {
                          curve: 'straight'
                        },
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
                    <div className={`${styles.noChart} ${websites.length ? styles.true : ''}`} style={{ background: "#f7f9fd" }}>
                      <Link to="/dashboard/study">Study to see stats!</Link>
                    </div>
                    <DropDownButton
                      options={{
                        "0": "Active Time",
                        "1": "Visited Time"
                      }}
                      setValue={setViewOption}
                      value={viewOption}
                    />
                    <Chart
                      type="pie"
                      series={viewOption ? websites.map(website => { return website.v }) : websites.map(website => { return Math.floor(website.t / (60 * 60)) })}
                      options={{
                        chart: {
                          type: 'pie',
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
                        colors: colorsList,
                        labels: websites.map(website => { return website.d }),
                        legend: {
                          position: 'bottom',
                          fontSize: '24px',
                          fontWeight: 600,
                        },
                      }}
                    />
                  </div>
                </div>
                <div className={`${styles.smallBox} ${styles.chartsBox}`}>
                  <p className={styles.title}>Today's App Usage while Studying</p>
                  <div className={styles.chartContainer}>

                  </div>
                </div>
              </div>
            </div>
            <div className={styles.faceOffContainer}>
              <div className={`${styles.smallBox} ${styles.chartsBox}`}>
                <div>
                  <p className={styles.title}>Face-off with @____</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>


      <div className={styles.areaRechartContainer}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            width={500}
            height={400}
            data={
              areaGraphTrend.datasets.map((day) => {
                return {...day}
              })
            }
            margin={{
              top: 10,
              right: 30,
              left: 0,
              bottom: 0,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Area type="monotone" dataKey="uv" stackId="1" stroke="#8884d8" fill="#8884d8" />
            <Area type="monotone" dataKey="pv" stackId="1" stroke="#82ca9d" fill="#82ca9d" />
            <Area type="monotone" dataKey="amt" stackId="1" stroke="#ffc658" fill="#ffc658" />
          </AreaChart>
        </ResponsiveContainer>
      </div> */}

    </div>
  )
}

export default Stats;