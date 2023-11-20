import React from "react";
import Chart from "chart.js/auto";
import { Pie } from "react-chartjs-2";

const PieChart = (props) => {
  const data = {
    labels: props.labels,
    datasets: props.datasets
  };
  return (
    <div style={{display: 'flex', alignItems:'center',justifyContent:'center'}}>
      <Pie data={data} options={props.options} plugins={[props.plugins]} />
    </div>
  );
};
export default PieChart;