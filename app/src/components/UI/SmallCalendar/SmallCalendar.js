import React, { useState, useEffect } from "react";

import styles from "./SmallCalendar.module.css";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction"; // Add this import
/* import '@fullcalendar/daygrid/main.css';
import '@fullcalendar/interaction/main.css'; */
import styled from "@emotion/styled";
import { DateTime } from "luxon";


const StyleWrapper = styled.div`
  .fc td {
    background: #fff;
  }
  .fc-header-toolbar {
    height: 50px;
  }
  .fc .fc-scroller-liquid-absolute {
    position: relative;
  }

  .fc.fc-media-screen.fc-direction-ltr.fc-theme-standard {
    position: relative;
  }
  .fc-theme-standard td,
  .fc-theme-standard th {
    border: none !important;
  }
  .fc .fc-daygrid-day-top {
    justify-content: center;
  }
  .fc-toolbar-title {
    font-size: 20px;
  }
  .fc .fc-prev-button.fc-button-primary,
  .fc .fc-next-button.fc-button-primary {
    background-color: transparent;
    color: #000;
    border: none !important;
    box-shadow: none !important;
  }
  .fc-custom-today-button {
    background-color: #4169e1;
    border-radius: 20px;
    height: 40px;
    padding: 0px 30px;
    font-size: 30px;
    display: flex;
    justify-content: center;
    line-height: 40px;
    font-weight: 800;
  }
  .fc-view-harness {
    border-radius: 30px;
    /* overflow: hidden; */
  }
  .fc-scroller.fc-scroller-liquid-absolute {
    overflow: unset !important;
  }
  * {
    border: none !important;
  }
  .fc .fc-daygrid-day.fc-day-today {
    background-color: #fff;
  }
  .fc-daygrid-day-events {
    position: absolute !important;
    top: 0px;
    width: 100%;
    border-radius: 50%;
    opacity: 0.75;
    z-index: 1;
  }
  .fc-daygrid-day-bg {
    z-index: 5;
  }
  .fc-bg-event {
    background-color: #4169e1;
    opacity: 1;
    border-radius: 30px;
    display: flex;
    justify-content: center;
    align-item: center;
  }
  .fc-bg-event .fc-event-title {
    font-style: unset;
    font-size: 1em;
    color: #fff;
    margin: 0px;
    position: absolute;
    top: 50%;
    transform: translatey(-50%);
  }
  .fc-daygrid-day-frame.fc-scrollgrid-sync-inner {
    display: flex;
    justify-content: center;
    align-items: center;
    position: relative;
  }

  .fc-header-toolbar.fc-toolbar.fc-toolbar-ltr{
    margin-bottom: 10px;
  }

  @media (max-width: 1400px) {
    .fc-header-toolbar.fc-toolbar.fc-toolbar-ltr {
      font-size: 15px
    }

    .fc-toolbar-chunk button {
      padding: 0px;
    }

    .fc-header-toolbar .fc-toolbar-chunk  {
      display: flex;
      font-size: 13px;
    }

    .fc-header-toolbar .fc-toolbar-title  {
      font-size: 15px;
    }

    .fc-col-header-cell-cushion {
      font-size: 12px;
    }

    .fc-daygrid-day-number {
      font-size: 12px;
    }

    .fc-daygrid-day-events {
      height: 30px !important;
    }

    .fc-toolbar-title {
      margin-left: 10px;
    }
  }
`;
function SmallCalendar({
  SmallCalendarRef,
  PlannerApi,
  SmallCalendarApi,
  viewDate,
  setViewDate,
  planModal,
  width,
  setIsCalendarOpen,
  subjects,
  showHeatmap = false,
}) {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    const allEvents = [{
      start: viewDate,
      end: viewDate,
      allDay: true,
      display: "background",
      title: viewDate.getDate(),
    }];

    if (showHeatmap && subjects && subjects.length) {
      subjects.daily.groupedTotal.toReversed().map((day, i) => {
        const currentDay = DateTime.now().minus({ days: i });
        const stringDay = currentDay.toFormat("yyyy-MM-dd");
        if (currentDay.startOf('day').equals(DateTime.fromJSDate(viewDate).startOf('day'))) return;
        allEvents.push({ title: '', date: stringDay, color: `hsla(212, 100%, ${100 - Math.min(25 * Math.sqrt(day / 3600), 60)}%, 1)` });
        // 0 hours white to 5 dark blue https://www.desmos.com/calculator/sezqjfdbfl
      })
    }

    setEvents(allEvents);

    if (SmallCalendarApi) {
      SmallCalendarApi.gotoDate(viewDate);
    }
    if (PlannerApi && !planModal) {
      PlannerApi.gotoDate(viewDate);
    }
  }, [viewDate, subjects]);

  const handleDateClick = (arg) => {
    setViewDate(arg.date);
    if (setIsCalendarOpen) {
      setIsCalendarOpen(false);
    }
  };

  const customHeader = {
    left: "title",
    center: "",
    right: "prev next",
  };

  const dayHeaderContentCallback = (args) => {
    return args.text.charAt(0);
  };

  return (
    <StyleWrapper style={{ width: width }}>
      <div className={styles.SmallCalendar} style={{ width: width }}>
        <FullCalendar
          ref={SmallCalendarRef}
          plugins={[dayGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          titleFormat={{ month: "long", year: "numeric" }}
          dayHeaderContent={dayHeaderContentCallback}
          headerToolbar={customHeader}
          dateClick={handleDateClick}
          select={handleDateClick}
          events={events}
          height={'18.75rem'}
        />
      </div>
    </StyleWrapper>
  );
}

export default SmallCalendar;
