import React, { useState, useRef, useEffect } from "react";

// import "@fullcalendar/common";
import FullCalendar from "@fullcalendar/react";
import timeGridPlugin from "@fullcalendar/timegrid";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import styles from "./EventPlanner.module.css";
import events from "./Events";
import styled from "@emotion/styled";

import EventModal from "../EventModal/EventModal";
import { renderEventContent, handleEventClick, handleEventDrop, handleEventResize, handleDateSelect, handleDateClick, handleUpdate } from "./EventPlannerTool";
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
`;


function EventPlanner(props) {
  const [isModal, setIsModal] = useState(false);
  const calendarRef = useRef(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [submit, setSubmit] = useState(false);
  const [subjects, setSubjects] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [subject, setSubject] = useState('');
  const [notification, setNotification] = useState(0);
  const [startTime, setStartTime] = useState(new Date());
  const [stopTime, setStopTime] = useState(new Date());

  useEffect(() => {
    if (submit) {
      handleUpdate(selectedEvent);
    }
  }, [submit]);

  useEffect(() => {
    setSubjects(props.subjects.map((subject) => {
      return subject.name;
    }));
  }, [props.subjects]);

  useEffect(() => {
    if (selectedEvent) {
      setStartTime(new Date(selectedEvent.start));
      setStopTime(new Date(selectedEvent.end));
    }
  }, [selectedEvent]);

  return (
    <div className={styles.eventPlanner}>
      <StyleWrapper>
      <FullCalendar
      slotDuration={'00:15:00'}
      slotLabelInterval={{ hours: 1 }}
      allDaySlot={false}
      slotLabelFormat={
        {hour: '2-digit',
        minute: '2-digit',
        hour12: true}
      }
        ref={calendarRef}
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="timeGridWeek"
        editable={true}
        selectable={true}
        selectMirror={true}
        dayMaxEvents={true}
        select={(eventInfo) => {handleDateSelect(eventInfo, setIsModal, setSelectedEvent, props.setViewDate)}}
        eventContent={renderEventContent} // custom render function
        eventClick={(clickInfo) => {handleEventClick(clickInfo, setIsModal)}}
        eventDrop={handleEventDrop}
        eventResize={handleEventResize}
        //
        dateClick={handleDateClick}
        eventAdd={(e) => {
          console.log("eventAdd", e);
        }}
        eventChange={(e) => {
          console.log("eventChange", e);
        }}
        eventRemove={(e) => {
          console.log("eventRemove", e);
        }}
      />
      <EventModal
        isOpen={isModal}
        viewDate={props.viewDate}
        setViewDate={props.setViewDate}
        subjects={subjects}
        setStartTime={setStartTime}
        setStopTime={setStopTime}
        startTime={startTime}
        stopTime={stopTime}
        setSubmit={setSubmit}
        setTitle={setTitle}
        title={title}
        description={description}
        setDescription={setDescription}
        subject={description}
        setSubject={setSubject}
        notification={notification}
        setNotification={setNotification}
      />
      </StyleWrapper>
    </div>
  );
};

export default EventPlanner;