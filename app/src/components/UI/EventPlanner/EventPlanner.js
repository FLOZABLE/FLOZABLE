import React, { useState, useRef, useEffect } from "react";

// import "@fullcalendar/common";
import FullCalendar from "@fullcalendar/react";
import timeGridPlugin from "@fullcalendar/timegrid";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import styles from "./EventPlanner.module.css";
import events from "./Events";
import styled from "@emotion/styled";
import {generateRandomId} from "../../../utils/RandomId";
import { DateTime } from "luxon";

import EventModal from "../EventModal/EventModal";
//import { renderEventContent, handleDateSelect, handleDateClick } from "./EventPlannerTool";

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
`;


function EventPlanner(props) {
  const calendarRef = useRef(null);
  const [events, setEvents] = useState(props.plans);
  const [isModal, setIsModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  
  //new event stats
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [subjet, setSubject] = useState(false);
  const [subjects, setSubjects] = useState([]);
  const [start, setStart] = useState(new Date());
  const [end, setEnd] = useState(new Date());
  const [priority, setPriority] = useState(50);
  const [notification, setNotification] = useState(-1);
  const [submit, setSubmit] = useState(false);

  function renderEventContent(eventInfo) {
    return (
      <div>
        {/* <b>{eventInfo.timeText}</b> */}
        <i
          style={{
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis"
          }}
        >
          {eventInfo.event.title}
        </i>
      </div>
    );
  };

  function renderHeader(info) {
    console.log(info);
    const date = DateTime.fromMillis(info.date.getTime());
    const weekDay = date.weekdayShort;
    const day = date.day;
    return (
      <div>
        <p className="weekDay">{weekDay}</p>
        <p className="day">{day}</p>
      </div>
    )
  }
  
  function handleDateSelect(selectInfo) {
    if (!selectedEvent) {
      const id = generateRandomId(10);
      setSelectedEvent(id);
      const start = new Date(selectInfo.start);
      const end = new Date(selectInfo.end);
      const newEvent = {
        id: id,
        title: 'vf',
        start: start,
        end: end,
        description: '',
        subject: subjet,
        notification: notification
      };
      setStart(start);
      setEnd(end);
      setEvents([...events, newEvent]);
      setIsModal(true);
    } else {
      selectInfo.view.calendar.unselect();
    };
  };

  useEffect(() => {
    calendarRef.current.getApi().refetchEvents();
    console.log(events)
  }, [events]);

  useEffect(() => {
    if (!isModal) {
      setSelectedEvent(null);
    }
  }, [isModal]);
  
  useEffect(() => {
    console.log(props.subjects)
    setSubjects([...props.subjects.map((subject) => {
      return { name: subject.name, value: subject.id };
    }), {name: 'others', value: '0000000000'}]);
  }, [props.subjects]);

  //handle submit
  useEffect(() => {
    if (submit) {
      const eventIndex = events.findIndex((event) => event.id == selectedEvent);
      if (eventIndex !== 1) {
        const updatedEvents = [...events];
        updatedEvents[eventIndex] = { ...updatedEvents[eventIndex], title, start, end };
        /* updatedEvents[eventIndex].start = start;
        updatedEvents[eventIndex].end = end;
        updatedEvents[eventIndex].description = description;
        updatedEvents[eventIndex].subject = subjet;
        updatedEvents[eventIndex].notification = notification; */
        setEvents(updatedEvents)
        console.log(eventIndex)
      }
    };
  }, [submit]);
  return (
    <div className={`${styles.eventPlanner} eventPlanner`}>
      <StyleWrapper>
        <FullCalendar
        key={'dsader3wt45'}
          slotDuration={'00:15:00'}
          slotLabelInterval={{ hours: 1 }}
          allDaySlot={false}
          slotLabelFormat={
            {
              hour: 'numeric',
              hour12: true
            }
          }
          dayHeaderContent={renderHeader}
          ref={calendarRef}
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="timeGridWeek"
          editable={true}
          selectable={true}
          selectMirror={true}
          dayMaxEvents={true}
          events={events}
          eventContent={renderEventContent}
          dateClick={handleDateSelect}
          select={handleDateSelect}

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
          isModal={isModal}
          setIsModal={setIsModal}
          title={title}
          setTitle={setTitle}
          setStart={setStart}
          start={start}
          setEnd={setEnd}
          end={end}
          description={description}
          setDescription={setDescription}
          setSubject={setSubject}
          subjects={subjects}
          notification={notification}
          setNotification={setNotification}
          submit={submit}
          setSubmit={setSubmit}
        />
      </StyleWrapper>
    </div>
  );
};

export default EventPlanner;