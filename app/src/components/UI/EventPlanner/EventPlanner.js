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

.fc-daygrid-day-top {
  justify-content: center;
}

.fc .fc-custom-today-button {
  background-color: #4169e1;
  padding: 10px 30px;
  font-size: 20px;
  border-radius: 30px;
  border: none;
  transition: .3s background-color ease-in-out;
}

.fc-custom-prev-button {
  background-color: #4169e1;
  border: none;
  transition: .3s background-color ease-in-out;
}

.fc-custom-next-button {
  background-color: #4169e1;
  border: none;
  transition: .3s background-color ease-in-out;
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
`;


function EventPlanner(props) {
  const { PlannerRef, SmallCalendarRef, PlannerApi, SmallCalendarApi, viewMode, viewDate, addPlanResponse, setAddPlanResponse, events, setEvents, isAddPlanModal, setIsAddPlanModal, setIsAddSubjectModal } = props;
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [viewText, setViewText] = useState({
    year: 'numeric',
    month: 'long',
  })

  //new event stats
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [subject, setSubject] = useState('0000000000');
  const [subjects, setSubjects] = useState([]);
  const [start, setStart] = useState(new Date());
  const [end, setEnd] = useState(new Date());
  const [repeat, setRepeat] = useState(0);
  const [priority, setPriority] = useState(50);
  const [notification, setNotification] = useState(-1);
  const [submit, setSubmit] = useState(false);

  /* const [prevStart, setPrevStart] = useState(null); */


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
        {viewMode !== 'dayGridMonth' ? <p className="day">{day}</p> : ''}
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
        repeat: repeat,
        subject: subject,
        notification: notification,
        priority: priority,
        saved: false
      };
      setStart(start);
      setEnd(end);
      setEvents([...events, newEvent]);
      setIsAddPlanModal(true);
    } else {
      selectInfo.view.calendar.unselect();
    };
  };

  function handleEventDateDrop(dropInfo) {
    const eventInfo = dropInfo.event._def.extendedProps;
    const event = dropInfo.event;
    if (selectedEvent !== event.id && eventInfo.saved) {
      updatePlan(event.id, event.title, event.start, event.end, eventInfo.description, eventInfo.subject, eventInfo.priority);
    } else {
      setStart(event.start);
      setEnd(event.end);
    }
  };

  function handleEventResize(resizeInfo) {
    const eventInfo = resizeInfo.event._def.extendedProps;
    const event = resizeInfo.event;
    if (selectedEvent !== event.id && eventInfo.saved) {
      updatePlan(event.id, event.title, event.start, event.end, eventInfo.description, eventInfo.subject, eventInfo.priority);
    } else {
      setEnd(event.end);
    };
  };

  function handleEventClick(event) {
    const eventInfo = event.event._def.extendedProps;
    if (selectedEvent && !selectedEvent.saved) {
      const eventIndex = events.findIndex((event) => event.id == selectedEvent);
      if (eventIndex !== -1) {
        const updatedEvents = [...events];
        if (!updatedEvents[eventIndex].saved) {
          updatedEvents.splice(eventIndex, 1);
          setEvents(updatedEvents);
        };
      };
    };
    if (eventInfo.saved) {
      setIsAddPlanModal(true);
      setSelectedEvent(event.event.id);
      setStart(event.event.start);
      setEnd(event.event.end);
      setTitle(event.event.title);
      setDescription(eventInfo.description);
      setRepeat(eventInfo.description);
      setPriority(eventInfo.priority);
      setNotification(eventInfo.notification);
    }
  }

  useEffect(() => {
    if (!isAddPlanModal) {
      setSelectedEvent(null);
      setTitle('');
      setDescription('');
      setPriority(50);
    }
  }, [isAddPlanModal]);

  function areDatesInSameWeek(date1, date2) {
    const dayOfWeek1 = date1.getDay();
    const dayOfWeek2 = date2.getDay();

    const startOfWeek1 = new Date(date1);
    startOfWeek1.setDate(date1.getDate() - dayOfWeek1);
    startOfWeek1.setHours(0, 0, 0, 0);

    const startOfWeek2 = new Date(date2);
    startOfWeek2.setDate(date2.getDate() - dayOfWeek2);
    startOfWeek2.setHours(0, 0, 0, 0);

    return startOfWeek1.getTime() === startOfWeek2.getTime();
  }

  useEffect(() => {
    if (PlannerApi) {
      if (viewMode == 'timeGridDay') {
        if (new Date(start.setHours(0, 0, 0, 0)).getTime() !== viewDate.getTime()) {
          PlannerApi.gotoDate(viewDate);
        }
      } else if (viewMode == 'timeGridWeek') {
        if (!areDatesInSameWeek(new Date(start), new Date(viewDate))) {
          PlannerApi.gotoDate(viewDate);
        }
      } else {
        if (!(start.getFullYear() !== viewDate.getFullYear() && start.getMonth() !== viewDate.getMonth())) {
          PlannerApi.gotoDate(viewDate);
        }
      }
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
    console.log(submit)
    if (submit) {
      updatePlan(selectedEvent, title, start, end, description, subject, priority);
    };
  }, [submit]);

  function updatePlan(selectedEvent, title, start, end, description, subject, priority) {
    const eventIndex = events.findIndex((event) => event.id == selectedEvent);
    if (eventIndex !== -1) {
      const updatedEvents = [...events];
      updatedEvents[eventIndex] = { ...updatedEvents[eventIndex], title: title, start: start, end: end, description: description, subject: subject, saved: true, priority: priority };
      const planInfo = {
        ...updatedEvents[eventIndex],
        start: Math.floor(start.getTime() / (1000 * 60)),
        end: Math.floor(end.getTime() / (1000 * 60)),
      }
  
      delete planInfo.saved;
      fetch(`${serverOrigin}/api/plan/update-plan`,
        {
          method: 'post',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(planInfo)
        })
        .then((response) => response.json())
        .then((data) => {
          setAddPlanResponse(data);
          if (data.success) {
            setEvents(updatedEvents);
            setIsAddPlanModal(false);
          };
        })
        .catch((error) => console.error(error));
    };
  };

  useEffect(() => {
    if (selectedEvent) {
      const eventIndex = events.findIndex((event) => event.id == selectedEvent);
      if (eventIndex !== -1) {
        const updatedEvents = [...events];
        updatedEvents[eventIndex] = { ...updatedEvents[eventIndex], title: title, start: start, end: end, subject: subject, priority: priority };
        if (start.getTime() > end.getTime()) {
        } else {
          setEvents(updatedEvents)
        }
      }
    };
  }, [title, start, end, subject]);

  useEffect(() => {
    if (!isAddPlanModal) {
      const eventIndex = events.findIndex((event) => event.id == selectedEvent);
      if (eventIndex !== -1) {
        const updatedEvents = [...events];
        if (!updatedEvents[eventIndex].saved) {
          updatedEvents.splice(eventIndex, 1);
          setEvents(updatedEvents);
        };
      };
    };
  }, [isAddPlanModal]);

  const handleTodayButtonClick = () => {
    const currentDate = new Date();
    PlannerApi.gotoDate(currentDate)
    props.setViewDate(new Date(currentDate.setHours(0, 0, 0, 0)));
  };

  const handlePrevBtn = () => {
    PlannerApi.prev();
    if (viewMode == 'dayGridMonth') {
      const monthStart = new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1);
      PlannerApi.gotoDate(monthStart);
      props.setViewDate(monthStart);
    } else {
      props.setViewDate(PlannerApi.view.activeStart);
    };
  };

  const handleNextBtn = () => {
    PlannerApi.next();
    if (viewMode == 'dayGridMonth') {
      const monthStart = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1);
      PlannerApi.gotoDate(monthStart);
      props.setViewDate(monthStart);
    } else {
      props.setViewDate(PlannerApi.view.activeStart);
    }
  }

  useEffect(() => {
    console.log('view changed')
    if (PlannerApi) {
      PlannerApi.changeView(viewMode, viewDate);
    };
    if (viewMode == 'timeGridDay') {
      setViewText({
        year: 'numeric',
        month: 'long',
      });
    } else if (viewMode == 'timeGridWeek') {
      setViewText({
        year: 'numeric',
        month: 'long',
      });
    } else {
      setViewText({
        year: 'numeric',
        month: 'long',
      });
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
              icon: 'chevron-left',
              click: handlePrevBtn
            },
            'custom-next': {
              icon: 'chevron-right',
              click: handleNextBtn
            },
            'custom-today': {
              text: 'Today',
              click: handleTodayButtonClick,
            },
          }}
        />
        <EventModal
          isAddPlanModal={isAddPlanModal}
          setIsAddPlanModal={setIsAddPlanModal}
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
          setIsAddSubjectModal={setIsAddSubjectModal}
        />
      </StyleWrapper>
    </div>
  );
};

export default EventPlanner;