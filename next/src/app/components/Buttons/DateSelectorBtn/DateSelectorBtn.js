import styles from "./DateSelectorBtn.module.css";
import React, { useState, useEffect } from "react";
import { DateTime } from "luxon";
import { getDatesDisplay } from "@/app/utils/Tool";

function DateSelectorBtn({ viewDate, setViewDate, viewer }) {
  const [dateDisp, setDateDisp] = useState("");

  useEffect(() => {
    if (!viewDate || !viewer) return;
    const dateTime = DateTime.fromJSDate(viewDate);
    const date1 = dateTime.startOf(viewer).toJSDate();
    const date2 = viewer === "week" ? dateTime.endOf(viewer).toJSDate() : null;

    const dateDisp = getDatesDisplay({
      date1,
      date2,
      mode: viewer,
      formats: {
        day: "LLL d",
        week: "LLL d",
        month: "kkkk LLL",
      },
    });
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
      {setViewDate ? (
        <div className={styles.button} onClick={onDecr}>
          {"<"}
        </div>
      ) : null}
      <p>{dateDisp}</p>
      {setViewDate ? (
        <div className={styles.button} onClick={onIncr}>
          {">"}
        </div>
      ) : null}
    </div>
  );
}

export default DateSelectorBtn;
