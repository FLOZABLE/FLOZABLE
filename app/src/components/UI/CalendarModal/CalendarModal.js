import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import styles from "./CalendarModal.module.css";
import SmallCalendar from "../SmallCalendar/SmallCalendar";
import { faXmark } from "@fortawesome/free-solid-svg-icons";
import React from 'react';

function CalendarModal({
  isCalendarOpen,
  setIsCalendarOpen,
  updateViewDate,
  viewDate,
  subjects = [],
  showHeatmap = false
}) {
  return (
    <div
      className={`${styles.CalendarModal} modal ${
        isCalendarOpen ? "open" : ""
      }`}
    >
      <div className={styles.modalHeader}>
        <i
          onClick={() => {
            setIsCalendarOpen(false);
          }}
        >
          <FontAwesomeIcon icon={faXmark} />
        </i>
      </div>
      <SmallCalendar
        width={"25rem"}
        setViewDate={updateViewDate}
        viewDate={viewDate}
        setIsCalendarOpen={setIsCalendarOpen}
        showHeatmap={showHeatmap}
        subjects={subjects}
      />
    </div>
  );
}

export default CalendarModal;
