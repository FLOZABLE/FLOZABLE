import styles from "./SmallSubjectsViewer.module.css";
import ChartDataLabel from "chartjs-plugin-datalabels";
import plugin from "chartjs-plugin-datalabels";
import { coldColorsList, colorsList, warmColorsList } from "../../../constant";
import { useEffect } from "react";
import { Link } from "react-router-dom";
import { PieChart, Pie, Tooltip, ResponsiveContainer, Label } from "recharts";
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
const RADIAN = Math.PI / 180;
const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }) => {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central">
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};
function SmallSubjectsViewer({ subjects }) {

  return (
    <div className={styles.SmallSubjectsViewer}>
      {subjects && subjects.daily && subjects.daily.groupedTotal[subjects.daily.groupedTotal.length - 1] ?
        <div className={styles.chartContainer}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Tooltip />
              <Pie
                         cx="50%"
                         cy="50%"
                         labelLine={false}
                data={subjects.reduce((arr, subject) => {
                  const total = subject.daily.total[subject.daily.total.length - 1];
                  if (total) {
                    console.log(arr.length % (warmColorsList.length - 1))
                    const fill = coldColorsList[arr.length % (coldColorsList.length - 1)];
                    arr.push({ total, subject, fill });
                  };
                  return arr;
                }, []
                )}
                dataKey="total"
                outerRadius={150}
                innerRadius={100}
                fill="green"
                label={renderCustomizedLabel}
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