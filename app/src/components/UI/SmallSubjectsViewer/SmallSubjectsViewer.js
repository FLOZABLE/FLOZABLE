import PieChart from "../PieChart";
import styles from "./SmallSubjectsViewer.module.css";
import ChartDataLabel from "chartjs-plugin-datalabels";
import plugin from "chartjs-plugin-datalabels";
import { colorsList } from "../../../constant";
import { useEffect } from "react";
import { Link } from "react-router-dom";

function SmallSubjectsViewer({ subjects }) {

  return (
    <div className={styles.SmallSubjectsViewer}>
      {subjects &&  subjects.daily && subjects.daily.groupedTotal[subjects.daily.groupedTotal.length - 1] ?
        <PieChart
          labels={subjects.map((subject) => subject.name)}
          datasets={[
            {
              label: "Seconds",
              backgroundColor: colorsList,
              borderColor: colorsList,
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