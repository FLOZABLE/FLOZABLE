import { Legend } from "chart.js";
import { CartesianGrid, Line, LineChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";
import { secondConverter } from "../../utils/Tool";
import { useState } from "react";

function StudyTrendChart({subjectsTrend}) {
  const [filteredTrends, setFilteredTrends] = useState([]);

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart
        data={subjectsTrend.map((day, i) => {
          const data = day.data.reduce((accumulator, subject) => {
            if (!filteredTrends.includes(subject.info.id)) {
              accumulator[subject.info.id] = subject.value;
            };
            return accumulator;
          }, {});
          return { label: day.label, ...data }
        })}
        margin={{
          top: 5,
          right: 30,
          left: 20,
          bottom: 5,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="label" />
        <YAxis tickFormatter={(data) => {
          const { value, type } = secondConverter(data);
          return `${value} ${type}`
        }} />
        <Tooltip formatter={(data) => {
          const { value, type } = secondConverter(data);
          return `${value} ${type}`
        }} />
        <Legend
          onClick={(e) => {
            if (filteredTrends.includes(e.dataKey)) {
              setFilteredTrends(prev => {
                return prev.filter(item => item !== e.dataKey);
              })
            } else {
              setFilteredTrends(prev => {
                return [...prev, e.dataKey]
              })
            }
          }}
        />
        {subjectsTrend.length ? subjectsTrend[0].data.map((subject) => {
          return (
            <Line name={subject.info.name} type="monotone" key={subject.info.id} dataKey={subject.info.id} stroke="#8884d8" activeDot={{ r: 8 }} />
          )
        }) : null}
      </LineChart>
    </ResponsiveContainer>
  )
};

export default StudyTrendChart;