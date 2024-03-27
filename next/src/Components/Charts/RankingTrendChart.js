import { UserInfoContext } from "@/utils/Contexts";
import { updateRankingTrend } from "@/utils/StatTools";
import config from "@/utils/config";
import { DateTime } from "luxon";
import { useContext, useEffect, useState } from "react";
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

function RankingTrend({ viewDate, statsViewer, setRanking }) {
  const {userInfo} = useContext(UserInfoContext);

  const [rankingsTrend, setRankingsTrend] = useState([]);

  useEffect(() => {
    if (!viewDate || !statsViewer || !userInfo) return;

    const { user_id } = userInfo;
    const viewDateTime = DateTime.fromJSDate(viewDate);
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    fetch(`${config.server}/ranking/user?userId=${user_id}&mode=${statsViewer.toLowerCase()}&date=${viewDateTime.toISODate()}&timezone=${timezone}`, {
      method: 'get'
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          const rankingTrend = updateRankingTrend(data.rankings, statsViewer);
          let ranking = 1;
          if (statsViewer === "Daily") {
            ranking = rankingTrend.find(ranking => ranking.label === viewDateTime.toISODate());
          } else if (statsViewer === "Weekly") {
            ranking = rankingTrend.find(ranking => ranking.label === viewDateTime.startOf('week').toISODate());
          } else {
            ranking = rankingTrend.find(ranking => ranking.label === viewDateTime.startOf('month').toISODate());
          };
          if (ranking) {
            setRanking(ranking.ranking);
          }

          setRankingsTrend(rankingTrend);
        };
      })
      .catch((error) => console.error(error));
  }, [viewDate, statsViewer, userInfo]);

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
  )
};

export default RankingTrend;