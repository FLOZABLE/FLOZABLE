"use client";

import CalendarModal from "@/app/components/Modals/CalendarModal/CalendarModal";
import styles from "./page.module.css";
import { useContext, useEffect, useRef, useState } from "react";
import DateSelectorBtn from "@/app/components/Buttons/DateSelectorBtn/DateSelectorBtn";
import RadioBtn from "@/app/components/Buttons/RadioBtn/RadioBtn";
import SubjectsPie from "@/app/components/Charts/SubjectsPie";
import { IconBook, IconEyeOutline, IconMonitor, IconStatsChart } from "@/app/utils/Svg";
import { SubjectsContext, TutorialsContext, UserInfoContext } from "@/app/utils/Contexts";
import { focusCalculator, secondConverter } from "@/app/utils/Tool";
import { DateTime } from "luxon";
import StudyTrendChart from "@/app/components/Charts/StudyTrendChart/StudyTrendChart";
import RankingTrend from "@/app/components/Charts/RankingTrendChart";
import config from "@/app/utils/config";
import WebsiteUsageChart from "@/app/components/Charts/WebsiteUsageChart/WebsiteUsageChart";

function Stats({}) {
  const {subjects} = useContext(SubjectsContext);
  const {userInfo} = useContext(UserInfoContext);
  const {tutorialBoxRef, tutorialTextRef, tutorial, setTutorial} = useContext(TutorialsContext);

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
    if (tutorial === 12) {

      setTimeout(() => {
        const { width, top, left, height } = statsRef.current.getBoundingClientRect();
        tutorialBoxRef.current.style.left = left + 'px';
        tutorialBoxRef.current.style.top = top  + 'px';
        tutorialBoxRef.current.style.width = width + 'px';
        tutorialBoxRef.current.style.height = height + 'px';
  
        tutorialTextRef.current.style.top = top - 70 + 'px';
        tutorialTextRef.current.style.left = left + 'px';
        tutorialTextRef.current.innerText = "You can analyze your study habits here!";
      }, 500);

      setTimeout(() => {
        setTutorial(13);
      }, 4000);
    }
  }, [tutorial]);

  
  useEffect(() => {
    if (!viewDate || !statsViewer || !subjects) return;

    const { daily, weekly, monthly } = subjects;

    if (!daily) return;

    const now = DateTime.now().startOf('day');
    const viewDateTime = DateTime.fromJSDate(viewDate);

    if (statsViewer === 'Daily') {
      //top box renderer
      const index = viewDateTime.diff(now, 'days').toObject();
      const { total, grouped } = daily;
      const actualIndex = grouped.length + index.days - 1;
      const totalStudyDisp = secondConverter(total[actualIndex]);
      setTotalStudy(`${totalStudyDisp.value}${totalStudyDisp.type}`);
      const focus = focusCalculator(grouped[actualIndex]);
      const { value, type } = secondConverter(focus);
      setFocus(`${value}${type}`);
    } else if (statsViewer === 'Weekly') {

      //top box renderer
      const index = viewDateTime.startOf('week').diff(DateTime.now().startOf('week'), 'weeks').toObject();
      const { total, grouped } = weekly;
      const actualIndex = grouped.length + index.weeks - 1;
      const totalStudyDisp = secondConverter(total[actualIndex]);
      setTotalStudy(`${totalStudyDisp.value}${totalStudyDisp.type}`);
      const focus = focusCalculator(grouped[actualIndex]);
      const { value, type } = secondConverter(focus);
      setFocus(`${value}${type}`);
    } else {

      //top box renderer
      const index = viewDateTime.startOf('month').diff(DateTime.now().startOf('month'), 'months').toObject();
      const { total, grouped } = monthly;
      const actualIndex = grouped.length + index.months - 1;
      const totalStudyDisp = secondConverter(total[actualIndex]);
      setTotalStudy(`${totalStudyDisp.value}${totalStudyDisp.type}`);
      const focus = focusCalculator(grouped[actualIndex]);
      const { value, type } = secondConverter(focus);
      setFocus(`${value}${type}`);
    }
  }, [viewDate, statsViewer, subjects]);

  useEffect(() => {
    if (!userInfo) return;
    const viewDateTime = DateTime.fromJSDate(viewDate);
    setTimeout(() => {
      fetch(`${config.server}/extension/usage?date=${viewDateTime.toISODate()}&mode=${statsViewer}`,
      {
        method: "GET",
        credentials: 'include'
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
    }, 1900);
  }, [userInfo, viewDate, statsViewer]);

  return (
    <div>
      <CalendarModal
        isOpen={isCalendarOpen}
        setIsOpen={setIsCalendarOpen}
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
              <WebsiteUsageChart 
                websites={websites}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Stats;/*  */