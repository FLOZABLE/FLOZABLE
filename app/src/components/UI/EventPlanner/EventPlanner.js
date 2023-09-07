import React, { useState, useRef } from "react";

// import "@fullcalendar/common";
import FullCalendar from "@fullcalendar/react";
import timeGridPlugin from "@fullcalendar/timegrid";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import styles from "./EventPlanner.module.css";
import events from "./Events";

import EventModal from "../EventModal/EventModal";

export default function EventPlanner(props) {
  const [weekendsVisible, setWeekendsVisible] = useState(true);
  const [currentEvents, setCurrentEvents] = useState([]);
  const [modal, setModal] = useState(false);
  const [confirmModal, setConfirmModal] = useState(false);
  const calendarRef = useRef(null);
  const [savePlan, setSavePlan] = useState(false);

  const [title, setTitle] = useState("");
  const [start, setStart] = useState(new Date());
  const [end, setEnd] = useState(new Date());

  const handleCloseModal = () => {
    handleClose();
    setModal(false);
  };

  // function handleWeekendsToggle() {
  //   setWeekendsVisible(!weekendsVisible);
  // }
  function handleDateClick(arg) {
    // bind with an arrow function
    // console.log(arg.dateStr);
  }
  function handleDateSelect(selectInfo) {
    // console.log(selectInfo.view.type);
    if (
      selectInfo.view.type === "timeGridWeek" ||
      selectInfo.view.type === "timeGridDay"
    ) {
      selectInfo.view.calendar.unselect();
      setState({ selectInfo, state: "create" });
      // Open modal create
      console.log("open modal create");
      console.log(selectInfo);
      setStart(selectInfo.start);
      setEnd(selectInfo.end);
      setModal(true);
    }

    // let calendarApi = selectInfo.view.calendar;

    // let title = prompt("Please enter a new title for your event");

    // if (title) {
    //   calendarApi.addEvent({
    //     id: nanoid(),
    //     title,
    //     start: selectInfo.startStr,
    //     end: selectInfo.endStr,
    //     allDay: selectInfo.allDay
    //   });
    // }
  }
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
  }
  function handleEventClick(clickInfo) {
    // console.log("open modal update, delete");
    setState({ clickInfo, state: "update" });
    // set detail
    setTitle(clickInfo.event.title);
    setStart(clickInfo.event.start);
    setEnd(clickInfo.event.end);

    setModal(true);
    // if (
    //   confirm(
    //     `Are you sure you want to delete the event '${clickInfo.event.title}'`
    //   )
    // ) {
    //   clickInfo.event.remove();
    // }
  }
  function handleEvents(events) {
    setCurrentEvents(events);
  }
  function handleEventDrop(checkInfo) {
    // console.log(checkInfo.event.start.toISOString());
    // checkInfo.revert();
    setState({ checkInfo, state: "drop" });
    setConfirmModal(true);
  }
  function handleEventResize(checkInfo) {
    // console.log(checkInfo);
    setState({ checkInfo, state: "resize" });
    setConfirmModal(true);
  }
  function handleEdit() {
    // console.log(start, end);
    // state.clickInfo.event.setAllDay(true);

    state.clickInfo.event.setStart(start);
    state.clickInfo.event.setEnd(end);
    state.clickInfo.event.mutate({
      standardProps: { title }
    });
    handleClose();
  }
  function handleSubmit(newEvent) {
    // console.log(state.selectInfo.view.calendar);
    /* const newEvent = {
      id: nanoid(),
      title,
      start: state.selectInfo?.startStr || start.toISOString(),
      end: state.selectInfo?.endStr || end.toISOString(),
      allDay: state.selectInfo?.allDay || false
    }; */
    // console.log(newEvent);

    let calendarApi = calendarRef.current.getApi();
    // let calendarApi = selectInfo.view.calendar

    calendarApi.addEvent(newEvent);
    handleClose();
  }
  function handleDelete() {
    // console.log(JSON.stringify(state.clickInfo.event));
    // console.log(state.clickInfo.event.id);
    state.clickInfo.event.remove();
    handleClose();
  }
  function handleClose() {
    setTitle("");
    setStart(new Date());
    setEnd(new Date());
    setState({});
    setModal(false);
  }
  const [state, setState] = useState({});

  const [departments, setDepartments] = useState([
    { value: "1", label: "All" },
    { value: "2", label: "BPA Technical" },
    { value: "3", label: "Aqua 2 Cleaning" }
  ]);

  function onFilter(element) {
    console.log(element.value);
  }

  return (
    <div className={styles.eventPlanner}>
      <FullCalendar
        ref={calendarRef}
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="timeGridWeek"
        editable={true}
        selectable={true}
        selectMirror={true}
        dayMaxEvents={true}
        weekends={weekendsVisible}
/*         //
        initialEvents={[
          {
            id: nanoid(),
            title: "All-day event",
            start: todayStr
            // date: "2020-07-29"
          },
          {
            id: nanoid(),
            title: "Timed event",
            start: todayStr + "T12:00:00",
            end: todayStr + "T12:30:00"
            // date: "2020-07-30"
          }
        ]} // alternatively, use the `events` setting to fetch from a feed */
        select={handleDateSelect}
        eventContent={renderEventContent} // custom render function
        eventClick={handleEventClick}
        eventsSet={() => handleEvents(events)}
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
        title={state.state === "update" ? "Update Event" : "Add Event"}
        isOpen={modal}
        viewDate={props.viewDate}
        setViewDate={props.setViewDate}
        subjects={props.subjects}
        setSavePlan={setSavePlan}
      />
    </div>
  );
}