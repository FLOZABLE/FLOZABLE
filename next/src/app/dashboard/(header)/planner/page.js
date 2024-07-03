"use client";

import React, { useState, useContext } from "react";
import styles from "./page.module.css";
import EventPlanner from "@/app/components/Plans/EventPlanner/EventPlanner";
import RadioBtn from "@/app/components/Buttons/RadioBtn/RadioBtn";
import GoogleLoginBtn from "@/app/components/Buttons/GoogleLoginBtn/GoogleLoginBtn";
import SmallCalendar from "@/app/components/Plans/SmallCalendar/SmallCalendar";
import PlanTimeline from "@/app/components/Plans/PlanTimeline/PlanTimeline";
import { PlansContext } from "@/app/utils/Contexts";

function Planner({}) {
  const {refetchPlans} = useContext(PlansContext);

  const [viewMode, setViewMode] = useState("timeGridWeek");
  const [viewDate, setViewDate] = useState(
    new Date(new Date().setHours(0, 0, 0, 0))
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
              <GoogleLoginBtn
                onSuccess={() => {
                  refetchPlans();
                }}
              />
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
