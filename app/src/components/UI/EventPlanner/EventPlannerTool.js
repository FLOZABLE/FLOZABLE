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

function handleDateSelect(selectInfo, setModal, setSelectedPlan, setViewDate) {
  // console.log(selectInfo.view.type);
  if (
    selectInfo.view.type === "timeGridWeek" ||
    selectInfo.view.type === "timeGridDay"
  ) {
    console.log(selectInfo)
    //selectInfo.view.calendar.unselect();
    /* setState({ selectInfo, state: "create" });
    // Open modal create
    console.log("open modal create");
    // console.log(selectInfo);
    setStart(selectInfo.start);
    setEnd(selectInfo.end);
    setModal(true); */
    console.log(new Date())
    setViewDate(new Date(new Date(selectInfo.start).setHours(0, 0, 0, 0)));
    setSelectedPlan(selectInfo);
    setModal(true)
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

function handleUpdate(selectedEvent) {

}

export {renderEventContent, handleEventClick, handleEventDrop, handleEventResize, handleDateSelect, handleDateClick, handleUpdate };