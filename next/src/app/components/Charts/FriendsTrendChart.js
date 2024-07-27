import { coldColorsList, colorsList } from "@/app/utils/Constant";
import { secondConverter } from "@/app/utils/Tool";
import { useGetFriendsTrends } from "@/Hooks/friendsHooks";
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

function FriendsTrendChart() {
  const { data: getFriendsTrendsData, isLoading: getFriendsTrendsIsLoading } =
    useGetFriendsTrends();

    console.log(getFriendsTrendsData)

  return (
    <>
      {getFriendsTrendsIsLoading || !getFriendsTrendsData?.success ? (
        <CircularLoading />
      ) : (
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            width={500}
            height={300}
            data={getFriendsTrendsData.trends.map((trend) => {
              const date = DateTime.fromSeconds(trend.date).toFormat("M/d");
              const friendsData = { date };

              trend.friends.map((friend) => {
                friendsData[friend.user_id] = friend.study_time;
              });
              return friendsData;
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
            {getFriendsTrendsData.trends[0].friends.map((friend, i) => {
              return (
                <Bar
                  key={i}
                  dataKey={friend.user_id}
                  name={friend.name}
                  fill={coldColorsList[i % coldColorsList.length]}
                />
              );
            })}
          </BarChart>
        </ResponsiveContainer>
      )}
    </>
  );
}

export default FriendsTrendChart;
