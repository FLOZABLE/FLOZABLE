const RADIAN = Math.PI / 180;
const pieCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }) => {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central">
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

const PieCustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    console.log(payload[0].payload)
    return (
      <div style={{ 
        backgroundColor: "#fff", 
        padding: "6px 10px", 
        borderRadius: "10px",
        boxShadow: "rgba(149, 157, 165, 0.2) 0px 8px 24px"
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