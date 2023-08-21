import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark } from '@fortawesome/free-solid-svg-icons';
import styles from './StatsCalendar.module.css';
import "../Calendar.css"
import { Datepicker, CalendarPrev, CalendarNav, CalendarNext, CalendarToday, setOptions } from '@mobiscroll/react';

setOptions({
  theme: 'ios',
  themeVariant: 'light'
});

function StatsCalendar(props) {
  const [colors] = React.useState([
    { recurring: { repeat: 'yearly', month: 12, day: 8 }, background: '#9ccc65' },
    { recurring: { repeat: 'yearly', month: 5, day: 1 }, background: 'red' },
    { recurring: { repeat: 'yearly', month: 12, day: 24 }, background: '#fff568' },
    { recurring: { repeat: 'yearly', month: 12, day: 25 }, background: '#e88080' },
    { date: '2023-09-04T00:00', background: '#cfd8dc' },
    { date: '2023-10-24T00:00', background: '#9575cd' },
    { date: '2023-06-13T00:00', background: '#d4e157' },
    { date: '2023-07-06T00:00', background: "#f4511e" },
    { date: '2023-09-06T00:00', background: '#46c4f3' },
    { date: '2023-09-22T00:00', background: '#7e56bd' },
    { date: '2023-07-11T00:00', background: '#46c4f3' },
    { date: '2023-07-29T00:00', background: '#7e56bd' },
    { date: '2023-08-02T00:00', background: '#46c4f3' },
    { date: '2023-08-03T00:00', background: '#7e56bd' },
    { date: '2023-08-11T00:00', background: '#f13f77' },
    { date: '2023-08-19T00:00', background: '#8dec7d' },
    { date: '2023-08-28T00:00', background: '#ea4986' },
    { start: '2023-09-15T00:00', end: '2023-09-18T00:00', text: 'Conference', background: '#f4511e' }
  ]);

  const calendarHeaderCustom = () => {
    return <React.Fragment>
      <CalendarPrev className="custom-prev" />
      <CalendarNav className="custom-nav" />
      <CalendarNext className="custom-next" />
      <div className={styles.right}>
        <CalendarToday />
        <button onClick={props.onToggleCalendar}>
        <FontAwesomeIcon icon={faXmark} className={styles.caret}/>
        </button>
      </div>
    </React.Fragment>;
  };

  const dateChanged = (event, inst) => {
    console.log(event.value, inst)
    if (props.isCalendarOpen) {
      props.onToggleCalendar();
    }
  }

  return (
    <div className={styles.StatsCalendarContainer}>
      <Datepicker
        controls={['calendar']}
        display="inline"
        renderCalendarHeader={calendarHeaderCustom}
        colors={colors}
        onChange ={dateChanged}
      />
    </div>
  );
}

export default StatsCalendar;