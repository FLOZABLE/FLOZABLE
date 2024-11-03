"use client";

import styled from "@emotion/styled";
import styles from "./Planner.module.css";
import FullCalendar from "@fullcalendar/react";
import timeGridPlugin from "@fullcalendar/timegrid";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import { useCallback, useContext, useEffect, useRef, useState } from "react";
import { PlansContext, SubjectsContext } from "@/app/utils/Contexts";
import DateSelectorBtn from "../../Buttons/DateSelectorBtn/DateSelectorBtn";
import { DEFAULT_PLAN } from "@/app/utils/Constant";
import { patchPlan, patchPlanGoogle } from "@/Api/plansApi";
import ViewerSelectorBtn from "../../Buttons/ViewerSelectorBtn/ViewerSelectorBtn";
import { DateTime } from "luxon";

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

  thead .fc-scroller-harness .fc-scroller {
    overflow: hidden !important;
  }

  .fc-scroller.fc-scroller-liquid-absolute::-webkit-scrollbar-track {
    -webkit-box-shadow: inset 0 0 0.375rem rgba(0, 0, 0, 0.3);
    border-radius: 0.625rem;
  }

  .fc-scroller.fc-scroller-liquid-absolute::-webkit-scrollbar {
    width: 1rem;
  }

  .fc-scroller.fc-scroller-liquid-absolute::-webkit-scrollbar-thumb {
    border-radius: 0.625rem;
    -webkit-box-shadow: inset 0 0 0.375rem rgba(0, 0, 0, 0.3);
    background-color: #555555;
  }

  /* .fc-dayGridMonth-view .fc-event-main-frame {
    flex-direction: column;
  } */

  .fc-dayGridMonth-view .fc-event-time {
    display: none;
  }

  .fc-event-title {
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  /* .fc-event {
    container-type: inline-size;
    container-name: planContainer;
  }

  @container planContainer (max-width: 30px) {
    .my-element {
      background-color: lightcoral;
    }
  } */
`;

function PlanHeader(info, viewer) {
  const date = DateTime.fromMillis(info.date.getTime());
  const weekDay = date.weekdayShort;
  const day = date.day;
  return (
    <div>
      <p className="weekDay">{weekDay}</p>
      {viewer !== "dayGridMonth" ? <p className="day">{day}</p> : ""}
    </div>
  );
}

export default function Planner() {
  const { plans, setPlans, planModal, setPlanModal } = useContext(PlansContext);
  const { subjects } = useContext(SubjectsContext);

  const plannerRef = useRef(null);

  const [viewDate, setViewDate] = useState(
    new Date(new Date().setHours(0, 0, 0, 0))
  );
  const [viewer, setViewer] = useState("month");
  const [PlannerApi, setPlannerApi] = useState(null);
  const [lastClick, setLastClick] = useState(new Date().getTime());

  useEffect(() => {
    if (!plannerRef?.current) return;

    setPlannerApi(plannerRef.current.getApi());
  }, [plannerRef]);

  useEffect(() => {
    if (!PlannerApi || !viewDate || !viewer) return;

    PlannerApi.gotoDate(viewDate);
    PlannerApi.changeView(
      viewer === "day"
        ? "timeGridDay"
        : viewer === "week"
        ? "timeGridWeek"
        : "dayGridMonth"
    );
  }, [PlannerApi, viewDate, viewer]);

  const onDateSelect = useCallback(
    (selectInfo) => {
      const now = new Date().getTime();

      if (now - lastClick < 1000) {
        PlannerApi?.unselect();
        return;
      }

      setLastClick(now);

      const start = selectInfo.start ? new Date(selectInfo.start) : new Date();
      const end = selectInfo.end ? new Date(selectInfo.end) : new Date();

      if (!start || !end) return;

      if (!planModal.plan_id) {
        const subject = subjects?.[0];
        const subject_id = subject?.subject_id;
        const color = subject ? subject.color : "#000000";

        const newPlan = {
          ...DEFAULT_PLAN,
          plan_id: "0000000000",
          opened: true,
          start,
          end,
          subject_id,
        };
        setPlanModal(newPlan);
        newPlan.backgroundColor = color;
        newPlan.borderColor = color;
        setPlans((prev) => [...prev, newPlan]);
      } else {
        setPlanModal((prev) => ({ ...prev, start, end }));

        setPlans((prev) => {
          const newPlans = [...prev];
          const foundIndex = newPlans.findIndex(
            (val) => val.plan_id === planModal.plan_id
          );
          if (foundIndex !== -1) {
            newPlans[foundIndex] = { ...newPlans[foundIndex], start, end };
          }

          return newPlans;
        });
      }
    },
    [planModal, subjects, PlannerApi, lastClick]
  );

  const onEventDrop = useCallback(
    (dropInfo) => {
      try {
        const { start } = dropInfo.event;
        const { plan_id } = dropInfo.event._def.extendedProps;
        const end = dropInfo.event.end ? dropInfo.event.end : start;

        const planIndex = plans.findIndex((plan) => plan.plan_id === plan_id);
        if (planIndex === -1) return;

        const updatedEvents = [...plans];
        updatedEvents[planIndex] = { ...updatedEvents[planIndex], start, end };
        setPlans(updatedEvents);

        if (plan_id === planModal.plan_id) {
          setPlanModal((prev) => ({ ...prev, start, end }));
        }

        if (plan_id === "0000000000") return;

        console.log(updatedEvents[planIndex].type);

        if (updatedEvents[planIndex].type === "google") {
          patchPlanGoogle(updatedEvents[planIndex]);
        } else {
          patchPlan(updatedEvents[planIndex]);
        }
      } catch (err) {
        console.log(err);
      }
    },
    [planModal, plans]
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

  const onEventResize = useCallback(
    (resizeInfo) => {
      try {
        const { start } = resizeInfo.event;
        const { plan_id } = resizeInfo.event._def.extendedProps;
        const end = resizeInfo.event.end ? resizeInfo.event.end : start;

        const planIndex = plans.findIndex((plan) => plan.plan_id === plan_id);
        if (planIndex === -1) return;

        const updatedEvents = [...plans];
        updatedEvents[planIndex] = { ...updatedEvents[planIndex], start, end };
        setPlans(updatedEvents);

        if (plan_id === planModal.plan_id) {
          setPlanModal((prev) => ({ ...prev, start, end }));
        }

        if (plan_id === "0000000000") return;

        if (updatedEvents[planIndex].type === "google") {
          patchPlanGoogle(updatedEvents[planIndex]);
        } else {
          patchPlan(updatedEvents[planIndex]);
        }
      } catch (err) {
        console.log(err);
      }
    },
    [planModal]
  );

  return (
    <StyleWrapper className={styles.Planner}>
      <div className={styles.header}>
        <ViewerSelectorBtn viewer={viewer} setViewer={setViewer} />
        <DateSelectorBtn
          viewDate={viewDate}
          setViewDate={setViewDate}
          viewer={viewer}
        />
      </div>
      <FullCalendar
        /* dayHeaderContent={(info) => PlanHeader(info, viewer)} */
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
          viewer === "day"
            ? "timeGridDay"
            : viewer === "week"
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
        eventDrop={onEventDrop}
        eventClick={onEventClick}
        eventResize={onEventResize}
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
