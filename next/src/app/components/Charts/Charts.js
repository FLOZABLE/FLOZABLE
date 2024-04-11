import React from 'react';

const RADIAN = Math.PI / 180;
const pieCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }) => {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.35;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" pointerEvents="none" >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

const PieCustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{ 
        backgroundColor: "#fff", 
        padding: "0.375rem 0.625rem", 
        borderRadius: "0.625rem",
        boxShadow: "rgba(149, 157, 165, 0.2) 0em 0.5rem 1.5rem",
      }}>
        <p className="label">{`${payload[0].name} : ${payload[0].payload.labelVal}`}</p>
      </div>
    );
  }

  return null;
};

export {
  pieCustomLabel,
  PieCustomTooltip
};