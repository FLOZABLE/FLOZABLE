"use client";

import styles from "./StudyTrendChart.module.css";
import {
  CartesianGrid,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  AreaChart,
  Area,
} from "recharts";
import React, { useContext, useEffect, useState } from "react";
import { updateSubjectsTrendChart } from "@/app/utils/StatTools";
import { STUDY_TREND_COLORS } from "@/app/utils/Constant";
import { secondConverter } from "@/app/utils/Tool";
import { SubjectsContext } from "@/app/utils/Contexts";
import DateSelectorBtn from "../../Buttons/DateSelectorBtn/DateSelectorBtn";
import SubjectsLabels from "../SubjectsLabels/SubjectsLabels";

function StudyTrendChart({
  viewDate,
  setViewDate,
  viewer = "day",
  subjectsProp,
}) {
  const { subjects } = useContext(SubjectsContext);

  const [subjectsTrend, setSubjectsTrend] = useState([]);
  const [filteredSubjects, setFilteredSubjects] = useState([]);

  useEffect(() => {
    if (!subjects || !viewDate || !viewer) return;

    if (!subjectsProp) {
      const subjectsTrend = updateSubjectsTrendChart(
        subjects,
        viewDate,
        viewer
      );
      setSubjectsTrend(subjectsTrend);
    } else {
      const subjectsTrend = updateSubjectsTrendChart(
        subjectsProp,
        viewDate,
        viewer
      );
      setSubjectsTrend(subjectsTrend);
    }
  }, [subjects, viewDate, viewer, subjectsProp]);

  return (
    <div className={`Box ${styles.StudyTrendChart}`}>
      <div className={`header ${styles.header}`}>
        <p className={styles.name}>Study Time</p>
        <DateSelectorBtn
          viewMode={viewer}
          viewDate={viewDate}
          setViewDate={setViewDate}
        />
      </div>
      <div className={`customScroll ${styles.subjectsLabels}`}>
        <SubjectsLabels
          subjects={subjects}
          filteredSubjects={filteredSubjects}
          setFilteredSubjects={setFilteredSubjects}
        />
      </div>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          margin={{
            right: 20,
          }}
          data={subjectsTrend.map((day, i) => {
            const data = day.data.reduce((accumulator, subject) => {
              if (!filteredSubjects.includes(subject.subject_id)) {
                accumulator[subject.subject_id] = subject.value;
              }
              return accumulator;
            }, {});
            return { label: day.label, ...data };
          })}
        >
          <defs>
            {subjectsTrend.length
              ? subjectsTrend[0].data.map((subject, i) => {
                  return (
                    <linearGradient
                      key={i}
                      id={subject.subject_id}
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="5%"
                        stopColor={
                          STUDY_TREND_COLORS[i % STUDY_TREND_COLORS.length]
                        }
                        stopOpacity={0.8}
                      />
                      <stop
                        offset="70%"
                        stopColor={
                          STUDY_TREND_COLORS[i % STUDY_TREND_COLORS.length]
                        }
                        stopOpacity={0}
                      />
                    </linearGradient>
                  );
                })
              : null}
          </defs>
          <CartesianGrid vertical={false} />
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
          {subjectsTrend.length
            ? subjectsTrend[0].data.map((subject, i) => {
                return (
                  <Area
                    name={subject.name}
                    type="monotone"
                    key={subject.subject_id}
                    dataKey={subject.subject_id}
                    stroke={STUDY_TREND_COLORS[i % STUDY_TREND_COLORS.length]}
                    activeDot={{ r: 8 }}
                    fill={`url(#${subject.subject_id})`}
                  />
                );
              })
            : null}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export default StudyTrendChart;
