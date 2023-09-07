import React, { useState, useRef, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark } from '@fortawesome/free-solid-svg-icons';
import styles from './SmallCalendar.module.css';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction'; // Add this import
/* import '@fullcalendar/daygrid/main.css';
import '@fullcalendar/interaction/main.css'; */
import styled from "@emotion/styled";

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
    height: 500px;
  }
  .fc-theme-standard td, .fc-theme-standard th {
    border: none;
  }
  .fc .fc-daygrid-day-top {
    justify-content: center;
  }
  .fc-toolbar-title {
    font-size: 30px
  }
  .fc .fc-prev-button.fc-button-primary, .fc .fc-next-button.fc-button-primary {
    background-color: transparent;
    color: #000;
    border: none;
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
    overflow: hidden;
  }
  * {
    border: none !important;
  }
  .fc .fc-daygrid-day.fc-day-today {
    background-color: #fff;
  }
  .selected-date {
    background-color: #4169e1 !important;
    border-radius: 13px;
    color: #fff;
  }
  .SmallCalendar.today .fc-day-today {
    background-color: #4169e1 !important;
    border-radius: 13px;
    color: #fff;
  }
  .SmallCalendar.today .selected-date {
    background-color: #fff !important;
    border-radius: 13px;
    color: #545454;
  }
`;

function SmallCalendar(props) {
  const calendarRef = useRef(null);
  const currentDateRef = useRef(null);
  const [isToday, setIsToday] = useState(props.viewDate.getTime() == new Date().setHours(0, 0, 0, 0));

  useEffect(() => {
    calendarRef.current.getApi().gotoDate(props.viewDate);
    console.log('defa', calendarRef/* calendarRef.current.props.dateClick */)
  }, [props.viewDate])

  const handleDateClick = (arg) => {
    const currentDate = new Date(arg.date);
    console.log(currentDate);
    setIsToday(currentDate.getTime() == new Date().setHours(0, 0, 0, 0));
    console.log(isToday, currentDate.getTime(), new Date().setHours(0, 0, 0, 0))
    if (currentDateRef.current) {
      currentDateRef.current.classList.remove('selected-date');
    };

    currentDateRef.current = arg.dayEl;
    currentDateRef.current.classList.add('selected-date');
    props.setViewDate(new Date(currentDate.setHours(0, 0, 0, 0)));
  };

  const handleTodayButtonClick = () => {
    const currentDate = new Date();
    setIsToday(true);
    props.setViewDate(new Date(currentDate.setHours(0, 0, 0, 0)));
    calendarRef.current.getApi().gotoDate(currentDate);
    console.log(calendarRef)
  };

  const customHeader = {
    left: 'title',
    center: 'prev next',
    right: 'custom-today',
  };

  return (
    <StyleWrapper>
    <div className={`SmallCalendar ${isToday ? 'today' : ''}`}>
      <FullCalendar
        ref={calendarRef}
        plugins={[dayGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        customButtons={{
          'custom-prev': {
            text: 'Prev',
            click: () => {}
          },
          'custom-next': {
            text: 'Next',
            click: () => {console.log('d')}
          },
          'custom-today': {
            text: 'Today',
            click: handleTodayButtonClick,
          },
        }}
        headerToolbar={customHeader}
        dateClick={handleDateClick}
      />
    </div>
    </StyleWrapper>
  );
}

export default SmallCalendar;