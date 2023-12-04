import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import styles from "./FriendsRankingViewer.module.css";
import { faAngleRight } from "@fortawesome/free-solid-svg-icons";
import { Link } from "react-router-dom";

const serverOrigin = process.env.REACT_APP_ORIGIN;

function FriendsRankingViewer({ }) {
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