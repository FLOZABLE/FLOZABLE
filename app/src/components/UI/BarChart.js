// ./components/BarChart.js

import React from "react";
import Chart from "chart.js/auto";
import { Bar } from "react-chartjs-2";

const BarChart = (props) => {
  const data = {
    labels: props.labels,
    datasets: props.datasets
  };
  return (
    <div style={{ height: props.height}}>
      <Bar data={data} options={props.options}/>
    </div>
  );
};

export default BarChart;