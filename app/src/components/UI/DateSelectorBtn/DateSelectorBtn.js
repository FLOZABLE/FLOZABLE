import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import styles from "./DateSelectorBtn.module.css";
import { faCaretDown } from "@fortawesome/free-solid-svg-icons";

function DateSelectorBtn({viewDate, isCalendarOpen, setIsCalendarOpen}) {
  return (
    <button className={`${styles.DateSelectorBtn} ${isCalendarOpen ? styles.open : ''}`}
      onClick={() => {setIsCalendarOpen(!isCalendarOpen)}}
    >
      <p>{new Date(viewDate).setHours(0, 0, 0, 0) === new Date().setHours(0, 0, 0, 0) ? 'Today' : `${viewDate.getMonth() + 1}/${viewDate.getDate()}`}</p>
      <i>
      <FontAwesomeIcon icon={faCaretDown} style={{ color: "#545B77", }} className={styles.caret} />
      </i>
    </button>
  );
};

export default DateSelectorBtn;