"use client";

import SubjectsPie from "@/app/components/Charts/SubjectsPie/SubjectsPie";
import styles from "./page.module.css";
import { useState } from "react";
import StudyTrendChart from "@/app/components/Charts/StudyTrendChart/StudyTrendChart";
import RankingsTrendsChart from "@/app/components/Charts/RankingsTrendsChart/RankingsTrendsChart";
import { useAccount } from "@/Hooks/accountHooks";

function Stats({}) {
  const { userInfo } = useAccount();

  const [viewDate, setViewDate] = useState(
    new Date(new Date().setHours(0, 0, 0, 0))
  );
  const [viewer, setViewer] = useState("day");

  return (
    <div className="Main">
      <div className={styles.Stats}>
        <div className={styles.layer}>
          <div className={`BoxContainer ${styles.box}`} id={styles.subjectsPie}>
            <SubjectsPie viewDate={viewDate} viewer={viewer} />
          </div>
          <div
            className={`BoxContainer ${styles.box}`}
            id={styles.studyTrendChart}
          >
            <StudyTrendChart
              viewDate={viewDate}
              setViewDate={setViewDate}
              viewer={viewer}
            />
          </div>
        </div>
        <div className={styles.layer}>
          <div
            className={`BoxContainer ${styles.box}`}
            id={styles.RankingsTrendsChart}
          >
            <RankingsTrendsChart
              viewDate={viewDate}
              setViewDate={setViewDate}
              viewer={viewer}
              userInfo={userInfo}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Stats; /*  */
