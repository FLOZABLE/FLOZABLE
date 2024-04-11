import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import styles from "./DateSelectorBtn.module.css";
import { faCaretDown } from "@fortawesome/free-solid-svg-icons";
import React, { useState, useEffect } from "react";
import { DateTime } from "luxon";

function DateSelectorBtn({
  viewDate,
  isCalendarOpen,
  setIsCalendarOpen,
  viewMode
}) {
  const [viewString, setViewString] = useState("");

  useEffect(() => {
    const viewDateTime = DateTime.fromJSDate(viewDate);
    const now = DateTime.now();

    if (viewMode === 'Monthly') {
      if (viewDateTime.hasSame(now, 'month') && viewDateTime.hasSame(now, 'year')) {
        setViewString('This Month');
      } else {
        setViewString(viewDateTime.monthLong);
      };
    } else if (viewMode === 'Weekly') {
      if (viewDateTime.hasSame(now, 'week') && viewDateTime.hasSame(now, 'year')) {
        setViewString('This Week');
      } else {
        setViewString(viewDateTime.startOf('week').month + "/" + viewDateTime.startOf('week').day + " ~ " + viewDateTime.endOf('week').month + "/" + viewDateTime.endOf('week').day);
      };
    } else {
      if (viewDateTime.hasSame(now, 'day')) {
        setViewString('Today');
      } else {
        setViewString(viewDateTime.month + "/" + viewDateTime.day);
      };
    };
  }, [viewDate, viewMode]);

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