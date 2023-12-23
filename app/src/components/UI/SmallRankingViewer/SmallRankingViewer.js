import { useEffect, useState } from "react";
import styles from "./SmallRankingViewer.module.css";
import { Link } from "react-router-dom";
import CountryViewer from "../CountryViewer/CountryViewer";
import { DateTime, Duration } from "luxon";
import { durationFormatter } from "../../../utils/Tool";

const serverOrigin = process.env.REACT_APP_ORIGIN;

function SmallRankingViewer({ userInfo }) {
  const [rankingDisp, setRankingDisp] = useState(<div className={styles.noStudy}>
    <p><Link
      to="/dashboard/study"
    >Study</Link> to see your today's ranking</p>
  </div>);
  const [threeUsers, setThreeUsers] = useState([]);
  const [selfUser, setSelfUser] = useState([]);

  useEffect(() => {
    if (!userInfo) return;

    fetch(`${serverOrigin}/api/ranking/today`, {
      method: 'get'
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          const ranking = data.rankings.findIndex(ranking => {
            return userInfo.user_id === ranking.user.user_id;
          });
          if (ranking === -1) return;
          const total = data.rankings[ranking].total;
          if (!!!total) return;
          setSelfUser(data.rankings[ranking]);
          const rankingOrder = [];
          const maxAbove = Math.min(1, ranking);
          const maxBelow = 2 - maxAbove;
          for (let i = ranking - maxAbove; i <= Math.min(ranking + maxBelow, data.rankings.length); i++) {
            if (!data.rankings[i]) break;
            data.rankings[i].order = i;
            rankingOrder.push(data.rankings[i]);
          }
          setThreeUsers([...rankingOrder]);
        }
      });
  }, [userInfo]);


  useEffect(() => {
    if (!selfUser || !threeUsers || !threeUsers.length) return;

    setRankingDisp(
      threeUsers.map((ranking, i) => {
        let differenceEl = <p>(You)</p>
        if (ranking.user.user_id != selfUser.user.user_id) {
          const secondsDifference = ranking.total - selfUser.total;
          differenceEl = (
            <p className={secondsDifference > 0 ? styles.differenceGreen : styles.differenceRed}> ({secondsDifference > 0 ? "+" : "-"}{durationFormatter(Math.abs(secondsDifference))})</p>
          )
        }
        return (
          <Link
            to={`/dashboard/user/${ranking.user.user_id}`}
            className={styles.ranking} key={i}>
            <div className={styles.rank}>
              {ranking.order + 1}
            </div>
            <div className={styles.profileImg}
              style={{
                backgroundImage: `url("${serverOrigin}/profile-images/${ranking.user.user_id}.jpeg")`, backgroundSize: 'cover',
                backgroundPosition: 'center center',
                backgroundRepeat: 'no-repeat',
              }}
            ></div>
            <div className={styles.name}>
              {ranking.user.name}
            </div>
            <div className={styles.timezoneWrapper}>
              <CountryViewer timezone={ranking.user.timezone} />
            </div>
            <div className={styles.compare}>
              <p>{durationFormatter(ranking.total)}</p>
              {differenceEl}
            </div>
          </Link>
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