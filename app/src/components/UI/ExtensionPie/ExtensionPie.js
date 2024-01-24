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

function ExtensionPie({ websites, viewOption }) {
  
  return (
    <div className={styles.ExtensionPie}>
      <PieChart
        labels={websites.map(website => { return website.d })}

        datasets={
          [
            {
              label: viewOption ? "Visited Time" : "Active Time",
              backgroundColor: colorsList,
              borderColor: colorsList,
              data: viewOption ? websites.map(website => { return website.v }) : websites.map(website => { return Math.floor(website.t / (60 * 60)) }),
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