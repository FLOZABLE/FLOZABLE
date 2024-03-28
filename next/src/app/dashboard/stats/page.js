"use client";

/* import CalendarModal from "@/Components/Modals/CalendarModal/CalendarModal";
import styles from "./page.module.css"; */
import { useContext, useEffect, useRef, useState } from "react";
/* import DateSelectorBtn from "@/Components/Buttons/DateSelectorBtn/DateSelectorBtn";
import RadioBtn from "@/Components/Buttons/RadioBtn/RadioBtn";
import SubjectsPie from "@/Components/Charts/SubjectsPie";
import { IconBook, IconEyeOutline, IconMonitor, IconStatsChart } from "@/utils/Svg"; */
import { SubjectsContext } from "@/utils/Contexts";
import { focusCalculator, secondConverter } from "@/utils/Tool";
import { DateTime } from "luxon";
/* import StudyTrendChart from "@/Components/Charts/StudyTrendChart";
import { CartesianGrid, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { PieCustomTooltip } from "@/Components/Charts/Charts";
import RankingTrend from "@/Components/Charts/RankingTrendChart"; */

function Stats({}) {
  const {subjects} = useContext(SubjectsContext);

  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [viewDate, setViewDate] = useState(new Date(new Date().setHours(0, 0, 0, 0)));
  const [statsViewer, setStatsViewer] = useState('Daily');
  
  const [totalStudy, setTotalStudy] = useState("");
  const [focus, setFocus] = useState("");
  const [ranking, setRanking] = useState(0);
  const [websites, setWebsites] = useState([]);

  const [websitesUsage, setWebsitesUsage] = useState(0);
  const [websitesVisit, setWebsitesVisit] = useState(0);

  const statsRef = useRef(null);

  
  useEffect(() => {
    if (!viewDate || !statsViewer || !subjects) return;

    const { daily, weekly, monthly } = subjects;

    if (!daily) return;

    const now = DateTime.now().startOf('day');
    const viewDateTime = DateTime.fromJSDate(viewDate);

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
    }
  }, [viewDate, statsViewer, subjects]);

  return (
    <div>
      {/* <CalendarModal
        isCalendarOpen={isCalendarOpen}
        setIsCalendarOpen={setIsCalendarOpen}
        updateViewDate={setViewDate}
        viewDate={viewDate}
        showHeatmap={true}
      />
      <div className="Main">
        <div className="title">Stats</div>
        <div className={styles.Stats} ref={statsRef}>
          <div className={styles.optionsHeader}>
            <div className={styles.dateSelectorWrapper}>
              <DateSelectorBtn
                viewMode={statsViewer}
                className={styles.title}
                viewDate={viewDate}
                isCalendarOpen={isCalendarOpen}
                setIsCalendarOpen={setIsCalendarOpen}
              ></DateSelectorBtn>
            </div>
            <RadioBtn
              items={[
                { view: "Daily", value: "Daily" },
                { view: "Weekly", value: "Weekly" },
                { view: "Monthly", value: "Monthly" },
              ]}
              changeEvent={setStatsViewer}
              defaultViewer={0}
            />
          </div>
          <div>
            <div className={styles.bigBox}>
              <div className={styles.contents}>
                <div className={styles.chartWrapper}>
                  <SubjectsPie 
                    statsViewer={statsViewer}
                    viewDate={viewDate}
                  />
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
            </div>
            <div className={styles.bigBox}>
              <h3>Study Time Trend</h3>
              <div className={styles.contents}>
                <div className={styles.chartWrapper}>
                  <StudyTrendChart 
                    viewDate={viewDate}
                    statsViewer={statsViewer}
                  />
                </div>
              </div>
            </div>
            <div className={styles.bigBox}>
              <h3>Ranking Trend</h3>
              <div className={styles.chartWrapper}>
                <RankingTrend 
                  viewDate={viewDate}
                  statsViewer={statsViewer}
                  setRanking={setRanking}
                />
              </div>
            </div>
            <div className={styles.bigBox} id={styles.othersUsage}>
              <h3>Website Usage</h3>
              {websites.length ? (
                <div className={styles.contents}>
                  <div className={styles.chartWrapper}>
                    <h3>Visits</h3>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Tooltip content={<PieCustomTooltip />} />
                        <Pie
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          data={JSON.parse(JSON.stringify(websites))
                            .sort((a, b) => b.v - a.v)
                            .map((website, i) => {
                              const { v, d } = website;
                              const labelVal = `${v} times`;
                              const fill =
                                coldColorsList[i % coldColorsList.length];
                              return { ...website, labelVal, name: d, fill };
                            })}
                          dataKey={"v"}
                          outerRadius={200}
                          innerRadius={150}
                          fill="green"
                          label={pieCustomLabel}
                          minAngle={3}
                        ></Pie>
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className={styles.chartWrapper}>
                    <h3>Time</h3>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Tooltip content={<PieCustomTooltip />} />
                        <Pie
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          data={JSON.parse(JSON.stringify(websites))
                            .sort((a, b) => b.t - a.t)
                            .map((website, i) => {
                              const { t, d } = website;
                              const { value, type } = secondConverter(t);
                              const labelVal = `${value} ${type}`;
                              const fill =
                                coldColorsList[i % coldColorsList.length];
                              return { ...website, labelVal, name: d, fill };
                            })}
                          dataKey={"t"}
                          outerRadius={200}
                          innerRadius={150}
                          fill="green"
                          label={pieCustomLabel}
                          minAngle={3}
                        ></Pie>
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              ) : (
                <a
                  target="blank"
                  href="https://chromewebstore.google.com/detail/flozable-tab-monitor/cmbdaanokelibhphiidlikongdoandlj"
                  className={styles.noChart}
                >
                  <h3>Use chrome extension to see website usage!</h3>
                </a>
              )}
            </div>
          </div>
        </div>
      </div> */}
    </div>
  );
}

export default Stats;
