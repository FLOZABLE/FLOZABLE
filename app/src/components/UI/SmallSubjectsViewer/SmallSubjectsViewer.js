import styles from "./SmallSubjectsViewer.module.css";
import ChartDataLabel from "chartjs-plugin-datalabels";
import plugin from "chartjs-plugin-datalabels";
import { coldColorsList, colorsList, warmColorsList } from "../../../constant";
import { useEffect } from "react";
import { Link } from "react-router-dom";
import { PieChart, Pie, Tooltip, ResponsiveContainer, Label } from "recharts";
import { PieCustomTooltip, pieCustomLabel } from "../Charts";
import { secondConverter } from "../../../utils/Tool";
/* 


        <PieChart
          labels={subjects.map((subject) => subject.name)}
          datasets={[
            {
              label: "Seconds",
              backgroundColor: colorsList,
              borderColor: colorsList,
              borderWidth: 5,
              data: subjects.map(
                (subject) =>
                  subject.daily.total[subject.daily.total.length - 1],
              ),
            },
          ]}
          options={{
            plugins: {
              datalabels: {
                color: "#ffffff",
                font: {
                  size: 32,
                  family: "Arial",
                  weight: 700,
                },
                formatter: (value, context, index) => {
                  const { chart, dataIndex } = context;
                  const labels = chart.data.labels;
                  const label = labels[dataIndex];
                  return ``;
                },
              },
            },
          }}
          plugins={ChartDataLabel}
        />
*/

function SmallSubjectsViewer({ subjects }) {

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
                outerRadius={200}
                innerRadius={150}
                fill="green"
                label={pieCustomLabel}
              >
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>
        : <div className={styles.noSubjects}>
          <Link to={"/dashboard/study"}>
            Study to see stats!
          </Link>
        </div>
      }

    </div>
  )
};

export default SmallSubjectsViewer;