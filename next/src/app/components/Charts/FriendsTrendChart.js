"use client";

import { SUBJECTS_PIE_COLORS } from "@/app/utils/Constant";
import { secondConverter } from "@/app/utils/Tool";
import { useFriendsTrends } from "@/Hooks/friendsHooks";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import CircularLoading from "../LoadingScreen/CircularLoading/CircularLoading";
import { DateTime } from "luxon";
import AccountWall from "../Others/AccountWall/AccountWall";
import { useAccount } from "@/Hooks/accountHooks";

function FriendsTrendChart() {
  const { accountData } = useAccount();

  const { friendsTrendData, friendsTrendsIsLoading, friendsTrendError } =
    useFriendsTrends();

  if (friendsTrendsIsLoading) {
    return <CircularLoading />;
  }

  if (!accountData) {
    return <AccountWall />;
  }

  if (friendsTrendError) {
    return null;
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        width={500}
        height={300}
        data={friendsTrendData.map((trend) => {
          const date = DateTime.fromSeconds(trend.date).toFormat("M/d");
          const friendsData = { date };

          trend.friends.map((friend) => {
            friendsData[friend.user_id] = friend.study_time;
          });
          return friendsData;
        })}
        /* margin={{
          top: 5,
          right: 30,
          left: -20,
          bottom: 5,
        }} */
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
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
        <Legend />
        {friendsTrendData[0].friends.map((friend, i) => {
          return (
            <Bar
              key={i}
              dataKey={friend.user_id}
              name={friend.name}
              fill={SUBJECTS_PIE_COLORS[i % SUBJECTS_PIE_COLORS.length]}
              barSize={40}
            />
          );
        })}
      </BarChart>
    </ResponsiveContainer>
  );
}

export default FriendsTrendChart;
