import { useEffect, useState } from "react";
import PieChart from "../PieChart";
import styles from "./ExtensionPie.module.css";
import { colorsList } from "../../../constant";
import { plugins } from 'chart.js';
import ChartDataLabel from 'chartjs-plugin-datalabels';
import LineChart from "../LineChart";
import { DateTime } from "luxon";
import DropDownButton from "../DropDownButton/DropDownButton";

const serverOrigin = process.env.REACT_APP_ORIGIN;

function ExtensionPie({ viewDate, viewMode }) {
  const [websites, setWebsites] = useState([]);
  const [viewOption, setViewOption] = useState(0);

  useEffect(() => {
    if (!viewDate || !viewMode) return;
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    console.log(timezone);
    const viewDateSec = DateTime.fromJSDate(viewDate).toSeconds();
    const todaySec = DateTime.now().toSeconds();
    fetch(`${serverOrigin}/extension/usage?date=${viewDateSec}&mode=${viewMode}&timezone=${timezone}`,
      {
        method: "get",
      })
      .then((response) => response.json())
      .then((response) => {
        console.log(response)
        if (response.success) {
          setWebsites(response.websitesData);
          //setSubjects(sortSubjects(data.subjects));
        }
      })
      .catch((error) => console.error(error));
  }, [viewDate, viewMode]);

  return (
    <div className={styles.ExtensionPie}>
      <DropDownButton
        options={[
          { name: "Active Time", value: 0 },
          { name: "Visited Time", value: 1 },
        ]}
        setValue={setViewOption}
      />
      <PieChart
        labels={websites.map(website => { return website.d })}

        datasets={
          [
            {
              label: viewOption ? "Visited Time" : "Active Time",
              backgroundColor: colorsList,
              borderColor: colorsList,
              data: viewOption ? websites.map(website => { return website.v }) : websites.map(website => { return website.t }),
            },
          ]
        }

        options={
          {
            plugins: {
              legend: {
                position: 'bottom',
              },
              datalabels: {
                color: '#ffffff',
                font: {
                  size: 32,
                  family: 'Arial',
                  weight: 700
                },
                formatter: (value, context, index) => {
                  const { chart, dataIndex } = context;
                  const labels = chart.data.labels;
                  const label = labels[dataIndex];
                  return ``;
                }
              }
            }
          }
        }

        plugins={
          ChartDataLabel
        }
      />
    </div>
  )
};

export default ExtensionPie;