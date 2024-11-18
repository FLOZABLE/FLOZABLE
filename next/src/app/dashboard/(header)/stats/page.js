"use client";

import SubjectsPie from "@/app/components/Charts/SubjectsPie/SubjectsPie";
import styles from "./page.module.css";
import { useState } from "react";
import StudyTrendChart from "@/app/components/Charts/StudyTrendChart/StudyTrendChart";
import RankingsTrendsChart from "@/app/components/Charts/RankingsTrendsChart/RankingsTrendsChart";
import WebsiteUsageChart from "@/app/components/Charts/WebsiteUsageChart/WebsiteUsageChart";
import { useAccount } from "@/Hooks/accountHooks";
import { useSubjects } from "@/Hooks/subjectsHooks";
import StudyHeatMap from "@/app/components/Charts/StudyHeatMap/StudyHeatMap";
import SubjectsTimeline from "@/app/components/Charts/SubjectsTimeline/SubjectsTimeline";

function Stats({}) {
  const { accountData } = useAccount();
  const { subjects } = useSubjects();

  const [viewDate, setViewDate] = useState(
    new Date(new Date().setHours(0, 0, 0, 0))
  );
  const [viewer, setViewer] = useState("day");

  return (
    <div className="Main">
      <div className={styles.Stats}>
        <div className={styles.layer}>
          <div
            className={`BoxContainer ${styles.boxContainer}`}
            id={styles.StudyTrendChart}
          >
            <StudyTrendChart
              viewDate={viewDate}
              setViewDate={setViewDate}
              viewer={viewer}
              subjects={subjects}
              userId={accountData?.user_id}
            />
          </div>
          <div
            className={`BoxContainer ${styles.boxContainer}`}
            id={styles.RankingsTrendsChart}
          >
            <RankingsTrendsChart
              viewDate={viewDate}
              setViewDate={setViewDate}
              viewer={viewer}
              userId={accountData?.user_id}
            />
          </div>
          <div
            className={`BoxContainer ${styles.boxContainer}`}
            id={styles.StudyHeatMap}
          >
            <StudyHeatMap viewDate={viewDate} setViewDate={setViewDate} />
          </div>
          <div
            className={`BoxContainer ${styles.boxContainer}`}
            id={styles.RankingsTrendsChart}
          >
            <SubjectsTimeline viewDate={viewDate} />
          </div>
          {/* <div
            className={`BoxContainer ${styles.boxContainer}`}
            id={styles.WebsiteUsageChart}
          >
            <WebsiteUsageChart viewDate={viewDate} viewer={viewer} />
          </div> */}
          <div
            className={`BoxContainer ${styles.boxContainer}`}
            id={styles.WebsiteUsageChart}
          >
            <WebsiteUsageChart viewDate={viewDate} viewer={viewer} />
          </div>
        </div>
        <div className={styles.right}>
          <div className={styles.SubjectsPie}>
            <SubjectsPie
              viewDate={viewDate}
              setViewDate={setViewDate}
              viewer={viewer}
              setViewer={setViewer}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Stats; /*  */
