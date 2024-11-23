"use client";

import WelcomeModal from "@/app/components/Modals/WelcomeModal/WelcomeModal";
import styles from "./page.module.css";
import PlansTimeline from "@/app/components/Plans/PlansTimeline/PlansTimeline";
import FriendsActivityViewer from "@/app/components/Friends/FriendsActivityViewer/FriendsActivityViewer";
import SubjectsPie from "@/app/components/Charts/SubjectsPie/SubjectsPie";
import { useState } from "react";
import { useReportWebVitals } from "next/web-vitals";

export default function Dashboard() {
  const [viewDate, setViewDate] = useState(
    new Date(new Date().setHours(0, 0, 0, 0))
  );
  const [viewer, setViewer] = useState("day");

  useReportWebVitals((metric) => {
    console.log("web vital", metric)
    /* window?.gtag("event", metric.name, {
      value: Math.round(
        metric.name === "CLS" ? metric.value * 1000 : metric.value
      ), // values must be integers
      event_label: metric.id, // id unique to current page load
      non_interaction: true, // avoids affecting bounce rate.
    });

    switch (metric.name) {
      case "FCP": {
        // handle FCP results
      }
      case "LCP": {
        // handle LCP results
      }
      // ...
    } */
  });

  return (
    <div className={`Main`}>
      <WelcomeModal />
      <div className={styles.Main}>
        <div className={styles.layer}>
          {/* <div className={`BoxContainer ${styles.box}`} id={styles.calendar}>
            <div className={styles.title}>Calendar</div>
          </div> */}
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
            id={styles.FriendsActivityViewer}
          >
            <FriendsActivityViewer />
          </div>
          <div className={`${styles.box} BoxContainer`} id={styles.SubjectsPie}>
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
