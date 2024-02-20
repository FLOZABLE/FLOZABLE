import React, { useState, useEffect, useRef } from 'react';
import RadioBtn from '../../UI/RadioBtn/RadioBtn';
import { coldColorsList, colorsList } from '../../../constant';
import styles from './Stats.module.css';
import { updateTimeUsagePie, updateHourlyMatrix, updateHourlyHistogram, updateTimeTrend, updateRankingTrend, updateStackedAreaGraph, updateSubjectsTrendChart } from './StatTools';
import DateSelectorBtn from '../../UI/DateSelectorBtn/DateSelectorBtn';
import { DateTime } from 'luxon';
import CalendarModal from '../../UI/CalendarModal/CalendarModal';
import { secondConverter } from '../../../utils/Tool';
import { PieChart, Pie, Tooltip, ResponsiveContainer, YAxis, XAxis, CartesianGrid, LineChart, Line, Legend } from "recharts";
import { Link } from 'react-router-dom';
import { IconBook, IconEyeOutline, IconMonitor, IconStatsChart } from '../../../utils/svgs';
import { PieCustomTooltip, pieCustomLabel } from '../../UI/Charts';

const serverOrigin = process.env.REACT_APP_ORIGIN;
let rankingTrend = [];

function Stats({ subjects, userInfo }) {

  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  const [statsViewer, setStatsViewer] = useState('Daily');
  const [viewDate, setViewDate] = useState(new Date(new Date().setHours(0, 0, 0, 0)));
  const [totalStudy, setTotalStudy] = useState("");
  const [focus, setFocus] = useState("");
  const [ranking, setRanking] = useState(0);
  const [websites, setWebsites] = useState([]);
  const [viewOption, setViewOption] = useState(0);
  const [websitesUsage, setWebsitesUsage] = useState(0);
  const [websitesVisit, setWebsitesVisit] = useState(0);
  const [rankingsTrend, setRankingsTrend] = useState([]);

  const updateViewer = async (item) => {
    setStatsViewer(item);
  };

  const updateViewDate = (date) => {
    setViewDate(date);
  };

  useEffect(() => {
    if (!userInfo) return;
    const { user_id } = userInfo;
    const viewDateTime = DateTime.fromJSDate(viewDate);
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    fetch(`${serverOrigin}/ranking/user?userId=${user_id}&mode=${statsViewer.toLowerCase()}&date=${viewDateTime.toISODate()}&timezone=${timezone}`, {
      method: 'get'
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          rankingTrend = updateRankingTrend(data.rankings, statsViewer);
          let ranking = 0;
          if (statsViewer === "Daily") {
            ranking = rankingTrend.find(ranking => ranking.label === viewDateTime.toISODate());
          } else if (statsViewer === "Weekly") {
            ranking = rankingTrend.find(ranking => ranking.label === viewDateTime.startOf('week').toISODate());
          } else {
            ranking = rankingTrend.find(ranking => ranking.label === viewDateTime.startOf('month').toISODate());
          };
          setRanking(ranking.data);

          setTimeout(() => {
            setRankingsTrend(rankingTrend);
          }, 100);
        }
      })
      .catch((error) => console.error(error));
  }, [userInfo, viewDate, statsViewer]);

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

  useEffect(() => {
    if (!viewDate) return;
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const viewDateTime = DateTime.fromJSDate(viewDate);
    fetch(`${serverOrigin}/extension/usage?date=${viewDateTime.toISODate()}&mode=${statsViewer}&timezone=${timezone}`,
      {
        method: "get",
      })
      .then((response) => response.json())
      .then((response) => {
        console.log(response, 'usage')
        if (response.success) {
          setWebsites(response.websitesData);
          let websitesUsage = 0;
          let websitesVisit = 0;
          response.websitesData.map(website => {
            websitesUsage += website.t;
            websitesVisit += website.v;
          });
          const websitesUsagesDisp = secondConverter(websitesUsage);
          setWebsitesUsage(`${websitesUsagesDisp.value} ${websitesUsagesDisp.type}`);
          setWebsitesVisit(`${websitesVisit} times`);
        }
      })
      .catch((error) => console.error(error));
  }, [viewDate, statsViewer]);

  const [subjectsPie, setSubjectsPie] = useState([]);

  const [subjectsTrend, setSubjectsTrend] = useState([]);
  const [filteredTrends, setFilteredTrends] = useState([]);

  useEffect(() => {
    if (!viewDate || !statsViewer || !subjects) return;

    const { daily, weekly, monthly } = subjects;

    if (!daily) return;

    const now = DateTime.now().startOf('day');
    const viewDateTime = DateTime.fromJSDate(viewDate);
    //subject time usage pie chart
    const subjectsPie = updateTimeUsagePie(subjects, viewDateTime, statsViewer);
    setTimeout(() => {
      setSubjectsPie(subjectsPie);
    }, 300);

    if (statsViewer === 'Daily') {

      //top box renderer
      const index = viewDateTime.diff(now, 'days').toObject();
      const { groupedTotal, grouped } = daily;
      const actualIndex = grouped.length + index.days - 1;
      const totalStudyDisp = secondConverter(groupedTotal[actualIndex]);
      setTotalStudy(`${totalStudyDisp.value}${totalStudyDisp.type}`);
      const focus = focusCalculator(grouped[actualIndex]);
      const { value, type } = secondConverter(focus);
      setFocus(`${value}${type}`);

      //subject trend data handler
      const subjectsTrend = updateSubjectsTrendChart(subjects, statsViewer, 'day');
      setTimeout(() => {
        setSubjectsTrend(subjectsTrend);
      }, 300);
    } else if (statsViewer === 'Weekly') {

      //top box renderer
      const index = viewDateTime.startOf('week').diff(DateTime.now().startOf('week'), 'weeks').toObject();
      const { groupedTotal, grouped } = weekly;
      const actualIndex = grouped.length + index.weeks - 1;
      const totalStudyDisp = secondConverter(groupedTotal[actualIndex]);
      setTotalStudy(`${totalStudyDisp.value}${totalStudyDisp.type}`);
      const focus = focusCalculator(grouped[actualIndex]);
      const { value, type } = secondConverter(focus);
      setFocus(`${value}${type}`);

      //subject trend data handler
      const subjectsTrend = updateSubjectsTrendChart(subjects, statsViewer, 'week');
      setTimeout(() => {
        setSubjectsTrend(subjectsTrend);
      }, 300);
      //setSubjectsTrend(subjectsTrend);
    } else {

      //top box renderer
      const index = viewDateTime.startOf('month').diff(DateTime.now().startOf('month'), 'months').toObject();
      const { groupedTotal, grouped } = monthly;
      const actualIndex = grouped.length + index.months - 1;
      const totalStudyDisp = secondConverter(groupedTotal[actualIndex]);
      setTotalStudy(`${totalStudyDisp.value}${totalStudyDisp.type}`);
      const focus = focusCalculator(grouped[actualIndex]);
      const { value, type } = secondConverter(focus);
      setFocus(`${value}${type}`);

      //subject trend data handler
      const subjectsTrend = updateSubjectsTrendChart(subjects, statsViewer, 'month');
      setTimeout(() => {
        setSubjectsTrend(subjectsTrend);
      }, 300);
    }
  }, [viewDate, statsViewer, subjects]);

  return (
    <div className={styles.StatsContainer}>
      <CalendarModal isCalendarOpen={isCalendarOpen} setIsCalendarOpen={setIsCalendarOpen} updateViewDate={updateViewDate} viewDate={viewDate} subjects={subjects} showHeatmap={true} />
      <div className="Main">
        <div className={styles.optionsHeader}>
          <div className={styles.dateSelectorWrapper}>
            <DateSelectorBtn viewMode={statsViewer} className={styles.title} viewDate={viewDate} isCalendarOpen={isCalendarOpen} setIsCalendarOpen={setIsCalendarOpen}></DateSelectorBtn>
          </div>
          <RadioBtn items={[{ view: 'Daily', value: 'Daily' }, { view: 'Weekly', value: 'Weekly' }, { view: 'Monthly', value: 'Monthly' }]} changeEvent={updateViewer} defaultViewer={0} />
        </div>
        <div>
          <div className={styles.bigBox}>
            <div className={styles.chartWrapper}>
              {subjectsPie.reduce((accumulator, data, i) => {
                const value = data.value;
                if (value) {
                  const name = data.info.name;
                  const fill = coldColorsList[accumulator.length % (coldColorsList.length)];
                  const labelVal = secondConverter(value);
                  accumulator.push({ value, name, fill, labelVal: `${labelVal.value} ${labelVal.type}` });
                }
                return accumulator;
              }, []).length
                ?
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Tooltip content={<PieCustomTooltip />} />
                    <Pie
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      data={subjectsPie.reduce((accumulator, data, i) => {
                        const value = data.value;
                        if (value) {
                          const name = data.info.name;
                          const fill = coldColorsList[accumulator.length % (coldColorsList.length)];
                          const labelVal = secondConverter(value);
                          accumulator.push({ value, name, fill, labelVal: `${labelVal.value} ${labelVal.type}` });
                        }
                        return accumulator;
                      }, [])}
                      dataKey={"value"}
                      outerRadius={200}
                      innerRadius={150}
                      fill="green"
                      label={pieCustomLabel}
                    >
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                :
                <Link
                  to="/dashboard/study"
                  className={styles.noChart}>
                  <h3>Study to see stats!</h3>
                </Link>
              }
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
            <div className={styles.chartWrapper}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={subjectsTrend.map((day, i) => {
                    const data = day.data.reduce((accumulator, subject) => {
                      if (!filteredTrends.includes(subject.info.id)) {
                        accumulator[subject.info.id] = subject.value;
                      };
                      return accumulator;
                    }, {});
                    return { label: day.label, ...data }
                  })}
                  margin={{
                    top: 5,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="label" />
                  <YAxis tickFormatter={(data) => {
                    const { value, type } = secondConverter(data);
                    return `${value} ${type}`
                  }} />
                  <Tooltip formatter={(data) => {
                    const { value, type } = secondConverter(data);
                    return `${value} ${type}`
                  }} />
                  <Legend
                    onClick={(e) => {
                      if (filteredTrends.includes(e.dataKey)) {
                        setFilteredTrends(prev => {
                          return prev.filter(item => item !== e.dataKey);
                        })
                      } else {
                        setFilteredTrends(prev => {
                          return [...prev, e.dataKey]
                        })
                      }
                    }}
                  />
                  {subjectsTrend.length ? subjectsTrend[0].data.map((subject) => {
                    return (
                      <Line name={subject.info.name} type="monotone" key={subject.info.id} dataKey={subject.info.id} stroke="#8884d8" activeDot={{ r: 8 }} />
                    )
                  }) : null}
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className={styles.bigBox}>
            <div className={styles.chartWrapper}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={rankingsTrend}
                  margin={{
                    top: 5,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="label" tickFormatter={(data) => {
                    const dateTime = DateTime.fromISO(data);

                    return dateTime.toFormat('M/d');
                  }} />
                  <YAxis reversed={true} />
                  <Tooltip />
                  <Line type="monotone" dataKey={"ranking"} stroke="#8884d8" activeDot={{ r: 8 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className={styles.bigBox}>
            <div className={styles.chartWrapper}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Tooltip content={<PieCustomTooltip />} />
                  <Pie
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    data={subjectsPie.reduce((accumulator, data, i) => {
                      const value = data.value;
                      if (value) {
                        const name = data.info.name;
                        const fill = coldColorsList[accumulator.length % (coldColorsList.length)];
                        const labelVal = secondConverter(value);
                        accumulator.push({ value, name, fill, labelVal: `${labelVal.value} ${labelVal.type}` });
                      }
                      return accumulator;
                    }, [])}
                    dataKey={"value"}
                    outerRadius={200}
                    innerRadius={150}
                    fill="green"
                    label={pieCustomLabel}
                  >
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Stats;