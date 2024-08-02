import styles from "./SubjectsPie.module.css";
import { updateTimeUsagePie } from "@/app/utils/StatTools";
import Link from "next/link";
import { useContext, useEffect, useState } from "react";
import { PieCustomTooltip } from "../Charts";
import { getDatesDisplay, secondConverter } from "@/app/utils/Tool";
import { Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import CircularLoading from "../../LoadingScreen/CircularLoading/CircularLoading";
import { SubjectsContext } from "@/app/utils/Contexts";

function SubjectsPie({ viewDate, viewer }) {
  const { subjects, useSubjectsIsLoading } = useContext(SubjectsContext);

  const [subjectsPie, setSubjectsPie] = useState([]);
  const [totalTime, setTotalTime] = useState("0 Seconds");
  const [dateDisp, setDateDisp] = useState("");

  useEffect(() => {
    if (!subjects || !viewDate || !viewer) return;

    const subjectsPie = updateTimeUsagePie(subjects, viewDate, viewer);
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

  useEffect(() => {
    if (!viewDate || !viewer) return;

    const dateDisp = getDatesDisplay(viewDate, viewer);
    setDateDisp(dateDisp);
  }, [viewDate, viewer]);

  if (useSubjectsIsLoading) {
    return <CircularLoading />;
  }

  return (
    <div className={`Box ${styles.SubjectsPie}`}>
      <div className="header">Study Trend</div>
      <div className={styles.date}>{dateDisp}</div>
      {subjectsPie.length ? (
        <div className={styles.chartContainer}>
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
                innerRadius={"65%"}
                fill="green"
              ></Pie>
            </PieChart>
            <div className={styles.totalTime}>
              <p className={styles.time}>{totalTime}</p>
              <p className={styles.text}>Total</p>
            </div>
          </ResponsiveContainer>
        </div>
      ) : (
        <div
          style={{
            alignSelf: "center",
            fontSize: "2rem",
            textDecoration: "underline",
          }}
        >
          <Link href="/dashboard/study">
            <h3>Study to see stats!</h3>
          </Link>
        </div>
      )}

      <div className={styles.labels}>
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
