"use client";

import { CartesianGrid, Line, LineChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend } from "recharts";
import React, { useContext, useEffect, useState } from "react";
import { secondConverter } from "@/utils/Tool";
import { colorsList } from "@/utils/Constant";
import { SubjectsContext } from "@/utils/Contexts";
import { updateSubjectsTrendChart } from "@/utils/StatTools";

function StudyTrendChart({
  viewDate=new Date(),
  statsViewer="Daily"
}) {
  const {subjects} = useContext(SubjectsContext);

  const [subjectsTrend, setSubjectsTrend] = useState([]);
  const [filteredTrends, setFilteredTrends] = useState([]);

  useEffect(() => {
    if (!subjects || !viewDate || !statsViewer) return;

    const { daily } = subjects;

    if (!daily) return;

    const change = statsViewer === "Monthly" ? "months" : statsViewer === "Weekly" ? "weeks" : "days";
    const subjectsTrend = updateSubjectsTrendChart(subjects, viewDate, statsViewer, change);
    setSubjectsTrend(subjectsTrend);

  }, [subjects, viewDate, statsViewer]);

  return (
    <ResponsiveContainer width="98%" height="98%">
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
        {subjectsTrend.length ? subjectsTrend[0].data.map((subject, i) => {
          return (
            <Line name={subject.info.name} type="monotone" key={subject.info.id} dataKey={subject.info.id} stroke={colorsList[i % colorsList.length]} activeDot={{ r: 8 }} />
          )
        }) : null}
      </LineChart>
    </ResponsiveContainer>
  )
};

export default StudyTrendChart;