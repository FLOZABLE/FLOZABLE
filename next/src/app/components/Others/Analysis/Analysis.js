import { useSubjects } from "@/Hooks/subjectsHooks";
import styles from "./Analysis.module.css";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useEffect, useState } from "react";
import { getAnalysis } from "@/app/utils/StatTools";
import { secondConverter } from "@/app/utils/Tool";

export default function Analysis({ viewDate, viewer }) {
  const { subjects } = useSubjects();

  console.log(subjects, "gdf");
  const [subjectsLine, setSubjectsLine] = useState([]);
  const [summary, setSummary] = useState("");

  useEffect(() => {
    const { data, summary } = getAnalysis(viewer, viewDate, subjects);
    console.log("analysus", data);
    setSubjectsLine(data);
    setSummary(summary);
  }, [viewDate, viewer, subjects]);

  return (
    <div className={`Box ${styles.Analysis}`}>
      <p className={styles.summary}>{summary}</p>
      <div className={styles.barChart}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            width={500}
            height={300}
            data={subjectsLine}
            margin={{
              top: 20,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="label" />
            <YAxis
              tickFormatter={(sec) => {
                const formattedValue = secondConverter({ sec });
                return formattedValue;
              }}
            />
            <Tooltip
              formatter={(sec) => {
                const formattedValue = secondConverter({ sec });
                return formattedValue;
              }}
            />
            <Tooltip />
            <Legend />
            {subjects.map((subject, i) => {
              return (
                <Bar
                  dataKey={subject.name}
                  stackId="a"
                  fill={subject.color}
                  key={i}
                />
              );
            })}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
