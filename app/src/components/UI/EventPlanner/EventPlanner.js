import React, { useState, useEffect } from "react";
import { useSearchParams } from 'react-router-dom';
import FullCalendar from "@fullcalendar/react";
import timeGridPlugin from "@fullcalendar/timegrid";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import styles from "./EventPlanner.module.css";
import styled from "@emotion/styled";
import generateRandomId from "../../../utils/RandomId";
import { DateTime } from "luxon";
const serverOrigin = process.env.REACT_APP_ORIGIN;

const StyleWrapper = styled.div`
  .fc-col-header {
    width: 100% !important;
  }
  .fc-daygrid-body {
    width: 100% !important;
  }
  .fc-scrollgrid-sync-table {
    width: 100% !important;
  }
  .fc-timegrid-body {
    width: 100% !important;
  }
  .fc-timegrid-slots > table {
    width: 100% !important;
  }
  .fc-timegrid-cols > table {
    width: 100% !important;
  }
  .fc-timegrid-cols > table .fc-day-today {
    background-color: transparent;
  }

  th.fc-col-header-cell p.weekDay {
    font-size: 1.25rem;
    font-weight: 300;
  }

  .fc-event {
    transition: .3s ease-in-out all;
    display: block;
  }
  .fc-event.completed i {
    position: relative;
  }
  .fc-event.completed i::before {
    content: "";
    background: #000;
    width: 100%;
    height: 0.1875rem;
    display: inline-block;
    position: absolute;
    top: 0.5rem;
  }

  th.fc-col-header-cell p.day {
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 1.875rem;
    width: 2.6875rem;
    height: 2.6875rem;
  }

  th.fc-col-header-cell.fc-day-today .day {
    width: 2.6875rem;
    background-color: #4169e1;
    color: #fff;
    border-radius: 1.875rem;
  }

  th.fc-col-header-cell.fc-day-today .weekDay {
    color: #4169e1;
  }

  th {
    border: none !important;
  }

  table.fc-scrollgrid {
    border: none !important;
  }

  .fc-theme-standard table tr td {
    border: transparent 0.0625rem solid;
    border-right: 0.0625rem solid #c5c5c6;
  }

  .fc-theme-standard table tr:nth-of-type(4n) td {
    border-bottom: 0.0625rem solid #c5c5c6;
  }

  thead .fc-scroller {
    overflow: hidden !important;
    padding-right: 0.75rem;
    margin-bottom: 1.25rem;
  }

  .fc-scroller::-webkit-scrollbar-track {
    -webkit-box-shadow: inset 0 0 0.375rem rgba(0, 0, 0, 0.3);
    border-radius: 0.625rem;
  }

  .fc-scroller::-webkit-scrollbar {
    width: 0.75rem;
  }

  .fc-scroller::-webkit-scrollbar-thumb {
    border-radius: 0.625rem;
    -webkit-box-shadow: inset 0 0 0.375rem rgba(0, 0, 0, 0.3);
    background-color: #555555;
  }

  .fc-timegrid-slot-label-frame {
    position: relative;
  }

  .fc-timegrid-slot-label-cushion {
    position: absolute;
    top: -1.5625rem;
    left: 0em;
    background-color: #f7f9fd;
  }

  .fc-timegrid-slots {
    margin-top: 0.625rem;
  }

  .fc-daygrid-day-top {
    justify-content: center;
  }

  .fc .fc-custom-today-button {
    background-color: #4169e1;
    padding: 0.625rem 1.875rem;
    font-size:  1.25rem;
    border-radius: 1.875rem;
    border: none;
    transition: 0.3s background-color ease-in-out;
  }

  .fc-custom-prev-button {
    background-color: #4169e1;
    border: none;
    transition: 0.3s background-color ease-in-out;
  }

  .fc-custom-next-button {
    background-color: #4169e1;
    border: none;
    transition: 0.3s background-color ease-in-out;
  }

  .fc .fc-custom-today-button:hover {
    background-color: #3788d8;
  }

  .fc-custom-prev-button:hover {
    background-color: #3788d8 !important;
  }

  .fc-custom-next-button:hover {
    background-color: #3788d8 !important;
  }

  .fc-toolbar-chunk {
    display: flex;
  }
  .fc-view-harness.fc-view-harness-active {
    height: 100vh !important;
  }

  @media (max-width: 87.5rem) {
    th.fc-col-header-cell p.day {
    font-size:  1.25rem;
    height: 2.125rem;
    width: 2.125rem !important;
    }

    th.fc-col-header-cell p.weekDay {
      font-size: 1.063rem;
      font-weight: 300;
    }

    .fc .fc-custom-today-button {
      padding: 0.313rem 0.625rem;
      font-size:1.063rem;
      height: fit-content;
    }

    .fc-custom-prev-button {
      height: fit-content;
    }
  
    .fc-custom-next-button {
      height: fit-content;
    }

    .fc-toolbar-title {
      font-size:  1.25rem;
    }

    div.fc-view.fc-timegrid {
      height: 100vh;
    }
  }
`;

