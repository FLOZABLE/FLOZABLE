import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import styles from "./DateSelectorBtn.module.css";
import { faCaretDown } from "@fortawesome/free-solid-svg-icons";
import { useState, useEffect } from "react";

function DateSelectorBtn({viewDate, startDate, endDate, isCalendarOpen, setIsCalendarOpen}) {
  const[viewString, setViewString] = useState("");
  useEffect(() => {
    if (!!startDate){
      let startUnix = new Date(startDate);
      let endUnix = new Date(endDate);
      let startString = `${startUnix.getMonth() + 1}/${startUnix.getDate()}`;
      let endString = `${endUnix.getMonth() + 1}/${endUnix.getDate()}`;
      if (startUnix.setHours(0, 0, 0, 0) === new Date().setHours(0, 0, 0, 0)){
        setViewString("Today");
      }
      else if (startUnix.setHours(0, 0, 0, 0) === endUnix.setHours(0, 0, 0, 0)){
        setViewString(startString);
      }
      else{
        setViewString(startString + " ~ " + endString);
      }
    }
    else{
      setViewString(new Date(viewDate).setHours(0, 0, 0, 0) === new Date().setHours(0, 0, 0, 0) ? 'Today' : `${viewDate.getMonth() + 1}/${viewDate.getDate()}`);
    }
  },[startDate, viewDate]);
  return (
    <button className={`${styles.DateSelectorBtn} ${isCalendarOpen ? styles.open : ''}`}
      onClick={() => {setIsCalendarOpen(!isCalendarOpen)}}
    >
      <p>{viewString}</p>
      <i>
      <FontAwesomeIcon icon={faCaretDown} style={{ color: "#545B77", }} className={styles.caret} />
      </i>
    </button>
  );
};

export default DateSelectorBtn;