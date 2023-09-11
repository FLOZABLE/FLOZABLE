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
    height: 400px;
  }
  .fc-theme-standard td, .fc-theme-standard th {
    border: none;
  }
  .fc .fc-daygrid-day-top {
    justify-content: center;
  }
  .fc-toolbar-title {
    font-size: 20px
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
    /* overflow: hidden; */
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
    height: 42px !important;
    
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
  }
  .fc-daygrid-day-frame.fc-scrollgrid-sync-inner {
    min-height: 42.85px;
    height: 42.85px;
    display: flex;
    justify-content: center;
    align-items: center;
    position: relative;
  }
`;

function SmallCalendar(props) {
  const {PlannerRef, SmallCalendarRef, PlannerApi, SmallCalendarApi, viewDate, setViewDate, isModal, setIsModal} = props;
  const currentDateRef = useRef(null);
  const [isToday, setIsToday] = useState(props.viewDate.getTime() == new Date().setHours(0, 0, 0, 0));
  const [foreceUdt, setForceUdt] = useState([]);
  const [events, setEvents] = useState([]);


  useEffect(() => {
    /* if (calendarApi) {
      calendarApi.gotoDate(props.viewDate);
      const dateElement = document.querySelector(`.SmallCalendar .fc-day[data-date="${new Date(props.viewDate).toISOString().slice(0, 10)}"]`);
      console.log(dateElement);
      if (currentDateRef.current) {
        currentDateRef.current.classList.remove('selected-date');
      };
      currentDateRef.current = dateElement;
      currentDateRef.current.classList.add('selected-date');
      setForceUdt([]);
    } */
    console.log(viewDate)
    setEvents([{start: viewDate, end: viewDate, allDay: true, display: 'background', title: viewDate.getDate()}]);
    if (SmallCalendarApi) {
      SmallCalendarApi.gotoDate(viewDate);
    };
    console.log(isModal)
    if (PlannerApi && !isModal) {
      PlannerApi.gotoDate(viewDate);
    }
  }, [viewDate]);

  const handleDateClick = (arg) => {
    setViewDate(arg.date);
    /* const currentDate = new Date(arg.date);
    console.log(currentDate);
    setIsToday(currentDate.getTime() == new Date().setHours(0, 0, 0, 0));
    console.log(isToday, currentDate.getTime(), new Date().setHours(0, 0, 0, 0))
    if (currentDateRef.current) {
      currentDateRef.current.classList.remove('selected-date');
    };

    currentDateRef.current = arg.dayEl;
    currentDateRef.current.classList.add('selected-date');
    props.setViewDate(new Date(currentDate.setHours(0, 0, 0, 0))); */
  };

  const customHeader = {
    left: 'title',
    center: '',
    right: 'prev next',
  };

  const dayHeaderContentCallback = (args) => {
    return args.text.charAt(0);
  };

  return (
    <StyleWrapper>
    <div className="SmallCalendar">
      <FullCalendar
        ref={SmallCalendarRef}
        plugins={[dayGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        titleFormat={{month: 'long', year: 'numeric'}}
        dayHeaderContent={dayHeaderContentCallback}
        headerToolbar={customHeader}
        dateClick={handleDateClick}
        select={handleDateClick}
        events={events}
      />
    </div>
    </StyleWrapper>
  );
}

export default SmallCalendar;