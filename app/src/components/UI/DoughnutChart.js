import React from "react";
import Chart from "chart.js/auto";
import { Doughnut } from "react-chartjs-2";

const DoughnutChart = (props) => {
  const data = {
    labels: props.labels,
    datasets: props.datasets
  };
  return (
    <div style={{display: 'flex', alignItems:'center',justifyContent:'center'}}>
      <Doughnut data={data} options={props.options} plugins={[props.plugins]} />
    </div>
  );
};
export default DoughnutChart;