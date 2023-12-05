import styles from "./FriendsViewer.module.css";
import { Link } from "react-router-dom";

const serverOrigin = process.env.REACT_APP_ORIGIN;

function FriendsViewer({ friends, setClickedUser }) {
  return (
    <div className={styles.FriendsViewer}>
      {friends.map((friend, i) => {
        const { user_id, name } = friend;
        return (
          <Link to={`/dashboard/user/${user_id}`} onClick={() => { setClickedUser(user_id) }} key={i}>
            <div className={styles.profileWrapper}>
              <div className={styles.profileImg}
                style={{
                  backgroundImage: `url("${serverOrigin}/profile-images/${user_id}.jpeg")`, backgroundSize: 'cover',
                  backgroundPosition: 'center center',
                  backgroundRepeat: 'no-repeat',
                }}
              >
              </div>
              <div className={styles.name}>
                {name}
              </div>
            </div>
          </Link>
        )
      })}
    </div>
  );
};

export default FriendsViewer;