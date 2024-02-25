import React, { useRef } from "react";

import styles from "./StatsCalendar.module.css";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction"; // Add this import
/* import '@fullcalendar/daygrid/main.css';
import '@fullcalendar/interaction/main.css'; */
import styled from "@emotion/styled";

const StyleWrapper = styled.div`
  * {
    font-size:  0.625rem;
  }
  .fc td {
    background: #fff;
  }
  .fc-header-toolbar {
    height: 3.125rem;
  }
  .fc .fc-scroller-liquid-absolute {
    position: relative;
  }

  .fc.fc-media-screen.fc-direction-ltr.fc-theme-standard {
    position: relative;
    height: 31.25rem;
  }
`;

function StatsCalendar({ setViewDate, isCalendarOpen, onToggleCalendar }) {
  const calendarRef = useRef(null);

  const handleDateClick = (arg) => {
    const currentDate = new Date(arg.date);
    setViewDate(new Date(currentDate.setHours(0, 0, 0, 0)));

    if (isCalendarOpen) {
      onToggleCalendar();
    }
  };

  const handleTodayButtonClick = () => {
    const currentDate = new Date();
    setViewDate(new Date(currentDate.setHours(0, 0, 0, 0)));
    calendarRef.current.getApi().gotoDate(currentDate);
    if (isCalendarOpen) {
      onToggleCalendar();
    }
  };

  const customHeader = {
    left: "prev next",
    center: "title",
    right: "custom-today",
  };

  return (
    <div className={styles.StatsCalendarContainer}>
      <StyleWrapper>
        <FullCalendar
          ref={calendarRef}
          plugins={[dayGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          customButtons={{
            "custom-prev": {
              text: "Prev",
              click: () => {}, // Implement your logic here
            },
            "custom-next": {
              text: "Next",
              click: () => {}, // Implement your logic here
            },
            "custom-today": {
              text: "Today",
              click: handleTodayButtonClick,
            },
          }}
          headerToolbar={customHeader}
          dateClick={handleDateClick}
        />
      </StyleWrapper>
    </div>
  );
}

export default StatsCalendar;
