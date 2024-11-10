"use client";

import SubjectsPie from "@/app/components/Charts/SubjectsPie/SubjectsPie";
import styles from "./page.module.css";
import { useContext, useState } from "react";
import StudyTrendChart from "@/app/components/Charts/StudyTrendChart/StudyTrendChart";
import RankingsTrendsChart from "@/app/components/Charts/RankingsTrendsChart/RankingsTrendsChart";
import { SubjectsContext } from "@/app/utils/Contexts";
import WebsiteUsageChart from "@/app/components/Charts/WebsiteUsageChart/WebsiteUsageChart";
import { useAccount } from "@/Hooks/accountHooks";

function Stats({}) {
  const { accountData } = useAccount();
  const { subjects } = useContext(SubjectsContext);

  const [viewDate, setViewDate] = useState(
    new Date(new Date().setHours(0, 0, 0, 0))
  );
  const [viewer, setViewer] = useState("day");

  console.log(userInfo);

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
