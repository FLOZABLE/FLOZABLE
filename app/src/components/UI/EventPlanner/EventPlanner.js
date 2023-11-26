import React, { useState, useEffect } from "react";
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
    font-size: 20px;
    font-weight: 300;
  }

  th.fc-col-header-cell p.day {
    font-size: 30px;
    height: 43px;
  }

  th.fc-col-header-cell.fc-day-today .day {
    width: 43px;
    background-color: #4169e1;
    color: #fff;
    border-radius: 30px;
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
    border: transparent 1px solid;
    border-right: 1px solid #c5c5c6;
  }

  .fc-theme-standard table tr:nth-of-type(4n) td {
    border-bottom: 1px solid #c5c5c6;
  }

  thead .fc-scroller {
    overflow: hidden !important;
    padding-right: 12px;
    margin-bottom: 20px;
  }

  .fc-scroller::-webkit-scrollbar-track {
    -webkit-box-shadow: inset 0 0 6px rgba(0, 0, 0, 0.3);
    border-radius: 10px;
  }

  .fc-scroller::-webkit-scrollbar {
    width: 12px;
  }

  .fc-scroller::-webkit-scrollbar-thumb {
    border-radius: 10px;
    -webkit-box-shadow: inset 0 0 6px rgba(0, 0, 0, 0.3);
    background-color: #555555;
  }

  .fc-timegrid-slot-label-frame {
    position: relative;
  }

  .fc-timegrid-slot-label-cushion {
    position: absolute;
    top: -25px;
    left: 0px;
    background-color: #f7f9fd;
  }

  .fc-timegrid-slots {
    margin-top: 10px;
  }

  .fc-daygrid-day-top {
    justify-content: center;
  }

  .fc .fc-custom-today-button {
    background-color: #4169e1;
    padding: 10px 30px;
    font-size: 20px;
    border-radius: 30px;
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
  .fc-view-harnessfc-view-harness-active {
    height: 100vh;
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
    isAddPlanModal,
    setIsAddPlanModal,
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

  function renderEventContent(eventInfo) {
    return (
      <div>
        {/* <b>{eventInfo.timeText}</b> */}
        <i
          style={{
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {eventInfo.event.title}
        </i>
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
    if (isAddPlanModal && isAddPlanModal.id) {
      selectInfo.view.calendar.unselect();
    } else {
      const id = generateRandomId(10);
      const start = selectInfo.start ? new Date(selectInfo.start) : null;
      const end = selectInfo.end ? new Date(selectInfo.end) : null;
      const subject = subjects[0] ? subjects[0].id : "";
      if (start && end) {
        const newEvent = {
          title: "",
          start,
          end,
          description: "",
          repeat: false,
          subject,
          notification: -1,
          priority: 50,
          saved: false,
          completed: 0,
        };
        setIsAddPlanModal(newEvent);
      }
    }
  }

  function handleEventDateDrop(data) {
    const { id, start, end } = data.event;
    const eventIndex = events.findIndex((event) => event.id == id);
    if (eventIndex !== -1) {
      const updatedEvents = [...events];
      updatedEvents[eventIndex] = { ...updatedEvents[eventIndex], start, end };
      setEvents(updatedEvents);
      updateServer({ ...updatedEvents[eventIndex] });
    }
  }

  function handleEventResize(data) {
    const { id, start, end } = data.event;
    const eventIndex = events.findIndex((event) => event.id == id);
    if (eventIndex !== -1) {
      const updatedEvents = [...events];
      updatedEvents[eventIndex] = { ...updatedEvents[eventIndex], start, end };
      setEvents(updatedEvents);
      updateServer({ ...updatedEvents[eventIndex] });
    }
  }

  function updateServer(event) {
    const { start, end, completed } = event;
    const startSec = Math.floor(start.getTime() / (1000 * 60));
    const endSec = Math.floor(end.getTime() / (1000 * 60));
    const updateInfo = {
      ...event,
      start: startSec,
      end: endSec,
      completed: completed ? 1 : 0,
    };
    delete updateInfo.saved;
    fetch(`${serverOrigin}/api/plan/update-plan`, {
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
          setIsAddPlanModal(false);
        }
      })
      .catch((error) => console.error(error));
  }

  function handleEventClick(data) {
    const { id, start, end, title } = data.event;
    const eventInfo = {
      ...data.event._def.extendedProps,
      id,
      start,
      end,
      title,
    };
    setIsAddPlanModal(eventInfo);
  };

  useEffect(() => {
    if (PlannerApi) {
      /* const plannerDateTime = DateTime.fromJSDate(PlannerApi.getDate());
      const viewDateTime = DateTime.fromJSDate(viewDate);
      console.log(PlannerApi.getDate(), viewDate)
      if (viewMode == 'timeGridDay') {
        if (plannerDateTime.toISODate() !== viewDateTime.toISODate()) {
          //PlannerApi.gotoDate(viewDate);
        }
      } else if (viewMode == 'timeGridWeek') {
        if (!(viewDateTime.startOf('week').toSeconds() <= plannerDateTime.startOf('week').toSeconds() &&  plannerDateTime.endOf('week').toSeconds() <= viewDateTime.endOf('week').toSeconds())) {
          //PlannerApi.gotoDate(viewDate);
        }
      } else {
        if (plannerDateTime.startOf('month').toSeconds() <= viewDateTime.startOf('month').toSeconds() ||  viewDateTime.endOf('month').toSeconds() <= plannerDateTime.endOf('month').toSeconds()) {
          //PlannerApi.gotoDate(viewDate);
        }
      } */
    }
  }, [viewDate]);

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
    <div className={`${styles.eventPlanner} eventPlanner`}>
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