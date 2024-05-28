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
import React, { useContext, useEffect, useState } from "react";
import { SubjectsContext } from "@/app/utils/Contexts";
import { updateSubjectsTrendChart } from "@/app/utils/StatTools";
import { colorsList } from "@/app/utils/Constant";
import { secondConverter } from "@/app/utils/Tool";
import EditSubjectBtn from "../../Buttons/EditSubjectBtn/EditSubjectBtn";
import styles from "./StudyTrendChart.module.css";

function StudyTrendChart({ viewDate, statsViewer = "Daily", subjectsProp }) {
  const { subjects } = useContext(SubjectsContext);

  const [subjectsTrend, setSubjectsTrend] = useState([]);
  const [filteredTrends, setFilteredTrends] = useState([]);

  useEffect(() => {
    if (!subjects || !viewDate || !statsViewer) return;

    if (!subjectsProp) {
      const { daily } = subjects;

      if (!daily) return;

      const change =
        statsViewer === "Monthly"
          ? "months"
          : statsViewer === "Weekly"
          ? "weeks"
          : "days";
      const subjectsTrend = updateSubjectsTrendChart(
        subjects,
        viewDate,
        statsViewer,
        change
      );
      setSubjectsTrend(subjectsTrend);
    } else {
      const { daily } = subjectsProp;

      if (!daily) return;

      const change =
        statsViewer === "Monthly"
          ? "months"
          : statsViewer === "Weekly"
          ? "weeks"
          : "days";
      const subjectsTrend = updateSubjectsTrendChart(
        subjectsProp,
        viewDate,
        statsViewer,
        change
      );
      setSubjectsTrend(subjectsTrend);
    }
    console.log(subjectsTrend);
  }, [subjects, viewDate, statsViewer, subjectsProp]);

  return (
    <>
      <div className={styles.editSubjectWrapper}>
        <EditSubjectBtn />
      </div>
      <ResponsiveContainer width="98%" height="98%">
        <LineChart
          data={subjectsTrend.map((day, i) => {
            const data = day.data.reduce((accumulator, subject) => {
              if (!filteredTrends.includes(subject.info.id)) {
                accumulator[subject.info.id] = subject.value;
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
                    name={subject.info.name}
                    type="monotone"
                    key={subject.info.id}
                    dataKey={subject.info.id}
                    stroke={colorsList[i % colorsList.length]}
                    activeDot={{ r: 8 }}
                  />
                );
              })
            : null}
        </LineChart>
      </ResponsiveContainer>
    </>
  );
}

export default StudyTrendChart;
