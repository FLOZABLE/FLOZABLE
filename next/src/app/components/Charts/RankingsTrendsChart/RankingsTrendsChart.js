import styles from "./RankingsTrendsChart.module.css";
import { useGetRankingsUser } from "@/Hooks/rankingsHooks";
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
  userInfo,
  isDateSelector,
}) {
  const [rankingsTrend, setRankingsTrend] = useState([]);

  const { data: rankingUserData } = useGetRankingsUser(
    userInfo?.user_id,
    viewer,
    viewDate
  );

  useEffect(() => {
    if (!rankingUserData?.success || !viewer || !viewDate) return;

    const rankingTrend = updateRankingTrend(
      rankingUserData.rankings,
      rankingUserData.maxLength
    );

    setRankingsTrend(rankingTrend);
  }, [rankingUserData, viewDate, viewer]);

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
      {!userInfo?.user_id ? (
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
