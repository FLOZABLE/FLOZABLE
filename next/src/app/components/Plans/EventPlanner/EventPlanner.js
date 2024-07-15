import React, { useState, useEffect, useContext, useRef } from "react";
import FullCalendar from "@fullcalendar/react";
import timeGridPlugin from "@fullcalendar/timegrid";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import styles from "./EventPlanner.module.css";
import styled from "@emotion/styled";
import { DateTime } from "luxon";
import {
  PlansContext,
  ResponseContext,
  SubjectsContext,
} from "@/app/utils/Contexts";
import config from "@/app/utils/config";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAngleLeft, faAngleRight } from "@fortawesome/free-solid-svg-icons";
import { patchPlan } from "@/Api/planApi";

const StyleWrapper = styled.div`
  .fc-view-harness.fc-view-harness-active {
    height: 100% !important;
    background-color: #000;
    border-radius: 1rem;
    overflow: hidden;
  }

  .fc.fc-media-screen.fc-direction-ltr.fc-theme-standard {
    height: 100%;
  }
`;

function EventPlanner({ viewMode, viewDate, setViewDate }) {
  const PlannerRef = useRef(null);
  const [PlannerApi, setPlannerApi] = useState(null);
  const { plans, setPlans, planModal, setPlanModal } = useContext(PlansContext);
  const { setResponse } = useContext(ResponseContext);

  const [dateText, setDateText] = useState(null);
  const [viewText, setViewText] = useState({
    year: "numeric",
    month: "long",
  });
  //const [searchParams, setSearchParams] = useSearchParams();
  const [lastClick, setLastClick] = useState(new Date().getTime());

  useEffect(() => {
    if (!PlannerRef || !PlannerRef.current) return;

    setPlannerApi(PlannerRef.current.getApi());
  }, [PlannerRef]);

  function renderEventContent(eventInfo) {
    return (
      <div>
        {/* <b>{eventInfo.timeText}</b> */}
        <p
          style={{
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {eventInfo.event.title}
        </p>
      </div>
    );
  }

  function renderHeader(info) {
    const date = DateTime.fromMillis(info.date.getTime());
    const weekDay = date.weekdayShort;
    const day = date.day;
    return (
      <div>
        <p className="weekDay">{weekDay}</p>
        {viewMode !== "dayGridMonth" ? <p className="day">{day}</p> : ""}
      </div>
    );
  }

  function handleDateSelect(selectInfo) {
    const now = new Date().getTime();

    if (now - lastClick < 1000) {
      PlannerRef.current.getApi().unselect();
      return;
    }

    setLastClick(now);

    const start = selectInfo.start ? new Date(selectInfo.start) : new Date();
    const end = selectInfo.end ? new Date(selectInfo.end) : new Date();

    if (!start || !end) return;

    if (!planModal.plan_id) {
      const planInfo = { ...planModal, start, end };

      setPlanModal((prev) => ({ ...prev, ...planInfo, opened: true }));
    } else {
      setPlans((prev) => {
        const foundIndex = prev.findIndex(
          (val) => val.plan_id === planModal.plan_id
        );
        if (foundIndex !== -1) {
          return [
            ...prev.slice(0, foundIndex),
            { ...prev[foundIndex], start, end },
            ...prev.slice(foundIndex + 1),
          ];
        }

        return prev;
      });
      setPlanModal((prev) => ({ ...prev, start, end }));
    }
  }

  async function handleEventDateDrop(data) {
    const { start } = data.event;
    const { plan_id } = data.event._def.extendedProps;
    if (data.event._def.extendedProps.access === "reader") {
      setResponse({ success: false, reason: "This event is view only" });
      return;
    }
    const end = data.event.end ? data.event.end : start;
    const eventIndex = plans.findIndex((event) => event.plan_id == plan_id);
    if (eventIndex !== -1) {
      const updatedEvents = [...plans];
      updatedEvents[eventIndex] = { ...updatedEvents[eventIndex], start, end };
      setPlans(updatedEvents);
      if (updatedEvents[eventIndex].saved) {
        const data = await patchPlan({ ...updatedEvents[eventIndex] });
        setResponse(data);
        setPlanModal((prev) => ({ ...prev, start, end }));
      } else {
        setPlanModal((prev) => ({ ...prev, start, end, opened: true }));
      }
    }
  }

  async function handleEventResize(data) {
    const { start } = data.event;
    const { plan_id } = data.event._def.extendedProps;
    if (data.event._def.extendedProps.access === "reader") {
      setResponse({ success: false, reason: "This event is view only" });
      return;
    }
    const end = data.event.end ? data.event.end : start;
    const eventIndex = plans.findIndex((event) => event.plan_id == plan_id);
    if (eventIndex !== -1) {
      const updatedEvents = [...plans];
      updatedEvents[eventIndex] = { ...updatedEvents[eventIndex], start, end };
      setPlans(updatedEvents);
      if (updatedEvents[eventIndex].saved) {
        const data = await patchPlan({ ...updatedEvents[eventIndex] });
        setResponse(data);
        setPlanModal((prev) => ({ ...prev, start, end }));
      } else {
        setPlanModal((prev) => ({ ...prev, start, end, opened: true }));
      }
    }
  }

  async function updateServer(event) {
    const { start, end, completed, editable } = event;
    if (!editable) {
      setResponse({ success: false, reason: "This event is view only" });
      return;
    }
    /* const startSec = Math.floor(start.getTime() / (1000 * 60));
    const endSec = Math.floor(end.getTime() / (1000 * 60));
    const notification = parseInt(planModal.notification);
    const repeat = parseInt(planModal.repeat);
    const share = event.share.map((userInfo) => userInfo.user_id);

    const updateInfo = {
      ...event,
      start: startSec,
      end: endSec,
      completed: completed ? 1 : 0,
      notification,
      repeat,
      share,
    };
    delete updateInfo.saved;
    fetch(`${config.server}/plans/update`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updateInfo),
      credentials: "include",
    })
      .then((response) => response.json())
      .then((data) => {
        setResponse(data);
        if (data.success) {
          //setPlanModal(false);
        }
      })
      .catch((error) => console.error(error)); */

    const data = await patchPlan({ ...planModal });
  }

  function handleEventClick(data) {
    const { start, end, title } = data.event;
    const { plan_id } = data.event._def.extendedProps;
    const editable = data.event._def.extendedProps.isEditable;
    console.log(editable);
    const eventInfo = {
      ...data.event._def.extendedProps,
      plan_id,
      start,
      end: end ? end : start,
      title,
      editable,
    };
    setPlanModal((prev) => ({ ...prev, ...eventInfo, opened: true }));
  }

  useEffect(() => {
    if (!PlannerApi) return;

    const plannerDateTime = DateTime.fromJSDate(PlannerApi.getDate());
    const viewDateTime = DateTime.fromJSDate(viewDate);
    if (viewMode === "timeGridDay") {
      if (plannerDateTime.toISODate() !== viewDateTime.toISODate()) {
        PlannerApi.gotoDate(viewDate);
      }
    } else if (viewMode === "timeGridWeek") {
      if (
        !(
          viewDateTime
            .plus({ days: 1 })
            .startOf("week")
            .minus({ days: 1 })
            .toSeconds() <=
            plannerDateTime
              .plus({ days: 1 })
              .startOf("week")
              .minus({ days: 1 })
              .toSeconds() &&
          plannerDateTime
            .plus({ days: 1 })
            .endOf("week")
            .minus({ days: 1 })
            .toSeconds() <=
            viewDateTime
              .plus({ days: 1 })
              .endOf("week")
              .minus({ days: 1 })
              .toSeconds()
        )
      ) {
        PlannerApi.gotoDate(viewDate);
      }
    } else {
      const viewDateTime = DateTime.fromJSDate(viewDate);
      setDateText(viewDateTime.toFormat("MMMM, yyyy"));
      if (
        plannerDateTime.startOf("month").toSeconds() <=
          viewDateTime.startOf("month").toSeconds() ||
        viewDateTime.endOf("month").toSeconds() <=
          plannerDateTime.endOf("month").toSeconds()
      ) {
        PlannerApi.gotoDate(viewDate);
      }
    }
  }, [viewDate, viewMode, PlannerApi]);

  /* useEffect(() => {
    if (!plans.length) return;
    if (!!searchParams.get("plan")) {
      const searchingPlanId = searchParams.get("plan");
      let chosenEvent = plans.filter((calendarEvent) => calendarEvent.plan_id === searchingPlanId);
      if (chosenEvent.length) {
        setPlanModal({ ...chosenEvent[0], opened: true });
      }
      setSearchParams({});
    }

  }, [searchParams, plans]); */

  const handleTodayButtonClick = () => {
    const currentDate = new Date();
    PlannerApi.gotoDate(currentDate);
    setViewDate(new Date(currentDate.setHours(0, 0, 0, 0)));
  };

  const handlePrevBtn = () => {
    PlannerApi.prev();
    if (viewMode === "dayGridMonth") {
      const monthStart = new Date(
        viewDate.getFullYear(),
        viewDate.getMonth() - 1,
        1
      );
      PlannerApi.gotoDate(monthStart);
      setViewDate(monthStart);
    } else {
      setViewDate(PlannerApi.view.activeStart);
    }
  };

  const handleNextBtn = () => {
    PlannerApi.next();
    if (viewMode === "dayGridMonth") {
      const monthStart = new Date(
        viewDate.getFullYear(),
        viewDate.getMonth() + 1,
        1
      );
      PlannerApi.gotoDate(monthStart);
      setViewDate(monthStart);
    } else {
      setViewDate(PlannerApi.view.activeStart);
    }
  };

  useEffect(() => {
    if (PlannerApi) {
      PlannerApi.changeView(viewMode);
    }
    if (viewMode == "timeGridDay") {
      setViewText({
        year: "numeric",
        month: "long",
      });
    } else if (viewMode == "timeGridWeek") {
      setViewText({
        year: "numeric",
        month: "long",
      });
    } else {
      setViewText({
        year: "numeric",
        month: "long",
      });
    }
  }, [viewMode]);

  return (
    <StyleWrapper className={styles.EventPlanner}>
      <div className={styles.header}>
        <div className={styles.button} onClick={handlePrevBtn}>
          <FontAwesomeIcon icon={faAngleLeft} />
        </div>
        <div className={styles.date}>{dateText}</div>
        <div className={styles.button} onClick={handleNextBtn}>
          <FontAwesomeIcon icon={faAngleRight} />
        </div>
      </div>
      <FullCalendar
        firstDay={1}
        key={"dsader3wt45"}
        slotDuration={"00:15:00"}
        slotLabelInterval={{ hours: 1 }}
        allDaySlot={false}
        slotLabelFormat={{
          hour: "numeric",
          hour12: true,
        }}
        /* headerToolbar={{
          left: "custom-prev custom-next title",
          center: "",
          right: "",
        }} */
        eventColor={(e) => {
          console.log(e, "gdddd");
          return "#fff";
        }}
        headerToolbar={{ left: "", right: "", center: "" }}
        titleFormat={viewText}
        dayHeaderContent={renderHeader}
        ref={PlannerRef}
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView={viewMode}
        editable={true}
        selectable={true}
        selectMirror={true}
        dayMaxEvents={true}
        events={plans}
        eventContent={renderEventContent}
        dateClick={handleDateSelect}
        select={handleDateSelect}
        eventDrop={handleEventDateDrop}
        eventResize={handleEventResize}
        eventClick={handleEventClick}
        eventDisplay="block"
        eventAdd={(e) => {
          /*   */
        }}
        eventChange={(e) => {
          /*   */
        }}
        eventRemove={(e) => {
          /*   */
        }}
        /* customButtons={{
          "custom-prev": {
            icon: "chevron-left",
            click: handlePrevBtn,
          },
          "custom-next": {
            icon: "chevron-right",
            click: handleNextBtn,
          },
          "custom-today": {
            text: "Today",
            click: handleTodayButtonClick,
          },
        }} */
      />
    </StyleWrapper>
  );
}

export default EventPlanner;
