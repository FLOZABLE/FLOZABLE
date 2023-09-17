import React, { useEffect, useState } from "react";
import styles from "./PlanTimeline.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBook } from "@fortawesome/free-solid-svg-icons";
import parse from "html-react-parser";
import { WritePen, Book, Microscope, Article, Coding, Globe, Workout, Alert } from "../../../utils/svgs";

function PlanTimeline(props) {
  const { plans, viewMode, viewDate, subjects, setPlans } = props;
  const [plansEl, setPlansEl] = useState([]);

  const togglePlan = (plan) => {
    console.log(plan);
    if (plan.completed) {
      
    }
  };

  useEffect(() => {
    setPlansEl(plans.map((plan, i) => {
      const planSubject = subjects.find((subject) => { return subject.id == plan.subject });
      let isInRange = false;
      if (viewMode === "timeGridDay") {
        if (new Date(viewDate).setHours(0, 0, 0, 0) < plan.start.getTime() && plan.start.getTime() < new Date(viewDate).setHours(23, 59, 59, 999)) {
          isInRange = true;
        };
      } else if (viewMode === "timeGridWeek") {
        const startOfWeek = new Date(viewDate).setDate(new Date(viewDate).getDate() - new Date(viewDate).getDay());
        const endOfWeek = new Date(new Date(viewDate).setDate(viewDate.getDate() + (6 - viewDate.getDay() + 1)));
        endOfWeek.setHours(23, 59, 59, 999);
        if (startOfWeek < plan.start.getTime() && plan.start.getTime() < endOfWeek) {
          isInRange = true;
        };
      } else {
        if (viewDate.getMonth() == plan.start.getMonth()) {
          isInRange = true;
        };
      };

      if (isInRange) {
        const dispStart = `${plan.start.getHours() % 12}:${plan.start.getMinutes().toString().padStart(2, '0')}`;
        const dispEnd = `${plan.end.getHours() % 12}:${plan.end.getMinutes().toString().padStart(2, '0')}`;
        let icon;
        let subjectBg = '#fff';
        if (planSubject) {
          subjectBg = planSubject.color;
          if (planSubject.icon === 'WritePen') {
            icon = <WritePen
              width={"40px"}
              height={"40px"}
              fill={"#000"}
              opt1={"#000"}
            />
          } else if (planSubject.icon === 'Book') {
            icon = <Book
              width={"40px"}
              height={"40px"}
              fill={"#000"}
              opt1={"#000"}
            />
          } else if (planSubject.icon === 'Microscope') {
            icon = <Microscope
              width={"40px"}
              height={"40px"}
              fill={"#000"}
              opt1={"#000"}
            />
          } else if (planSubject.icon === 'Article') {
            icon = <Article
              width={"40px"}
              height={"40px"}
              fill={"#000"}
              opt1={"#000"}
            />
          } else if (planSubject.icon === 'Coding') {
            icon = <Coding
              width={"40px"}
              height={"40px"}
              fill={"#000"}
              opt1={"#000"}
            />
          } else if (planSubject.icon === 'Globe') {
            icon = <Globe
              width={"40px"}
              height={"40px"}
              fill={"#000"}
              opt1={"#000"}
            />
          } else if (planSubject.icon === 'Workout') {
            icon = <Workout
              width={"40px"}
              height={"40px"}
              fill={"#000"}
              opt1={"#000"}
            />
          } else {
            icon = <Alert
              width={"40px"}
              height={"40px"}
              fill={"#000"}
              opt1={"#000"}
            />
          }
        }
        return (
          <li className={styles.plan} key={i}>
            <div className={styles.iconWrapper} style={{ backgroundColor: subjectBg }}>
              {icon}
              <div className={styles.hoverDisp} onClick={() => {togglePlan(plan)}}></div>
            </div>
            <div className={styles.content}>
              <div className={styles.title}>
                <h2>{plan.title}</h2>
                <p>({dispStart}-{dispEnd})</p>
              </div><div className={`${styles.description} customScroll`}>
                {parse(plan.description)}
              </div>
            </div>
          </li>
        );
      };

    }));
  }, [plans, viewMode, viewDate, subjects]);

  return (
    <div className={styles.PlanTimeline}>
      <ul>
        {plansEl}
      </ul>
    </div>
  );
};

export default PlanTimeline;