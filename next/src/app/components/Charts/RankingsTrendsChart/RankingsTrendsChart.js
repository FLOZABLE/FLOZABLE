import styles from "./RankingsTrendsChart.module.css";
import { useRankingsUser } from "@/Hooks/rankingsHooks";
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
import DateSelectorBtn from "../../Buttons/DateSelectorBtn/DateSelectorBtn";
import AccountWall from "../../Others/AccountWall/AccountWall";

function RankingsTrendsChart({
  viewDate,
  setViewDate,
  viewer,
  userId,
  isDateSelector,
}) {
  const [rankingsTrend, setRankingsTrend] = useState([]);

  const { rankingsUserData } = useRankingsUser(userId, viewer, viewDate);

  useEffect(() => {
    if (!rankingsUserData?.success || !viewer || !viewDate) return;

    const rankingTrend = updateRankingTrend(
      rankingsUserData.data.rankings,
      rankingsUserData.data.max_length
    );

    setRankingsTrend(rankingTrend);
  }, [rankingsUserData, viewDate, viewer]);

  return (
    <div className={`Box ${styles.RankingsTrendsChart}`}>
      <div className={`header ${styles.header}`}>
        <p className={styles.name}>Ranking Trend</p>
        {isDateSelector ? (
          <div className={styles.DateSelectorBtn}>
            <DateSelectorBtn
              viewer={viewer}
              viewDate={viewDate}
              setViewDate={setViewDate}
            />
          </div>
        ) : null}
      </div>
      {!userId ? (
        <AccountWall />
      ) : (
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={rankingsTrend}>
            <CartesianGrid vertical={false} />
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
      )}
    </div>
  );
}

export default RankingsTrendsChart;
