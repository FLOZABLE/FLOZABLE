"use client";

import styles from "./page.module.css";
import PlansTimeline from "@/app/components/Plans/PlansTimeline/PlansTimeline";
import SubjectsPie from "@/app/components/Charts/SubjectsPie/SubjectsPie";
import { useState } from "react";
import FriendsViewer from "@/app/components/Friends/FriendsViewer/FriendsViewer";

export default function Dashboard() {
  const [viewDate, setViewDate] = useState(
    new Date(new Date().setHours(0, 0, 0, 0))
  );
  const [viewer, setViewer] = useState("day");

  return (
    <div className={`Main`}>
      <div className={styles.Main}>
        <div className={styles.layer}>
          <div className={styles.left}>
            <div
              className={`${styles.box} BoxContainer`}
              id={styles.planTimeline}
              style={{ "--notes-color": "var(--gray2)" }}
            >
              <PlansTimeline
                setViewDate={setViewDate}
                viewDate={viewDate}
                viewer={viewer}
                maxHeight="calc(80vh)"
              />
            </div>
            <div
              className={`${styles.box} BoxContainer`}
              id={styles.SubjectsPie}
            >
              <SubjectsPie
                viewDate={viewDate}
                setViewDate={setViewDate}
                viewer={viewer}
                setViewer={setViewer}
              />
            </div>
          </div>
          <div className={styles.center}></div>
          <div className={styles.right}>
            <div
              className={`${styles.box} BoxContainer`}
              id={styles.FriendsActivityViewer}
            >
              <FriendsViewer />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
