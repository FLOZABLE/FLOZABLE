import React, { useEffect, useState } from "react";
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

    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    
    fetch(`${serverOrigin}/ranking/sort?mode=Daily&date=${DateTime.now().toISODate()}&timezone=${timezone}`, {
      method: 'get',
      headers: {
        'Content-Type': 'application/json'
      },
    })
      .then((response) => response.json())
      .then((response) => {
        if (response.success) {
          const ranking = response.data.findIndex(ranking => {
            return userInfo.user_id === ranking.user_id;
          });
          if (ranking === -1) return;
          const total = response.data[ranking].t;
          if (!total) return;
          setSelfUser(response.data[ranking]);
          const rankingOrder = [];
          const maxAbove = Math.min(1, ranking);
          const maxBelow = 2 - maxAbove;
          for (let i = ranking - maxAbove; i <= Math.min(ranking + maxBelow, response.data.length); i++) {
            if (!response.data[i]) break;
            response.data[i].order = i;
            rankingOrder.push(response.data[i]);
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
        if (ranking.user_id != selfUser.user_id) {
          const secondsDifference = ranking.t - selfUser.t;
          differenceEl = (
            <p className={secondsDifference > 0 ? styles.differenceGreen : styles.differenceRed}> ({secondsDifference > 0 ? "+" : "-"}{durationFormatter(Math.abs(secondsDifference))})</p>
          )
        }
        return (
          <Link
            to={`/dashboard/user/${ranking.user_id}`}
            className={styles.ranking} key={i}>
            <div className={styles.rank}>
              {ranking.order + 1}
            </div>
            <div className={styles.profileImg}
              style={{
                backgroundImage: `url("${serverOrigin}/profile-images/${ranking.user_id}.jpeg")`, backgroundSize: 'cover',
                backgroundPosition: 'center center',
                backgroundRepeat: 'no-repeat',
              }}
            ></div>
            <div className={styles.name}>
              {ranking.name}
            </div>
            <div className={styles.timezoneWrapper}>
              <CountryViewer timezone={ranking.timezone} />
            </div>
            <div className={styles.compare}>
              <p>{durationFormatter(ranking.t)}</p>
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