function EventPlanner(props) {
  const {
    PlannerRef,
    setResponse,
    SmallCalendarRef,
    PlannerApi,
    SmallCalendarApi,
    viewMode,
    viewDate,
    addPlanResponse,
    setAddPlanResponse,
    events,
    setEvents,
    planModal,
    setPlanModal,
    setIsAddSubjectModal,
    subjects,
    setSubjects,
    setSubject,
    subject,
    setViewDate,
  } = props;
  const [viewText, setViewText] = useState({
    year: "numeric",
    month: "long",
  });
  const [searchParams, setSearchParams] = useSearchParams();
  const [lastClick, setLastClick] = useState(new Date().getTime());

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
    const now  = new Date().getTime();

    if ( now - lastClick < 1000) {
      PlannerRef.current.getApi().unselect();
      return;
    };

    setLastClick(now);

    const start = selectInfo.start ? new Date(selectInfo.start) : new Date();
    const end = selectInfo.end ? new Date(selectInfo.end) : new Date();

    if (!start || !end) return;

    if (!planModal.id) {
      const planInfo = { ...planModal, start, end };

      setPlanModal((prev) => ({ ...prev, ...planInfo, opened: true }));
    } else {
      setEvents((prev) => {
        const foundIndex = prev.findIndex((val) => val.id === planModal.id);
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
    };
  };

  function handleEventDateDrop(data) {
    const { id, start } = data.event;
    if (data.event._def.extendedProps.access === "reader") {
      setResponse({ success: false, reason: "This event is view only" })
      return;
    }
    const end = data.event.end ? data.event.end : start;
    const eventIndex = events.findIndex((event) => event.id == id);
    if (eventIndex !== -1) {
      const updatedEvents = [...events];
      updatedEvents[eventIndex] = { ...updatedEvents[eventIndex], start, end };
      setEvents(updatedEvents);
      if (updatedEvents[eventIndex].saved) {
        updateServer({ ...updatedEvents[eventIndex] });
        setPlanModal((prev) => ({ ...prev, start, end }));
      } else {
        setPlanModal((prev) => ({ ...prev, start, end, opened: true }));
      }
    }
  }

  function handleEventResize(data) {
    const { id, start } = data.event;
    if (data.event._def.extendedProps.access === "reader") {
      setResponse({ success: false, reason: "This event is view only" })
      return;
    }
    const end = data.event.end ? data.event.end : start;
    const eventIndex = events.findIndex((event) => event.id == id);
    if (eventIndex !== -1) {
      const updatedEvents = [...events];
      updatedEvents[eventIndex] = { ...updatedEvents[eventIndex], start, end };
      setEvents(updatedEvents);
      if (updatedEvents[eventIndex].saved) {
        updateServer({ ...updatedEvents[eventIndex] });
        setPlanModal((prev) => ({ ...prev, start, end }));
      } else {
        setPlanModal((prev) => ({ ...prev, start, end, opened: true }));
      }
    }
  }

  function updateServer(event) {
    const { start, end, completed, editable } = event;
    if (!editable) {
      setResponse({ success: false, reason: "This event is view only" })
      return;
    }
    const startSec = Math.floor(start.getTime() / (1000 * 60));
    const endSec = Math.floor(end.getTime() / (1000 * 60));
    const notification = parseInt(planModal.notification);
    const repeat = parseInt(planModal.repeat);
    const updateInfo = {
      ...event,
      start: startSec,
      end: endSec,
      completed: completed ? 1 : 0,
      notification,
      repeat
    };
    delete updateInfo.saved;
    fetch(`${serverOrigin}/plan/update`, {
      method: "post",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updateInfo),
    })
      .then((response) => response.json())
      .then((data) => {
        setResponse(data);
        if (data.success) {
          //setPlanModal(false);
        }
      })
      .catch((error) => console.error(error));
  }

  function handleEventClick(data) {
    const { id, start, end, title } = data.event;
    const editable = data.event._def.extendedProps.isEditable;
    const eventInfo = {
      ...data.event._def.extendedProps,
      id,
      start,
      end: end ? end : start,
      title,
      editable
    };
    setPlanModal(prev => ({ ...prev, ...eventInfo, opened: true }));
  };

  useEffect(() => {
    if (PlannerApi) {
      const plannerDateTime = DateTime.fromJSDate(PlannerApi.getDate());
      const viewDateTime = DateTime.fromJSDate(viewDate);
      if (viewMode == 'timeGridDay') {
        if (plannerDateTime.toISODate() !== viewDateTime.toISODate()) {
          PlannerApi.gotoDate(viewDate);
        }
      } else if (viewMode == 'timeGridWeek') {
        if (!(viewDateTime.plus({ days: 1 }).startOf("week").minus({ days: 1 }).toSeconds() <= plannerDateTime.plus({ days: 1 }).startOf("week").minus({ days: 1 }).toSeconds()
          && plannerDateTime.plus({ days: 1 }).endOf("week").minus({ days: 1 }).toSeconds() <= viewDateTime.plus({ days: 1 }).endOf("week").minus({ days: 1 }).toSeconds())) {
          PlannerApi.gotoDate(viewDate);
        }
      } else {
        if (plannerDateTime.startOf('month').toSeconds() <= viewDateTime.startOf('month').toSeconds() || viewDateTime.endOf('month').toSeconds() <= plannerDateTime.endOf('month').toSeconds()) {
          PlannerApi.gotoDate(viewDate);
        }
      }
    }
  }, [viewDate]);

  useEffect(() => {
    if (!events.length) return;
    if (!!searchParams.get("plan")) {
      const searchingPlanId = searchParams.get("plan");
      let chosenEvent = events.filter((calendarEvent) => calendarEvent.id === searchingPlanId);
      if (chosenEvent.length) {
        setPlanModal({ ...chosenEvent[0], opened: true });
      }
      setSearchParams({});
    }

  }, [searchParams, events]);

  const handleTodayButtonClick = () => {
    const currentDate = new Date();
    PlannerApi.gotoDate(currentDate);
    setViewDate(new Date(currentDate.setHours(0, 0, 0, 0)));
  };

  const handlePrevBtn = () => {
    PlannerApi.prev();
    if (viewMode == "dayGridMonth") {
      const monthStart = new Date(
        viewDate.getFullYear(),
        viewDate.getMonth() - 1,
        1,
      );
      PlannerApi.gotoDate(monthStart);
      setViewDate(monthStart);
    } else {
      setViewDate(PlannerApi.view.activeStart);
    }
  };

  const handleNextBtn = () => {
    PlannerApi.next();
    if (viewMode == "dayGridMonth") {
      const monthStart = new Date(
        viewDate.getFullYear(),
        viewDate.getMonth() + 1,
        1,
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
    <div className={`${styles.EventPlanner}`}>
      <StyleWrapper>
        <FullCalendar
          key={"dsader3wt45"}
          slotDuration={"00:15:00"}
          slotLabelInterval={{ hours: 1 }}
          allDaySlot={false}
          slotLabelFormat={{
            hour: "numeric",
            hour12: true,
          }}
          headerToolbar={{
            left: "custom-today custom-prev custom-next title",
            center: "",
            right: "",
          }}
          titleFormat={viewText}
          dayHeaderContent={renderHeader}
          ref={PlannerRef}
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView={viewMode}
          editable={true}
          selectable={true}
          selectMirror={true}
          dayMaxEvents={true}
          events={events}
          eventContent={renderEventContent}
          dateClick={handleDateSelect}
          select={handleDateSelect}
          eventDrop={handleEventDateDrop}
          eventResize={handleEventResize}
          eventClick={handleEventClick}
          eventAdd={(e) => {
            /*   */
          }}
          eventChange={(e) => {
            /*   */
          }}
          eventRemove={(e) => {
            /*   */
          }}
          customButtons={{
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
          }}
        />
      </StyleWrapper>
    </div>
  );
}

export default EventPlanner;