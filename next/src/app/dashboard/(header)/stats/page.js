"use client";

import CalendarModal from "@/app/components/Modals/CalendarModal/CalendarModal";
import styles from "./page.module.css";
import { useContext, useEffect, useRef, useState } from "react";
import DateSelectorBtn from "@/app/components/Buttons/DateSelectorBtn/DateSelectorBtn";
import RadioBtn from "@/app/components/Buttons/RadioBtn/RadioBtn";
import SubjectsPie from "@/app/components/Charts/SubjectsPie";
import {
  IconBook,
  IconEyeOutline,
  IconMonitor,
  IconStatsChart,
} from "@/app/utils/Svg";
import { SubjectsContext, TutorialsContext } from "@/app/utils/Contexts";
import { focusCalculator, secondConverter } from "@/app/utils/Tool";
import { DateTime } from "luxon";
import StudyTrendChart from "@/app/components/Charts/StudyTrendChart/StudyTrendChart";
import RankingTrendChart from "@/app/components/Charts/RankingTrendChart";
import WebsiteUsageChart from "@/app/components/Charts/WebsiteUsageChart/WebsiteUsageChart";
import { useExtensionUsage } from "@/Hooks/extensionHooks";
import CircularLoading from "@/app/components/LoadingScreen/CircularLoading/CircularLoading";
import { useAccount } from "@/Hooks/accountHooks";

function Stats({}) {
  const { userInfo } = useAccount();
  const { subjects } = useContext(SubjectsContext);
  const { tutorialBoxRef, tutorialTextRef, tutorial, setTutorial } =
    useContext(TutorialsContext);

  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [viewDate, setViewDate] = useState(
    new Date(new Date().setHours(0, 0, 0, 0))
  );
  const [statsViewer, setStatsViewer] = useState("day");

  const [totalStudy, setTotalStudy] = useState("");
  const [focus, setFocus] = useState("");
  const [ranking, setRanking] = useState(0);

  const [websitesUsage, setWebsitesUsage] = useState("0 s");
  const [websitesVisit, setWebsitesVisit] = useState(0);

  const statsRef = useRef(null);

  const { data: websitesData, isLoading: isWebsitesDataLoading } =
    useExtensionUsage(viewDate, statsViewer);

  useEffect(() => {
    if (tutorial === 12) {
      setTimeout(() => {
        const { width, top, left, height } =
          statsRef.current.getBoundingClientRect();
        tutorialBoxRef.current.style.left = left + "px";
        tutorialBoxRef.current.style.top = top + "px";
        tutorialBoxRef.current.style.width = width + "px";
        tutorialBoxRef.current.style.height = height + "px";

        tutorialTextRef.current.style.top = top - 70 + "px";
        tutorialTextRef.current.style.left = left + "px";
        tutorialTextRef.current.innerText =
          "You can analyze your study habits here!";
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

    const now = DateTime.now().startOf("day");
    const viewDateTime = DateTime.fromJSDate(viewDate);

    if (statsViewer === "day") {
      //top box renderer
      const index = viewDateTime.diff(now, "days").toObject();
      const { total, grouped } = daily;
      const actualIndex = grouped.length + index.days - 1;
      const totalStudyDisp = secondConverter(total[actualIndex]);
      setTotalStudy(`${totalStudyDisp.value}${totalStudyDisp.type}`);
      const focus = focusCalculator(grouped[actualIndex]);
      const { value, type } = secondConverter(focus);
      setFocus(`${value}${type}`);
    } else if (statsViewer === "week") {
      //top box renderer
      const index = viewDateTime
        .startOf("week")
        .diff(DateTime.now().startOf("week"), "weeks")
        .toObject();
      const { total, grouped } = weekly;
      const actualIndex = grouped.length + index.weeks - 1;
      const totalStudyDisp = secondConverter(total[actualIndex]);
      setTotalStudy(`${totalStudyDisp.value}${totalStudyDisp.type}`);
      const focus = focusCalculator(grouped[actualIndex]);
      const { value, type } = secondConverter(focus);
      setFocus(`${value}${type}`);
    } else {
      //top box renderer
      const index = viewDateTime
        .startOf("month")
        .diff(DateTime.now().startOf("month"), "months")
        .toObject();
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
    if (!websitesData?.success || !websitesData.websites.length) return;

    const websitesUsage = websitesData.websites.reduce((a, b) => a.t + b.t);

    const websitesVisit = websitesData.websites.reduce((a, b) => a.v + b.v);

    const websitesUsagesDisp = secondConverter(websitesUsage);
    setWebsitesUsage(`${websitesUsagesDisp.value} ${websitesUsagesDisp.type}`);
    setWebsitesVisit(websitesVisit);
  }, [websitesData]);

  return (
    <div className="Main">
      <CalendarModal
        isOpen={isCalendarOpen}
        setIsOpen={setIsCalendarOpen}
        updateViewDate={setViewDate}
        viewDate={viewDate}
        showHeatmap={true}
      />
      {/* <div className="title">Stats</div> */}
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
              { view: "day", value: "day" },
              { view: "week", value: "week" },
              { view: "month", value: "month" },
            ]}
            changeEvent={setStatsViewer}
            defaultViewer={0}
          />
        </div>
        <div className={styles.layer}>
          <div className={`${styles.box} BoxContainer`}>
            <div>
              <SubjectsPie statsViewer={statsViewer} viewDate={viewDate} />
            </div>
            <div id={styles.studyInfo}>
              <div>
                <i>
                  <IconBook />
                </i>
                Total Study Time {totalStudy}
              </div>
              <div>
                <i>
                  <IconMonitor />
                </i>
                Website Usage Time {websitesUsage} / {websitesVisit} times
              </div>
              <div>
                <i>
                  <IconStatsChart />
                </i>
                Ranking {ranking}
              </div>
              <div>
                <i>
                  <IconEyeOutline />
                </i>
                Focus {focus}
              </div>
            </div>
          </div>
        </div>
        <div className={styles.layer}>
          <div className={`${styles.box} BoxContainer`}>
            <StudyTrendChart viewDate={viewDate} statsViewer={statsViewer} />
          </div>
        </div>
        <div className={styles.layer}>
          <div className={`${styles.box} BoxContainer`}>
            <RankingTrendChart
              viewDate={viewDate}
              statsViewer={statsViewer}
              setRanking={setRanking}
              userInfo={userInfo}
            />
          </div>
        </div>
        <div className={styles.layer}>
          <div className={`${styles.box} BoxContainer`}>
            <div>
              {isWebsitesDataLoading || !websitesData?.success ? (
                <CircularLoading />
              ) : (
                <WebsiteUsageChart websites={websitesData.websites} />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Stats; /*  */
