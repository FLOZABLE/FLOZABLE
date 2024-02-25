import { useEffect, useState } from "react";
import { Alert, Article, Book, Coding, Globe, Microscope, Workout, WritePen } from "../../../utils/svgs";
import styles from "./ActivityViewer.module.css";
import { DateTime } from "luxon";
import { Link } from "react-router-dom";

function ActivityViewer({ subjects }) {
  const [activities, setActivities] = useState([]);

  useEffect(() => {
    if (!subjects) return;
    const activities = [];
    subjects.map(subject => {
      const { daily, id, name, icon, color } = subject;
      const todayIndex = daily.grouped.length - 1;
      if (todayIndex < 0) return;
      daily.grouped[todayIndex].map((duration) => {
        activities.push({ subject: { id, name, icon, color }, time: duration });
        return;
      });
      return;
    });
    activities.sort((a, b) => b[0] - a[0]);
    setActivities(activities);
  }, [subjects]);

  return (
    <div className={`${styles.ActivityViewer} customScroll`}>
      {activities.length ? activities.map((activity, i) => {
        const { time, subject } = activity;
        const { color, id, name, icon } = subject;
        let svgIcon = null;
        if (icon === "WritePen") {
          svgIcon = (
            <WritePen
              width={"2.5rem"}
              height={"2.5rem"}
              fill={color}
              opt1={color}
            />
          );
        } else if (icon === "Book") {
          svgIcon = (
            <Book
              width={"2.5rem"}
              height={"2.5rem"}
              fill={color}
              opt1={color}
            />
          );
        } else if (icon === "Microscope") {
          svgIcon = (
            <Microscope
              width={"2.5rem"}
              height={"2.5rem"}
              fill={color}
              opt1={color}
            />
          );
        } else if (icon === "Article") {
          svgIcon = (
            <Article
              width={"2.5rem"}
              height={"2.5rem"}
              fill={color}
              opt1={color}
            />
          );
        } else if (icon === "Coding") {
          svgIcon = (
            <Coding
              width={"2.5rem"}
              height={"2.5rem"}
              fill={color}
              opt1={color}
            />
          );
        } else if (icon === "Globe") {
          svgIcon = (
            <Globe
              width={"2.5rem"}
              height={"2.5rem"}
              fill={color}
              opt1={color}
            />
          );
        } else if (icon === "Workout") {
          svgIcon = (
            <Workout
              width={"2.5rem"}
              height={"2.5rem"}
              fill={color}
              opt1={color}
            />
          );
        } else {
          svgIcon = (
            <Alert
              width={"2.5rem"}
              height={"2.5rem"}
              fill={'var(--purple)'}
              opt1={'var(--purple)'}
            />
          );
        }
        return (
          <div className={styles.activity} key={i}>
            <div className={styles.icon}>
              {svgIcon}
            </div>
            <div>
              <p className={styles.name}>{name}</p>
              <p className={styles.duration}>{DateTime.fromSeconds(time[0]).toFormat('h:mm a')} - {DateTime.fromSeconds(time[1]).toFormat('h:mm a')}</p>
            </div>
          </div>
        )
      }) : 
      <div className={styles.noActivity}>
        <Link to={"/dashboard/study"} >Study to view your activity</Link>
      </div>
    }
    </div>
  )
};

export default ActivityViewer;