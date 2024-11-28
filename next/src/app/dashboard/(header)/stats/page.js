"use client";

import SubjectsPie from "@/app/components/Charts/SubjectsPie/SubjectsPie";
import styles from "./page.module.css";
import { useEffect, useState } from "react";
import StudyTrendChart from "@/app/components/Charts/StudyTrendChart/StudyTrendChart";
import RankingsTrendsChart from "@/app/components/Charts/RankingsTrendsChart/RankingsTrendsChart";
import WebsiteUsageChart from "@/app/components/Charts/WebsiteUsageChart/WebsiteUsageChart";
import { useAccount } from "@/Hooks/accountHooks";
import { useSubjects } from "@/Hooks/subjectsHooks";
import StudyHeatMap from "@/app/components/Charts/StudyHeatMap/StudyHeatMap";
import SubjectsTimeline from "@/app/components/Charts/SubjectsTimeline/SubjectsTimeline";
import { useTour } from "@reactour/tour";

function Stats({}) {
  const { accountData } = useAccount();
  const { subjects } = useSubjects();

  const { currentStep, setCurrentStep, setIsOpen } = useTour();

  const [viewDate, setViewDate] = useState(
    new Date(new Date().setHours(0, 0, 0, 0))
  );
  const [viewer, setViewer] = useState("day");

  useEffect(() => {
    if (currentStep === 14) {
      setTimeout(() => {
        setCurrentStep(15);
      }, 1000);
    } else if (currentStep === 15) {
      setTimeout(() => {
        setCurrentStep(16);
      }, 3000);
    }
  }, [currentStep]);

  return (
    <div className="Main">
      <div className={styles.Stats}>
        <div className={styles.layer}>
          <div
            className={`BoxContainer ${styles.boxContainer}`}
            id={styles.StudyTrendChart}
            data-tutorial={15}
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
            data-tutorial={16}
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
            data-tutorial={18}
          >
            <StudyHeatMap viewDate={viewDate} setViewDate={setViewDate} />
          </div>
          <div
            className={`BoxContainer ${styles.boxContainer}`}
            id={styles.RankingsTrendsChart}
            data-tutorial={19}
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
            data-tutorial={20}
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
