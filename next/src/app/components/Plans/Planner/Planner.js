"use client";

import styled from "@emotion/styled";
import styles from "./Planner.module.css";
import FullCalendar from "@fullcalendar/react";
import timeGridPlugin from "@fullcalendar/timegrid";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import { useCallback, useContext, useEffect, useRef, useState } from "react";
import { PlansContext } from "@/app/utils/Contexts";
import DateSelectorBtn from "../../Buttons/DateSelectorBtn/DateSelectorBtn";

const StyleWrapper = styled.div`
  .fc-view-harness.fc-view-harness-active {
    height: 100% !important;
    overflow: hidden;
  }

  .fc.fc-media-screen.fc-direction-ltr.fc-theme-standard {
    flex: 1;
  }

  .fc-daygrid-day-top {
    flex-direction: row;
    margin-left: 0.5rem;
  }
`;

export default function Planner({ viewMode }) {
  const { plans, setPlanModal } = useContext(PlansContext);

  const plannerRef = useRef(null);

  const [viewDate, setViewDate] = useState(
    new Date(new Date().setHours(0, 0, 0, 0))
  );
  const [PlannerApi, setPlannerApi] = useState(null);

  useEffect(() => {
    if (!plannerRef?.current) return;

    setPlannerApi(plannerRef.current.getApi());
  }, [plannerRef]);

  useEffect(() => {
    if (!PlannerApi || !viewDate) return;

    PlannerApi.gotoDate(viewDate);
  }, [PlannerApi, viewDate]);

  const onDateSelect = useCallback((selectInfo) => {
    const start = selectInfo.start ? new Date(selectInfo.start) : new Date();
    const end = selectInfo.end ? new Date(selectInfo.end) : new Date();

    if (!start || !end) return;

    
  }, [])

  return (
    <StyleWrapper className={styles.Planner}>
      <div className={styles.header}>
        <DateSelectorBtn
          viewDate={viewDate}
          setViewDate={setViewDate}
          viewMode={viewMode}
        />
      </div>
      <FullCalendar
        ref={plannerRef}
        firstDay={1}
        key={"dsader3wt45"}
        slotDuration={"00:15:00"}
        slotLabelInterval={{ hours: 1 }}
        allDaySlot={false}
        slotLabelFormat={{
          hour: "numeric",
          hour12: true,
        }}
        headerToolbar={{ left: "", right: "", center: "" }}
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView={
          viewMode === "day"
            ? "timeGridDay"
            : viewMode === "week"
            ? "timeGridWeek"
            : "dayGridMonth"
        }
        editable={true}
        selectable={true}
        selectMirror={true}
        dayMaxEvents={true}
        events={plans}
        dateClick={onDateSelect}
        select={onDateSelect}
        /* eventContent={renderEventContent}
        dateClick={handleDateSelect}
        select={handleDateSelect}
        eventDrop={handleEventDateDrop}
        eventResize={handleEventResize}
        eventClick={handleEventClick} */
        eventDisplay="block"
      />
    </StyleWrapper>
  );
}
