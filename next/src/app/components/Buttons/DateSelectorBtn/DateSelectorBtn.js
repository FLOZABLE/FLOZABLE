import styles from "./DateSelectorBtn.module.css";
import React, { useState, useEffect } from "react";
import { DateTime } from "luxon";
import { getDatesDisplay } from "@/app/utils/Tool";

function DateSelectorBtn({ viewDate, setViewDate, viewMode }) {
  const [dateDisp, setDateDisp] = useState("");

  useEffect(() => {
    if (!viewDate || !viewMode) return;
    const dateDisp = getDatesDisplay(viewDate, viewMode);
    setDateDisp(dateDisp);
  }, [viewDate, viewMode]);

  function onDecr() {
    let viewDateTime = DateTime.fromJSDate(viewDate);

    viewDateTime = viewDateTime.minus({ [viewMode]: 1 });
    setViewDate(viewDateTime.toJSDate());
  }

  function onIncr() {
    let viewDateTime = DateTime.fromJSDate(viewDate);

    viewDateTime = viewDateTime.plus({ [viewMode]: 1 });
    setViewDate(viewDateTime.toJSDate());
  }

  return (
    <div className={styles.DateSelectorBtn}>
      <div className={styles.button} onClick={onDecr}>
        {"<"}
      </div>
      <p>{dateDisp}</p>
      <div className={styles.button} onClick={onIncr}>
        {">"}
      </div>
    </div>
  );
}

export default DateSelectorBtn;
