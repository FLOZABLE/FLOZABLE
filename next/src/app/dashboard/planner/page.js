"use client";

import React, { useState, useEffect, useRef } from "react";
import styles from "./page.module.css";
import { GoogleOAuthProvider } from "@react-oauth/google";
import EventPlanner from "@/Components/Plans/EventPlanner/EventPlanner";
import RadioBtn from "@/Components/Buttons/RadioBtn/RadioBtn";
import GoogleLoginBtn from "@/Components/Buttons/GoogleLoginBtn/GoogleLoginBtn";
import SmallCalendar from "@/Components/Plans/SmallCalendar/SmallCalendar";
import PlanTimeline from "@/Components/Plans/PlanTimeline/PlanTimeline";

const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

function Planner(props) {
  const [viewMode, setViewMode] = useState("timeGridWeek");
  const [viewDate, setViewDate] = useState(
    new Date(new Date().setHours(0, 0, 0, 0)),
  );
  const PlannerRef = useRef(null);
  const [PlannerApi, setPlannerApi] = useState(null);
  const SmallCalendarRef = useRef(null);
  const [SmallCalendarApi, setSmallCalendarApi] = useState(null);

  const updateViewer = (item) => {
    setViewMode(item);
  };

  const updateViewDate = (date) => {
    setViewDate(date);
  };

  useEffect(() => {
    //setPlannerApi(PlannerRef.current.getApi());
  }, [PlannerRef]);

  useEffect(() => {
    //setSmallCalendarApi(SmallCalendarRef.current.getApi());
  }, [SmallCalendarRef]);

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
                changeEvent={updateViewer}
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
                PlannerRef={PlannerRef}
                PlannerApi={PlannerApi}
              />
            </div>
            <div className={styles.widget}>
              <GoogleOAuthProvider clientId={googleClientId}>
                <GoogleLoginBtn />
              </GoogleOAuthProvider>
              <div className={styles.smallCalendarWrapper}>
                <SmallCalendar
                  width={"100%"}
                  setViewDate={updateViewDate}
                  viewDate={viewDate}
                  PlannerApi={PlannerApi}
                />
              </div>

              {/* <DropDownButton options={[{name:'Does not repeat', value: 0}, {name: 'Daily', value: 1}, {name: 'Weekly', value: 2}, {name: `Monthly`, value: 3}]} defaultIndex={0} setValue={setSubjectsOptions} /> */}
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