import { useEffect, useState } from "react";
import styles from "./SmallRankingViewer.module.css";
import { Link } from "react-router-dom";
import CountryViewer from "../CountryViewer/CountryViewer";
import { DateTime, Duration } from "luxon";

const serverOrigin = process.env.REACT_APP_ORIGIN;

function SmallRankingViewer({ userInfo }) {
  const [rankingDisp, setRankingDisp] = useState(<div className={styles.noStudy}>
    <p>Study to see your today ranking</p>
  </div>);
  const [threeUsers, setThreeUsers] = useState([]);

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
            return userInfo.user_id === ranking.user.user_id;
          });
          if (ranking === -1) return;
          const total = data.rankings[ranking].total;
          if (!!!total) return;
          const rankingOrder = [];
          for (let i = Math.max(ranking - 1, 0); i < Math.min(ranking + 2, data.rankings.length); i++) {
            console.log(data.rankings[i].user);
            data.rankings[i].order = i;
            rankingOrder.push(data.rankings[i]);
          }
          setThreeUsers([...rankingOrder]);
        }
      });
  }, [userInfo]);


  useEffect(() => {
    setRankingDisp(
      threeUsers.map((ranking, i) => {
        return (
          <div className={styles.miniRanking} key={i}>
            <div className={styles.miniRankingElement}>
              <div className={styles.circle}>
                <p>{ranking.order + 1}</p>
              </div>
            </div>
            <div className={styles.profileImg}
              style={{
                backgroundImage: `url("${serverOrigin}/profile-images/${ranking.user.user_id}.jpeg")`, backgroundSize: 'cover',
                backgroundPosition: 'center center',
                backgroundRepeat: 'no-repeat',
              }}
            ></div>
            <Link to={`/dashboard/user/${ranking.user.user_id}`} className={styles.profileInfo}>
              <p className={styles.name}>{ranking.user.name}</p>
              <CountryViewer timezone={ranking.user.timezone} />
            </Link>
            <div className={styles.ranking}>
              <p>{Duration.fromObject({ seconds: ranking.total }).toFormat("h:mm:ss")}</p>
            </div>
          </div>
        );
      })
    )
  }, [threeUsers]);

  return (
    <div className={styles.SmallRankingViewer}>
      {rankingDisp}
    </div>
  )
};

export default SmallRankingViewer;