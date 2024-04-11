import { secondConverter } from "@/app/utils/Tool";
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

function FriendsTrendChart({friendsTrends}) {
  
  return (
    <ResponsiveContainer width="100%" height="100%">
    <BarChart
      width={500}
      height={300}
      data={friendsTrends.map(dayVal => {
        const friendsData = {};
        Object.keys(dayVal.friends).map((friend) => {
          friendsData[friend] = dayVal.friends[friend].t
        });
        return { ...friendsData, ...dayVal };
      })}
      margin={{
        top: 5,
        right: 30,
        left: 20,
        bottom: 5,
      }}
    >
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="date" />
      <YAxis tickFormatter={(data) => {
        const { value, type } = secondConverter(data);
        return `${value} ${type}`
      }} />
      <Tooltip formatter={(data) => {
        const { value, type } = secondConverter(data);
        return `${value} ${type}`
      }} />
      <Legend />
      {friendsTrends.length ? Object.keys(friendsTrends[0].friends).map((friend, i) => {
        return (
          <Bar name={friendsTrends[0].friends[friend].name} key={i} dataKey={friend} fill="#8884d8" />
        )
      }) : null}
    </BarChart>
  </ResponsiveContainer>
  )
};

export default FriendsTrendChart;