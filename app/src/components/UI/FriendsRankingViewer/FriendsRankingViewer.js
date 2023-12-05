import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import styles from "./FriendsRankingViewer.module.css";
import { faAngleRight } from "@fortawesome/free-solid-svg-icons";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { DateTime } from "luxon";
import CountryViewer from "../CountryViewer/CountryViewer";
import { secondConverter } from "../../../utils/Tool";

const serverOrigin = process.env.REACT_APP_ORIGIN;

function FriendsRankingViewer({userInfo}) {
  const [viewDate, setViewDate] = useState(new Date());
  const [dailyRankingsEl, setDailyRankingsEl] = useState([]);
  const [weeklyRankingsEl, setWeeklyRankingsEl] = useState([]);
  const [monthlyRankingsEl, setMonthlyRankingsEl] = useState([]);

  /* const [daily] */
  const friendsSort = () => {
    const isoDateTime = DateTime.fromJSDate(viewDate, {zone: 'utc'}).toISODate();
    fetch(`${serverOrigin}/api/ranking/friends?date=${isoDateTime}`, {
      method: "get",
      headers: {
        "Content-Type": "application/json",
      }
    })
      .then((response) => response.json())
      .then((data) => {
        const {todayRankings, thisWeekRankings, thisMonthRankings} = data;
        console.log(data);
        setDailyRankingsEl(todayRankings.map((userInfo, i) => {
          const {name, user_id, timezone, dayTotal} = userInfo;
          const {value, type} = secondConverter(dayTotal);
          return (
            <Link to={`/dashboard/user/${user_id}`} className={styles.ranking} key={i}>
              <p className={styles.rank}>#{i + 1}</p>
              <div
                className={styles.profileImg}
                style={{
                  backgroundImage: `url("${serverOrigin}/profile-images/${user_id}.jpeg")`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center center',
                  backgroundRepeat: 'no-repeat',
                }}
              ></div>
              <div className={styles.name}>{name}</div>
              <div className={styles.countryWrapper}>
              <CountryViewer timezone={timezone}/>
              </div>
              <div className={styles.time}>{value}{type}</div>
            </Link>
          );
        }));

        setWeeklyRankingsEl(thisWeekRankings.map((userInfo, i) => {
          const {name, user_id, timezone, weekTotal} = userInfo;
          const {value, type} = secondConverter(weekTotal);
          return (
            <Link to={`/dashboard/user/${user_id}`} className={styles.ranking} key={i}>
              <p className={styles.rank}>#{i + 1}</p>
              <div
                className={styles.profileImg}
                style={{
                  backgroundImage: `url("${serverOrigin}/profile-images/${user_id}.jpeg")`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center center',
                  backgroundRepeat: 'no-repeat',
                }}
              ></div>
              <div className={styles.name}>{name}</div>
              <div className={styles.countryWrapper}>
              <CountryViewer timezone={timezone}/>
              </div>
              <div className={styles.time}>{value}{type}</div>
            </Link>
          );
        }));

        setMonthlyRankingsEl(thisMonthRankings.map((userInfo, i) => {
          const {name, user_id, timezone, monthTotal} = userInfo;
          const {value, type} = secondConverter(monthTotal);
          return (
            <Link to={`/dashboard/user/${user_id}`} className={styles.ranking} key={i}>
              <p className={styles.rank}>#{i + 1}</p>
              <div
                className={styles.profileImg}
                style={{
                  backgroundImage: `url("${serverOrigin}/profile-images/${user_id}.jpeg")`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center center',
                  backgroundRepeat: 'no-repeat',
                }}
              ></div>
              <div className={styles.name}>{name}</div>
              <div className={styles.countryWrapper}>
              <CountryViewer timezone={timezone}/>
              </div>
              <div className={styles.time}>{value}{type}</div>
            </Link>
          );
        }));

      })
      .catch((error) => console.error(error));
  };

  useEffect(() => {
    friendsSort();
  }, [viewDate]);

  return (
    <div className={styles.FriendsRankingViewer}>
      <div className={styles.title}>
        Top Friends
      </div>
      <div className={styles.boxContainer}>
        <div className={styles.box}>
          <div className={styles.header}>
            <p>Today</p>
            <i>
              <FontAwesomeIcon icon={faAngleRight} />
            </i>
          </div>
          <div className={styles.rankings}>
            {dailyRankingsEl}
          </div>
        </div>
        <div className={styles.box}>
          <div className={styles.header}>
            <p>This Week</p>
            <i>
              <FontAwesomeIcon icon={faAngleRight} />
            </i>
          </div>
          <div className={styles.rankings}>
            {weeklyRankingsEl}
          </div>
        </div>
        <div className={styles.box}>
          <div className={styles.header}>
            <p>This Month</p>
            <i>
              <FontAwesomeIcon icon={faAngleRight} />
            </i>
          </div>
          <div className={styles.rankings}>
            {monthlyRankingsEl}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FriendsRankingViewer;