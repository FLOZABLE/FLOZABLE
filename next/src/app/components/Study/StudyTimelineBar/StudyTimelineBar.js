import React, { useState, useCallback, useContext } from "react";
import styles from "./StudyTimelineBar.module.css";
import styled from "@emotion/styled";
import { PlanModalContext, PlansContext } from "@/app/utils/Contexts";
import FullCalendar from "@fullcalendar/react";
import timelinePlugin from "@fullcalendar/timeline";

const StyleWrapper = styled.div`
  .fc-scroller.fc-scroller-liquid-absolute::-webkit-scrollbar-track {
    -webkit-box-shadow: inset 0 0 0.375rem gray;
    border-radius: 0.625rem;
    position: absolute;
  }

  .fc-scroller.fc-scroller-liquid-absolute::-webkit-scrollbar {
    width: 0.75rem;
    height: 1rem;
    position: absolute;
  }

  .fc-scroller.fc-scroller-liquid-absolute::-webkit-scrollbar-thumb {
    border-radius: 0.625rem;
    -webkit-box-shadow: inset 0 0 0.375rem gray;
    background-color: gray;
    position: absolute;
  }
`;

function StudyTimelineBar() {
  const { planModal, setPlanModal } = useContext(PlanModalContext);
  const { plans, setPlans, setPlansDate } = useContext(PlansContext);

  const [viewDate, setViewDate] = useState(
    new Date(new Date().setHours(0, 0, 0, 0))
  );

  const onEventClick = useCallback((clickInfo) => {
    const { start, end, title } = clickInfo.event;
    const editable = clickInfo.event._def.extendedProps.isEditable;
    const planInfo = {
      ...clickInfo.event._def.extendedProps,
      start,
      end: end ? end : start,
      title,
      editable,
    };
    console.log(planInfo, clickInfo.event);
    setPlanModal((prev) => ({ ...prev, ...planInfo, opened: true }));
  }, []);

  return (
    <StyleWrapper className={styles.StudyTimelineBar}>
      <FullCalendar
        schedulerLicenseKey="CC-Attribution-NonCommercial-NoDerivatives"
        height={"100%"}
        slotMinWidth={200}
        plugins={[timelinePlugin]}
        events={plans}
        headerToolbar={false}
        initialView="timelineDay"
        slotDuration="01:00:00" // 1-hour slots
        initialDate={viewDate} //
        dragScroll={true}
        eventClick={onEventClick}
        selectAllow={true}
        selectable={true}
      />
    </StyleWrapper>
  );
}

export default StudyTimelineBar;
