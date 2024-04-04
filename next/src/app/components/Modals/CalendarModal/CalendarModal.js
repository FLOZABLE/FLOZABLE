import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import styles from "./CalendarModal.module.css";
import { faXmark } from "@fortawesome/free-solid-svg-icons";
import React from 'react';
import SmallCalendar from "@/Components/Plans/SmallCalendar/SmallCalendar";

function CalendarModal({
  isOpen,
  setIsOpen,
  updateViewDate,
  viewDate,
  showHeatmap = false
}) {
  return (
    <div
      className={`${styles.CalendarModal} modal ${
        isOpen ? "open" : ""
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
        viewDate={viewDate}
        setViewDate={updateViewDate}
        setIsOpen={setIsOpen}
        showHeatmap={showHeatmap}
      />
    </div>
  );
}

export default CalendarModal;
