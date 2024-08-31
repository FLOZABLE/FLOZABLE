import styles from "./DateSelectorBtn.module.css";
import React, { useState, useEffect } from "react";
import { DateTime } from "luxon";
import { getDatesDisplay } from "@/app/utils/Tool";

function DateSelectorBtn({ viewDate, setViewDate, viewer }) {
  const [dateDisp, setDateDisp] = useState("");

  useEffect(() => {
    if (!viewDate || !viewer) return;
    const dateDisp = getDatesDisplay(viewDate, viewer);
    setDateDisp(dateDisp);
  }, [viewDate, viewer]);

  function onDecr() {
    let viewDateTime = DateTime.fromJSDate(viewDate);

    viewDateTime = viewDateTime.minus({ [viewer]: 1 });
    setViewDate(viewDateTime.toJSDate());
  }

  function onIncr() {
    let viewDateTime = DateTime.fromJSDate(viewDate);

    viewDateTime = viewDateTime.plus({ [viewer]: 1 });
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
