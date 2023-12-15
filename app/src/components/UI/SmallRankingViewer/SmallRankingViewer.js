import { useEffect, useState } from "react";
import styles from "./SmallRankingViewer.module.css";

const serverOrigin = process.env.REACT_APP_ORIGIN;

function SmallRankingViewer({ userInfo }) {
  const [rankingDisp, setRankingDisp] = useState(<div className={styles.noStudy}>
    <p>Study to see your today ranking</p>
  </div>);

  useEffect(() => {
    if (!userInfo) return;

    fetch(`${serverOrigin}/api/ranking/today`, {
      method: 'get'
    })
      .then((response) => response.json())
      .then((data) => {
        console.log(data);
        if (data.success) {
          const ranking = data.rankings.findIndex(ranking => {
            return ranking.id === ranking.user.user_id;
          });
          console.log('gd', ranking);
          if (ranking === -1) return;
          const total = data.rankings[ranking].total;
          if (!total) return;
        }
      });
  }, [userInfo]);

  return (
    <div className={styles.SmallRankingViewer}>
      {rankingDisp}
    </div>
  )
};

export default SmallRankingViewer;