import React, { useState, useRef } from "react";

// import "@fullcalendar/common";
import FullCalendar from "@fullcalendar/react";
import timeGridPlugin from "@fullcalendar/timegrid";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import { nanoid } from "nanoid";
import {
  Row,
  Col,
  Button,
  FormGroup,
  Label,
  Input,
  Container
} from "reactstrap";
import Select from "react-select";
import events from "./Events";
// import "@fullcalendar/core/main.css";
// import "@fullcalendar/daygrid/main.css";
// import "@fullcalendar/timegrid/main.css";

import EventModal from "./EventModal";

let todayStr = new Date().toISOString().replace(/T.*$/, "");

export default function App() {
  const [weekendsVisible, setWeekendsVisible] = useState(true);
  const [currentEvents, setCurrentEvents] = useState([]);
  const [modal, setModal] = useState(false);
  const [confirmModal, setConfirmModal] = useState(false);
  const calendarRef = useRef(null);

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
  // function renderSidebar() {
  //   return (
  //     <div className="demo-app-sidebar">
  //       <div className="demo-app-sidebar-section">
  //         <h2>Instructions</h2>
  //         <ul>
  //           <li>Select dates and you will be prompted to create a new event</li>
  //           <li>Drag, drop, and resize events</li>
  //           <li>Click an event to delete it</li>
  //         </ul>
  //       </div>
  //       <div className="demo-app-sidebar-section">
  //         <label>
  //           <input
  //             type="checkbox"
  //             checked={weekendsVisible}
  //             onChange={handleWeekendsToggle}
  //           />
  //           toggle weekends
  //         </label>
  //       </div>
  //       <div className="demo-app-sidebar-section">
  //         <h2>All Events ({currentEvents.length})</h2>
  //         <ul>{currentEvents.map(renderSidebarEvent)}</ul>
  //       </div>
  //     </div>
  //   );
  // }
  // function renderSidebarEvent(event) {
  //   return (
  //     <li key={event.id}>
  //       <b>
  //         {formatDate(event.start, {
  //           year: "numeric",
  //           month: "short",
  //           day: "numeric"
  //         })}
  //       </b>
  //       <i>{event.title}</i>
  //     </li>
  //   );
  // }
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
      // console.log(selectInfo);
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
  function handleSubmit() {
    // console.log(state.selectInfo.view.calendar);
    const newEvent = {
      id: nanoid(),
      title,
      start: state.selectInfo?.startStr || start.toISOString(),
      end: state.selectInfo?.endStr || end.toISOString(),
      allDay: state.selectInfo?.allDay || false
    };
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
    <div className="App">
      <h1>Hello FullCalendar</h1>
      {/* {renderSidebar()} */}
      <Container>
        <Row style={{ marginBottom: 20 }}>
          <Col
            sm={{ size: 3 }}
            md={{ size: 3 }}
            style={{
              paddingLeft: 15
            }}
          >
            <Select
              style={{ float: "left" }}
              defaultValue={departments[0]}
              options={departments}
              onChange={(element) => onFilter(element)}
            />
          </Col>
          <Col
            sm={{ size: 3, offset: 6 }}
            md={{ size: 3, offset: 6 }}
            style={{
              paddingRight: 15
            }}
          >
            <Button
              style={{ float: "right" }}
              color="secondary"
              onClick={() => setModal(true)}
            >
              Add schedule
            </Button>
          </Col>
        </Row>
        <Row>
          <Col md={12}>
            <FullCalendar
              ref={calendarRef}
              // customButtons={{
              //   myCustomButton: {
              //     text: "custom!",
              //     click: function() {
              //       alert("clicked the custom button!");
              //     }
              //   }
              // }}
              plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
              headerToolbar={{
                // left: "myCustomButton prev,today,next",
                left: "prev,today,next",
                center: "title",
                right: "dayGridMonth,timeGridWeek,timeGridDay"
              }}
              buttonText={{
                today: "current",
                month: "month",
                week: "week",
                day: "day",
                list: "list"
              }}
              initialView="timeGridWeek"
              editable={true}
              selectable={true}
              selectMirror={true}
              dayMaxEvents={true}
              weekends={weekendsVisible}
              //
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
              ]} // alternatively, use the `events` setting to fetch from a feed
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
          </Col>
        </Row>
      </Container>

      <EventModal
        title={state.state === "update" ? "Update Event" : "Add Event"}
        isOpen={modal}
        toggle={handleCloseModal}
        onCancel={handleCloseModal}
        onSubmit={state.clickInfo ? handleEdit : handleSubmit}
        submitText={state.clickInfo ? "Update" : "Save"}
        onDelete={state.clickInfo && handleDelete}
        deleteText="Delete"
      >
        <FormGroup>
          <Label for="exampleEmail">Title</Label>
          <Input
            type="text"
            name="title"
            placeholder="with a placeholder"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </FormGroup>
        <FormGroup>
          <Label for="exampleEmail">From - End</Label>
          {/* <DateRangePicker
            initialSettings={{
              locale: {
                format: "M/DD hh:mm A"
              },
              startDate: start,
              endDate: end,
              timePicker: true
            }}
            onApply={(event, picker) => {
              // console.log(
              //   "picker",
              //   picker.startDate.toISOString(),
              //   picker.endDate.toISOString()
              // );
              setStart(new Date(picker.startDate));
              setEnd(new Date(picker.endDate));
            }}
          >
            <input className="form-control" type="text" />
          </DateRangePicker> */}
        </FormGroup>
      </EventModal>

      <EventModal
        title={state.state === "resize" ? "Resize Event" : "Drop Event"}
        isOpen={confirmModal}
        toggle={() => {
          state.checkInfo.revert();
          setConfirmModal(false);
        }}
        onCancel={() => {
          state.checkInfo.revert();
          setConfirmModal(false);
        }}
        cancelText="Cancel"
        onSubmit={() => setConfirmModal(false)}
        submitText={"OK"}
      >
        Do you want to {state.state} this event?
      </EventModal>
    </div>
  );
}