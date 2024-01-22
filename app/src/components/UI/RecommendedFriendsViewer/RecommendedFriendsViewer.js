import { useEffect, useState } from 'react';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import styles from "./RecommendedFriendsViewer.module.css";
import { faUser } from "@fortawesome/free-solid-svg-icons";
import RefreshBtn from '../RefreshBtn/RefreshBtn';
import FriendRequestBtn from '../FriendRequestBtn/FriendRequestBtn';
import CountryViewer from '../CountryViewer/CountryViewer';
import { Link } from 'react-router-dom';

const serverOrigin = process.env.REACT_APP_ORIGIN;

function RecommendedFriendsViewer({setResponse}) {

  const [refresh, setRefresh] = useState(true);
  const [recommendedFriends, setRecommendedFriends] = useState([]);

  useEffect(() => {
    if (!refresh) return;
    fetch(`${serverOrigin}/friend/recommended`, {
      method: "get",
      headers: {
        "Content-Type": "application/json",
      }
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          setRecommendedFriends(data.users);
        }
      });
  }, [refresh]);

  return (
    <div className={styles.RecommendedFriendsViewer}>
      <div className={styles.title}>
        <p>
          Recommended Friends
        </p>
        <RefreshBtn
          refresh={refresh}
          setRefresh={setRefresh}
        />
      </div>
      <div className={styles.recommendedFriends}>
        {recommendedFriends.map((user, i) => {
          const {user_id, name, timezone} = user;
          return (
            <Link 
              to={`${serverOrigin}/dashboard/user/${user_id}`}
            className={styles.recommendedFriend} key={i}>
            <div
              className={styles.profileImg}
              style={{
                backgroundImage: `url("${serverOrigin}/profile-images/${user_id}.jpeg")`,
                backgroundSize: 'cover',
                backgroundPosition: 'center center',
                backgroundRepeat: 'no-repeat',
              }}
            ></div>
            <p className={styles.name}>{name}</p>
            <CountryViewer timezone={timezone} />
            <div className={styles.buttons}>
            <FriendRequestBtn 
              userInfo={user}
              setResponse={setResponse}
              padding={"3px 5px"}
            />
            </div>
          </Link>
          )
        })}
      </div>
    </div>
  );
};

export default RecommendedFriendsViewer;