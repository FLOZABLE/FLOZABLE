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
import React, { useEffect, useState } from "react";
import { updateSubjectsTrendChart } from "@/app/utils/StatTools";
import { STUDY_TREND_COLORS } from "@/app/utils/Constant";
import { secondConverter } from "@/app/utils/Tool";
import DateSelectorBtn from "../../Buttons/DateSelectorBtn/DateSelectorBtn";
import SubjectsLabels from "../SubjectsLabels/SubjectsLabels";

function StudyTrendChart({
  viewDate,
  setViewDate,
  viewer,
  subjects,
  isDateSelector,
}) {
  const [subjectsTrend, setSubjectsTrend] = useState([]);
  const [filteredSubjects, setFilteredSubjects] = useState([]);

  useEffect(() => {
    if (!subjects || !viewDate || !viewer) return;

    const subjectsTrend = updateSubjectsTrendChart(subjects, viewDate, viewer);
    setSubjectsTrend(subjectsTrend);
  }, [subjects, viewDate, viewer]);

  return (
    <div className={`Box ${styles.StudyTrendChart}`}>
      <div className={`header ${styles.header}`}>
        <p className={styles.name}>Study Trend</p>
        {isDateSelector ? (
          <div className={styles.DateSelectorBtn}>
            <DateSelectorBtn
              viewMode={viewer}
              viewDate={viewDate}
              setViewDate={setViewDate}
            />
          </div>
        ) : null}
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
          data={subjectsTrend}
        >
          <defs>
            {subjects.map((subject, i) => {
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
            })}
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
          {subjects.map((subject, i) => {
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
          })}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export default StudyTrendChart;
