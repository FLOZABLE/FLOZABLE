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

import { IconBook, IconEyeOutline, IconMonitor, IconStatsChart } from '../../../utils/svgs';
import { PieCustomTooltip, pieCustomLabel } from '../../UI/Charts';

const serverOrigin = process.env.REACT_APP_ORIGIN;


const data = [
  {
    name: 'Page A',
    uv: 4000,
    pv: 2400,
    amt: 2400,
  },
  {
    name: 'Page B',
    uv: 3000,
    pv: 1398,
    amt: 2210,
  },
  {
    name: 'Page C',
    uv: 2000,
    pv: 9800,
    amt: 2290,
  },
  {
    name: 'Page D',
    uv: 2780,
    pv: 3908,
    amt: 2000,
  },
  {
    name: 'Page E',
    uv: 1890,
    pv: 4800,
    amt: 2181,
  },
  {
    name: 'Page F',
    uv: 2390,
    pv: 3800,
    amt: 2500,
  },
  {
    name: 'Page G',
    uv: 3490,
    pv: 4300,
    amt: 2100,
  },
];

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
        }
      })
      .catch((error) => console.error(error));
  }, [userInfo, startDate, statsViewer]);

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
    const viewDateSec = DateTime.fromJSDate(viewDate).toSeconds();
    fetch(`${serverOrigin}/extension/usage?date=${viewDateSec}&mode=${viewOption}&timezone=${timezone}`,
      {
        method: "get",
      })
      .then((response) => response.json())
      .then((response) => {
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
  }, [viewDate, viewOption]);

  const [subjectsPie, setSubjectsPie] = useState([]);
  //stacked area graph
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
    setSubjectsPie(subjectsPie);

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
      setSubjectsTrend(subjectsTrend);
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
      setSubjectsTrend(subjectsTrend);
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
      setSubjectsTrend(subjectsTrend);
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
        </div>
      </div>
    </div>
  )
}

export default Stats;