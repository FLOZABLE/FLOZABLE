"use client";

import styles from "./SmallSubjectsViewer.module.css";
import { PieChart, Pie, Tooltip, ResponsiveContainer } from "recharts";
import { secondConverter } from "@/app/utils/Tool";
import { PieCustomTooltip } from "@/app/components/Charts/Charts";
import Link from "next/link";
import { useContext } from "react";
import { SubjectsContext } from "@/app/utils/Contexts";

function SmallSubjectsViewer({}) {
  const {subjects} = useContext(SubjectsContext);

  return (
    <div className={styles.SmallSubjectsViewer}>
      {subjects && subjects.daily && subjects.daily.groupedTotal[subjects.daily.groupedTotal.length - 1] ?
        <div className={styles.chartContainer}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Tooltip content={<PieCustomTooltip />} />
              <Pie
                cx="50%"
                cy="50%"
                labelLine={false}
                data={subjects.reduce((arr, subject) => {
                  const value = subject.daily.total[subject.daily.total.length - 1];
                  if (value) {
                    const fill = coldColorsList[arr.length % (coldColorsList.length)];
                    const labelVal = secondConverter(value);
                    arr.push({ value, ...subject, fill, labelVal: `${labelVal.value} ${labelVal.type}` });
                  };
                  return arr;
                }, []
                )}
                dataKey={"value"}
                outerRadius={'100%'}
                innerRadius={'75%'}
                fill="green"
                label={pieCustomLabel}
              >
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>
        : <div className={styles.noSubjects}>
          <Link href={"/dashboard/study"}>
            Study to see stats!
          </Link>
        </div>
      }

    </div>
  )
};

export default SmallSubjectsViewer;