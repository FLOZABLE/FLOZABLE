import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import styles from "./DateSelectorBtn.module.css";
import { faCaretDown } from "@fortawesome/free-solid-svg-icons";
import { useState, useEffect } from "react";
import { DateTime } from "luxon";

function DateSelectorBtn({
  viewDate,
  startDate,
  endDate,
  isCalendarOpen,
  setIsCalendarOpen,
  viewMode
}) {
  const [viewString, setViewString] = useState("");

  useEffect(() => {
    const viewDateTime = DateTime.fromJSDate(viewDate);
    let startMillis;
    let stopMillis;
    if (viewMode === 'Monthly') {
      startMillis = viewDateTime.startOf('month').toMillis();
      stopMillis = viewDateTime.endOf('month').toMillis();
      if (startMillis < new Date().getTime() && new Date().getTime() < stopMillis) {
        setViewString('This Month');
      }
      else {
        setViewString(viewDateTime.monthLong);
      }
    } else if (viewMode === 'Weekly') {
      startMillis = viewDateTime.startOf('week').toMillis();
      stopMillis = viewDateTime.endOf('week').toMillis();
      if (startMillis < new Date().getTime() && new Date().getTime() < stopMillis) {
        setViewString('This Week');
      }
      else {
        setViewString(viewDateTime.startOf('week').month + "/" + viewDateTime.startOf('week').day + " ~ " + viewDateTime.endOf('week').month + "/" + viewDateTime.endOf('week').day);
      }
    } else {
      startMillis = viewDateTime.startOf('day').toMillis();
      stopMillis = viewDateTime.endOf('day').toMillis();
      if (startMillis < new Date().getTime() && new Date().getTime() < stopMillis) {
        setViewString('Today');
      }
      else {
        setViewString(viewDateTime.month + "/" + viewDateTime.day);
      }
    };
  }, [startDate, viewDate, viewMode]);

  return (
    <button
      className={`${styles.DateSelectorBtn} ${
        isCalendarOpen ? styles.open : ""
      }`}
      onClick={() => {
        setIsCalendarOpen(!isCalendarOpen);
      }}
    >
      <p>{viewString}</p>
      <i>
        <FontAwesomeIcon
          icon={faCaretDown}
          style={{ color: "#545B77" }}
          className={styles.caret}
        />
      </i>
    </button>
  );
}

export default DateSelectorBtn;