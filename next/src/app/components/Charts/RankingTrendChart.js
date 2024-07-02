import { useRankingUser } from "@/Hooks/rankingHooks";
import { updateRankingTrend } from "@/app/utils/StatTools";
import { DateTime } from "luxon";
import { useEffect, useState } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

function RankingTrendChart({
  viewDate,
  statsViewer,
  setRanking = () => {},
  userInfo,
}) {
  const [rankingsTrend, setRankingsTrend] = useState([]);

  const { data: rankingUserData } = useRankingUser(
    userInfo?.user_id,
    statsViewer,
    viewDate
  );

  useEffect(() => {
    if (!rankingUserData?.success || !statsViewer || !viewDate) return;

    const viewDateTime = DateTime.fromJSDate(viewDate);

    const rankingTrend = updateRankingTrend(
      rankingUserData.rankings,
      statsViewer
    );
    let ranking = 1;
    if (statsViewer === "Daily") {
      ranking = rankingTrend.find(
        (ranking) => ranking.label === viewDateTime.toISODate()
      );
    } else if (statsViewer === "Weekly") {
      ranking = rankingTrend.find(
        (ranking) => ranking.label === viewDateTime.startOf("week").toISODate()
      );
    } else {
      ranking = rankingTrend.find(
        (ranking) => ranking.label === viewDateTime.startOf("month").toISODate()
      );
    }
    if (ranking) {
      setRanking(ranking.ranking);
    }

    setRankingsTrend(rankingTrend);
  }, [rankingUserData, viewDate, statsViewer]);

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart
        data={rankingsTrend}
        margin={{
          top: 5,
          right: 30,
          left: 20,
          bottom: 5,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis
          dataKey="label"
          tickFormatter={(data) => {
            const dateTime = DateTime.fromISO(data);

            return dateTime.toFormat("M/d");
          }}
        />
        <YAxis reversed={true} />
        <Tooltip />
        <Line
          type="monotone"
          dataKey={"ranking"}
          stroke="#8884d8"
          activeDot={{ r: 8 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

export default RankingTrendChart;
