import React, { useState, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark } from '@fortawesome/free-solid-svg-icons';
import styles from './StatsCalendar.module.css';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction'; // Add this import
/* import '@fullcalendar/daygrid/main.css';
import '@fullcalendar/interaction/main.css'; */
import styled from "@emotion/styled";

const StyleWrapper = styled.div`
  * {
    font-size: 10px;
  }
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
    height: 500px;
  }
`;

function StatsCalendar(props) {
  const calendarRef = useRef(null);
  const [events, setEvents] = useState([
    // Initial events data (you can fetch this from an API)
    { title: 'Event 1', date: '2023-08-15' },
    { title: 'Event 2', date: '2023-08-16' },
    // ...
  ]);
  const handleDateClick = (arg) => {
    const currentDate = new Date(arg.date);
    props.setViewDate(new Date(currentDate.setHours(0, 0, 0, 0)));

    if (props.isCalendarOpen) {
      props.onToggleCalendar();
    }
  };

  const handleTodayButtonClick = () => {
    const currentDate = new Date();
    props.setViewDate(new Date(currentDate.setHours(0, 0, 0, 0)));
    calendarRef.current.getApi().gotoDate(currentDate);
    if (props.isCalendarOpen) {
      props.onToggleCalendar();
    }
  };

  const customHeader = {
    left: 'prev next',
    center: 'title',
    right: 'custom-today',
  };

  return (
    <div className={styles.StatsCalendarContainer}>
      <StyleWrapper>
      <FullCalendar
        ref={calendarRef}
        plugins={[dayGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        customButtons={{
          'custom-prev': {
            text: 'Prev',
            click: () => {} // Implement your logic here
          },
          'custom-next': {
            text: 'Next',
            click: () => { } // Implement your logic here
          },
          'custom-today': {
            text: 'Today',
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