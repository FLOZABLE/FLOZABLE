import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import styles from "./FriendsRankingViewer.module.css";
import { faAngleRight } from "@fortawesome/free-solid-svg-icons";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { DateTime } from "luxon";

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
        const {dailyRankings, weeklyRankings, monthlyRankings} = data;
        console.log(data);
        setDailyRankingsEl(dailyRankings[0].ranking.map((userInfo, i) => {
          const {name, user_id} = userInfo;
          return (
            <Link to={`/dashboard/user/{fromId}`} className={styles.ranking}>
              <p className={styles.rank}>#1</p>
              <div
                className={styles.profileImg}
                style={{
                  backgroundImage: `url("${serverOrigin}/profile-images/d.jpeg")`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center center',
                  backgroundRepeat: 'no-repeat',
                }}
              ></div>
              <div className={styles.name}>gd</div>
              <div className={styles.time}>1.4hr</div>
            </Link>
          );
        }));

        setWeeklyRankingsEl(weeklyRankings[0].ranking.map((userInfo, i) => {
          const {name, user_id} = userInfo;
          return (
            <Link to={`/dashboard/user/{fromId}`} className={styles.ranking} key={i}>
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
            <div className={styles.time}>1.4hr</div>
          </Link>
          );
        }));

        setMonthlyRankingsEl(monthlyRankings[0].ranking.map((userInfo, i) => {
          const {name, user_id} = userInfo;
          return (
            <Link to={`/dashboard/user/{fromId}`} className={styles.ranking} key={i}>
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
            <div className={styles.time}>1.4hr</div>
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
            <p>Day</p>
            <i>
              <FontAwesomeIcon icon={faAngleRight} />
            </i>
          </div>
          <div className={styles.rankings}>
            <Link to={`/dashboard/user/{fromId}`} className={styles.ranking}>
              <p className={styles.rank}>#1</p>
              <div
                className={styles.profileImg}
                style={{
                  backgroundImage: `url("${serverOrigin}/profile-images/d.jpeg")`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center center',
                  backgroundRepeat: 'no-repeat',
                }}
              ></div>
              <div className={styles.name}>gd</div>
              <div className={styles.time}>1.4hr</div>
            </Link>
            <Link to={`/dashboard/user/{fromId}`} className={styles.ranking}>
              <p className={styles.rank}>#1</p>
              <div
                className={styles.profileImg}
                style={{
                  backgroundImage: `url("${serverOrigin}/profile-images/d.jpeg")`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center center',
                  backgroundRepeat: 'no-repeat',
                }}
              ></div>
              <div className={styles.name}>gd</div>
              <div className={styles.time}>1.4hr</div>
            </Link>
            <Link to={`/dashboard/user/{fromId}`} className={styles.ranking}>
              <p className={styles.rank}>#1</p>
              <div
                className={styles.profileImg}
                style={{
                  backgroundImage: `url("${serverOrigin}/profile-images/d.jpeg")`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center center',
                  backgroundRepeat: 'no-repeat',
                }}
              ></div>
              <div className={styles.name}>gd</div>
              <div className={styles.time}>1.4hr</div>
            </Link>
          </div>
        </div>
        <div className={styles.box}>
          <div className={styles.header}>
            <p>Day</p>
            <i>
              <FontAwesomeIcon icon={faAngleRight} />
            </i>
          </div>
          <ul className={styles.rankings}>
            <li className={styles.ranking}>
              <Link to={`/dashboard/user/{fromId}`} className={styles.profileImg}
                style={{
                  backgroundImage: `url("${serverOrigin}/profile-images/d.jpeg")`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center center',
                  backgroundRepeat: 'no-repeat',
                }}>
              </Link>
              <div className={styles.name}>gd</div>
              <div className={styles.time}>1.4hr</div>
            </li>
          </ul>
        </div>
        <div className={styles.box}>
          <div className={styles.header}>
            <p>Day</p>
            <i>
              <FontAwesomeIcon icon={faAngleRight} />
            </i>
          </div>
          <ul className={styles.rankings}>
            <li className={styles.ranking}>
              <Link to={`/dashboard/user/{fromId}`} className={styles.profileImg}
                style={{
                  backgroundImage: `url("${serverOrigin}/profile-images/d.jpeg")`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center center',
                  backgroundRepeat: 'no-repeat',
                }}>
              </Link>
              <div className={styles.name}>gd</div>
              <div className={styles.time}>1.4hr</div>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default FriendsRankingViewer;