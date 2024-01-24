import React from "react";
import Chart from "chart.js/auto";
import { Line } from "react-chartjs-2";

const LineChart = (props) => {
const data = {
  labels: props.labels,
  datasets: props.datasets
};
  return (
    <div>
      <Line data={data} options={{...props.options}} />
    </div>
  );
};

export default LineChart;