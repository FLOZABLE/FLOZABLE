import React, { useState, useRef, useEffect } from "react";

// import "@fullcalendar/common";
import FullCalendar from "@fullcalendar/react";
import timeGridPlugin from "@fullcalendar/timegrid";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import styles from "./EventPlanner.module.css";
import events from "./Events";
import styled from "@emotion/styled";
import { generateRandomId } from "../../../utils/RandomId";
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
  color:#4169e1;
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

.fc-scroller::-webkit-scrollbar-track
{
	-webkit-box-shadow: inset 0 0 6px rgba(0,0,0,0.3);
	border-radius: 10px;

}

.fc-scroller::-webkit-scrollbar
{
	width: 12px;

}

.fc-scroller::-webkit-scrollbar-thumb
{
	border-radius: 10px;
	-webkit-box-shadow: inset 0 0 6px rgba(0,0,0,.3);
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
`;


function EventPlanner(props) {
  const { PlannerRef, SmallCalendarRef, PlannerApi, SmallCalendarApi, viewMode, viewDate } = props;
  const [events, setEvents] = useState(props.plans);
  const [isModal, setIsModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);

  //new event stats
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [subject, setSubject] = useState(false);
  const [subjects, setSubjects] = useState([]);
  const [start, setStart] = useState(new Date());
  const [end, setEnd] = useState(new Date());
  const [repeat, setRepeat] = useState(0);
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
    const date = DateTime.fromMillis(info.date.getTime());
    const weekDay = date.weekdayShort;
    const day = date.day;
    return (
      <div>
        <p className="weekDay">{weekDay}</p>
        <p className="day">{day}</p>
      </div>
    );
  };

  function handleDateSelect(selectInfo) {
    if (!selectedEvent) {
      const id = generateRandomId(10);
      setSelectedEvent(id);
      const start = new Date(selectInfo.start);
      const end = new Date(selectInfo.end);
      const newEvent = {
        id: id,
        title: '',
        start: start,
        end: end,
        description: '',
        subject: subject,
        notification: notification,
        saved: false
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
    if (!isModal) {
      setSelectedEvent(null);
    }
  }, [isModal]);

  useEffect(() => {
    if (PlannerApi) {
      PlannerApi.gotoDate(viewDate);
    }
  }, [viewDate]);

  useEffect(() => {
    props.setViewDate(new Date(new Date(start).setHours(0, 0, 0, 0)));
  }, [start]);

  useEffect(() => {
    setSubjects([...props.subjects.map((subject) => {
      return { name: subject.name, value: subject.id };
    }), { name: 'others', value: '0000000000' }]);
  }, [props.subjects]);

  //handle submit
  useEffect(() => {
    if (submit) {
      const eventIndex = events.findIndex((event) => event.id == selectedEvent);
      if (eventIndex !== -1) {
        const updatedEvents = [...events];
        updatedEvents[eventIndex] = { ...updatedEvents[eventIndex], title: title, start: start, end: end, description: description, subject: subject, saved: true };
        setEvents(updatedEvents);
      }
    };
  }, [submit]);

  useEffect(() => {
    if (selectedEvent) {
      const eventIndex = events.findIndex((event) => event.id == selectedEvent);
      if (eventIndex !== -1) {
        const updatedEvents = [...events];
        updatedEvents[eventIndex] = { ...updatedEvents[eventIndex], title: title, start: start, end: end, subject: subject };
        setEvents(updatedEvents)
      }
    };
  }, [title, start, end, subject]);

  useEffect(() => {
    if (!isModal) {
      const eventIndex = events.findIndex((event) => event.id == selectedEvent);
      if (eventIndex !== -1) {
        const updatedEvents = [...events];
        if (!updatedEvents[eventIndex].saved) {
          updatedEvents.splice(eventIndex, 1);
          setEvents(updatedEvents);
        };
      };
    };
  }, [isModal]);

  const handleTodayButtonClick = () => {
    const currentDate = new Date();
    PlannerApi.gotoDate(currentDate)
    props.setViewDate(new Date(currentDate.setHours(0, 0, 0, 0)));
  };

  const handlePrevBtn = () => {
    PlannerApi.prev();
    //SmallCalendarRef.current.getApi().prev();
  };

  const handleNextBtn = () => {
    PlannerApi.next();
    //SmallCalendarRef.current.getApi().next();
  }

  useEffect(() => {
    if (PlannerApi) {
      PlannerApi.changeView(viewMode, viewDate);
    }
  }, [viewMode])

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
          headerToolbar={
            {
              left: 'custom-today custom-prev custom-next title',
              center: '',
              right: ''
            }
          }
          titleFormat={{
            year: 'numeric',
            month: 'long',
          }}
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
          eventDrop={(e) => console.log(e)}

          eventAdd={(e) => {
            console.log("eventAdd", e);
          }}
          eventChange={(e) => {
            console.log("eventChange", e);
          }}
          eventRemove={(e) => {
            console.log("eventRemove", e);
          }}
          customButtons={{
            'custom-prev': {
              text: 'Prev',
              click: handlePrevBtn
            },
            'custom-next': {
              text: 'Next',
              click: handleNextBtn
            },
            'custom-today': {
              text: 'Today',
              click: handleTodayButtonClick,
            },
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
          repeat={repeat}
          setRepeat={setRepeat}
          priority={priority}
          setPriority={setPriority}
        />
      </StyleWrapper>
    </div>
  );
};

export default EventPlanner;