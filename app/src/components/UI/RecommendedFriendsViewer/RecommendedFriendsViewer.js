import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import styles from "./RecommendedFriendsViewer.module.css";
import { faUser } from "@fortawesome/free-solid-svg-icons";

const serverOrigin = process.env.REACT_APP_ORIGIN;

function RecommendedFriendsViewer() {
  return (
    <div className={styles.RecommendedFriendsViewer}>
      <div className={styles.title}>
        Recommended Friends
      </div>
      <ul className={styles.recommendedFriends}>
        <li className={styles.recommendedFriend}>
        <div
                className={styles.profileImg}
                style={{
                  backgroundImage: `url("${serverOrigin}/profile-images/d.jpeg")`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center center',
                  backgroundRepeat: 'no-repeat',
                }}
              ></div>
              <p className={styles.name}>Jason</p>
              <button>
                +
                <FontAwesomeIcon icon={faUser} />
              </button>
        </li>
        <li className={styles.recommendedFriend}>
        <div
                className={styles.profileImg}
                style={{
                  backgroundImage: `url("${serverOrigin}/profile-images/d.jpeg")`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center center',
                  backgroundRepeat: 'no-repeat',
                }}
              ></div>
              <p className={styles.name}>Jason</p>
              <button>
                +
                <FontAwesomeIcon icon={faUser} />
              </button>
        </li>
      </ul>
    </div>
  );
};

export default RecommendedFriendsViewer;