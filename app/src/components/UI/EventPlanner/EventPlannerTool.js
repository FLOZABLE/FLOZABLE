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

function handleEventClick(clickInfo, setModal, setInformation) {
  //setEnd(clickInfo.event.end);
/*   const calendarApi = clickInfo.view.calendar;
  calendarApi.addEvent({
    start: clickInfo.start,
    end: clickInfo.end
  }) */
  setModal(true);
};

function handleEventDrop(checkInfo) {
  // console.log(checkInfo.event.start.toISOString());
  // checkInfo.revert();
  //setState({ checkInfo, state: "drop" });
  //setConfirmModal(true);
};

function handleEventResize(checkInfo) {
  // console.log(checkInfo);
  //setState({ checkInfo, state: "resize" });
  //setConfirmModal(true);
};

function handleDateSelect(eventInfo, setModal, setSelectedEvent, setViewDate) {
  // console.log(selectInfo.view.type);
  if (
    eventInfo.view.type === "timeGridWeek" ||
    eventInfo.view.type === "timeGridDay"
  ) {
    console.log(eventInfo)
    //selectInfo.view.calendar.unselect();
    /* setState({ selectInfo, state: "create" });
    // Open modal create
    console.log("open modal create");
    // console.log(selectInfo);
    setStart(selectInfo.start);
    setEnd(selectInfo.end);
    setModal(true); */
    setViewDate(new Date(new Date(eventInfo.start).setHours(0, 0, 0, 0)));
    const calendarApi = eventInfo.view.calendar;
    calendarApi.addEvent({
      start: eventInfo.start,
      end: eventInfo.end,
      title: ''
    })
    setSelectedEvent(eventInfo);
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
};

function handleDateClick(arg) {
  // bind with an arrow function
  // console.log(arg.dateStr);
};

function handleUpdate(selectedEvent, title, startTime, stopTime, subject, notification, description, setSelectedEvent) {
  console.log(selectedEvent, title, startTime, stopTime, subject, notification, description)
  const calendarApi = selectedEvent.view.calendar;
  setSelectedEvent({start: startTime, end: stopTime, title: title, description: description})
  /* selectedEvent.start = startTime;
  selectedEvent.end = stopTime;
  selectedEvent.title = title;
  selectedEvent.description = description; */
  /* calendarApi.addEvent({
    title: title,
    start: startTime,
    end: stopTime
  }) */
  console.log(calendarApi)
}

export {renderEventContent, handleEventClick, handleEventDrop, handleEventResize, handleDateSelect, handleDateClick, handleUpdate };