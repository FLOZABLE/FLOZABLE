"use client";

import React, { useState, useEffect, useRef } from "react";
import styles from "./page.module.css";
import { GoogleOAuthProvider } from "@react-oauth/google";
import EventPlanner from "@/app/components/Plans/EventPlanner/EventPlanner";
import RadioBtn from "@/app/components/Buttons/RadioBtn/RadioBtn";
import GoogleLoginBtn from "@/app/components/Buttons/GoogleLoginBtn/GoogleLoginBtn";
import SmallCalendar from "@/app/components/Plans/SmallCalendar/SmallCalendar";
import PlanTimeline from "@/app/components/Plans/PlanTimeline/PlanTimeline";

const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

function Planner({}) {
  const [viewMode, setViewMode] = useState("timeGridWeek");
  const [viewDate, setViewDate] = useState(
    new Date(new Date().setHours(0, 0, 0, 0)),
  );

  return (
    <div>
      <div className={`Main`}>
        <div className="title">Planner</div>
        <div className={styles.Planner}>
          <div className={styles.header}>
            <div className={styles.modeBtnWrapper}>
              <RadioBtn
                items={[
                  { view: "Day", value: "timeGridDay" },
                  { view: "Week", value: "timeGridWeek" },
                  { view: "Month", value: "dayGridMonth" },
                ]}
                changeEvent={setViewMode}
                defaultViewer={1}
              />
            </div>
          </div>
          <div className={styles.container}>
            <div className={styles.planner}>
              <EventPlanner
                viewDate={viewDate}
                setViewDate={setViewDate}
                viewMode={viewMode}
              />
            </div>
            <div className={styles.widget}>
              <GoogleOAuthProvider clientId={googleClientId}>
                <GoogleLoginBtn />
              </GoogleOAuthProvider>
              <div className={styles.smallCalendarWrapper}>
                <SmallCalendar
                  width={"100%"}
                  setViewDate={setViewDate}
                  viewDate={viewDate}
                />
              </div>

              <div className={`${styles.planTimelineWrapper}`}>
                <PlanTimeline
                  viewDate={viewDate}
                  viewMode={viewMode}
                  mode={"planner"}
                  maxHeight="25rem"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Planner;