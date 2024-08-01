"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from "recharts";
import React, { useEffect, useState } from "react";
import { updateSubjectsTrendChart } from "@/app/utils/StatTools";
import { colorsList } from "@/app/utils/Constant";
import { secondConverter } from "@/app/utils/Tool";
import EditSubjectBtn from "../../Buttons/EditSubjectBtn/EditSubjectBtn";
import styles from "./StudyTrendChart.module.css";
import { useSubjects } from "@/Hooks/subjectsHooks";

function StudyTrendChart({ viewDate, viewer = "day", subjectsProp }) {
  const { subjects } = useSubjects();

  const [subjectsTrend, setSubjectsTrend] = useState([]);
  const [filteredTrends, setFilteredTrends] = useState([]);

  useEffect(() => {
    if (!subjects || !viewDate || !viewer) return;

    if (!subjectsProp) {
      const { daily } = subjects;

      if (!daily) return;

      const subjectsTrend = updateSubjectsTrendChart(
        subjects,
        viewDate,
        viewer
      );
      setSubjectsTrend(subjectsTrend);
    } else {
      const { daily } = subjectsProp;

      if (!daily) return;

      const subjectsTrend = updateSubjectsTrendChart(
        subjectsProp,
        viewDate,
        viewer
      );
      setSubjectsTrend(subjectsTrend);
    }
  }, [subjects, viewDate, viewer, subjectsProp]);

  console.log(
    subjectsTrend.map((day, i) => {
      const data = day.data.reduce((accumulator, subject) => {
        if (!filteredTrends.includes(subject.subject_id)) {
          accumulator[subject.subject_id] = subject.value;
        }
        return accumulator;
      }, {});
      return { label: day.label, ...data };
    })
  );

  return (
    <ResponsiveContainer width="98%" height="98%">
      <LineChart
        data={subjectsTrend.map((day, i) => {
          const data = day.data.reduce((accumulator, subject) => {
            if (!filteredTrends.includes(subject.subject_id)) {
              accumulator[subject.subject_id] = subject.value;
            }
            return accumulator;
          }, {});
          return { label: day.label, ...data };
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
        <YAxis
          tickFormatter={(data) => {
            const { value, type } = secondConverter(data);
            return `${value} ${type}`;
          }}
        />
        <Tooltip
          formatter={(data) => {
            const { value, type } = secondConverter(data);
            return `${value} ${type}`;
          }}
        />
        <Legend
          onClick={(e) => {
            if (filteredTrends.includes(e.dataKey)) {
              setFilteredTrends((prev) => {
                return prev.filter((item) => item !== e.dataKey);
              });
            } else {
              setFilteredTrends((prev) => {
                return [...prev, e.dataKey];
              });
            }
          }}
        />
        {subjectsTrend.length
          ? subjectsTrend[0].data.map((subject, i) => {
              return (
                <Line
                  name={subject.name}
                  type="monotone"
                  key={subject.subject_id}
                  dataKey={subject.subject_id}
                  stroke={colorsList[i % colorsList.length]}
                  activeDot={{ r: 8 }}
                />
              );
            })
          : null}
      </LineChart>
    </ResponsiveContainer>
  );
}

export default StudyTrendChart;
