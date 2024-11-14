import styles from "./SubjectsPie.module.css";
import { updateTimeUsagePie } from "@/app/utils/StatTools";
import { useEffect, useState } from "react";
import { PieCustomTooltip } from "../Charts";
import { secondConverter } from "@/app/utils/Tool";
import { Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import CircularLoading from "../../LoadingScreen/CircularLoading/CircularLoading";
import DateSelectorBtn from "../../Buttons/DateSelectorBtn/DateSelectorBtn";
import ViewerSelectorBtn from "../../Buttons/ViewerSelectorBtn/ViewerSelectorBtn";
import Link from "next/link";
import { useSubjects } from "@/Hooks/subjectsHooks";

function SubjectsPie({ viewDate, setViewDate, viewer, setViewer }) {
  const { subjects, subjectsIsLoading } = useSubjects();

  const [subjectsPie, setSubjectsPie] = useState([]);
  const [totalTime, setTotalTime] = useState("0 Seconds");

  useEffect(() => {
    if (!subjects || !viewDate || !viewer) return;

    const subjectsPie = updateTimeUsagePie(subjects, viewDate, viewer).filter(
      (subject) => subject.value
    );
    setSubjectsPie(subjectsPie);
    let totalTime = 0;
    subjectsPie.map((subject) => {
      totalTime += subject.value;
    });
    const { value, type } = secondConverter(totalTime, [
      "seconds",
      "minutes",
      "hours",
    ]);
    setTotalTime(`${value} ${type}`);
  }, [subjects, viewDate, viewer]);

  return (
    <div className={`Box ${styles.SubjectsPie}`}>
      <div className={styles.optionAlign}>
        <h2>Subjects</h2>
        <div className={styles.options}>
          <div className={styles.DateSelectorBtn}>
            <DateSelectorBtn
              viewDate={viewDate}
              setViewDate={setViewDate}
              viewer={viewer}
              style={{color: "var(--gray2)"}}
            />
          </div>
          <div className={styles.ViewerSelectorBtn}>
            <ViewerSelectorBtn viewer={viewer} setViewer={setViewer} />
          </div>
        </div>
      </div>
      {subjectsIsLoading ? (
        <CircularLoading />
      ) : !subjectsPie.length ? (
        <div className={styles.chartContainer} id={styles.noChart}>
          <Link href={"/dashboard/study"}>Study to see stats</Link>
        </div>
      ) : (
        <div className={styles.chartContainer}>
          <div className={styles.totalTime}>
            <p className={styles.time}>{totalTime}</p>
            <p className={styles.text}>Total</p>
          </div>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Tooltip content={<PieCustomTooltip />} />
              <Pie
                cx="50%"
                cy="50%"
                labelLine={false}
                data={subjectsPie}
                dataKey={"value"}
                outerRadius={"100%"}
                innerRadius={"70%"}
                fill="green"
              ></Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}
      <div className={`customScroll ${styles.labels}`}>
        {subjectsPie.map((subject, i) => {
          return (
            <div className={styles.label} key={i}>
              <div
                className={styles.icon}
                style={{ backgroundColor: subject.fill }}
              ></div>
              <p className={styles.name}>{subject.name}</p>
              <p className={styles.time}>{subject.labelVal}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default SubjectsPie;
