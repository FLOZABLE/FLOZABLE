import { useEffect, useState } from 'react';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import styles from "./RecommendedFriendsViewer.module.css";
import { faUser } from "@fortawesome/free-solid-svg-icons";
import RefreshBtn from '../RefreshBtn/RefreshBtn';
import FriendRequestBtn from '../FriendRequestBtn/FriendRequestBtn';

const serverOrigin = process.env.REACT_APP_ORIGIN;

function RecommendedFriendsViewer({setResponse}) {

  const [refresh, setRefresh] = useState(true);
  const [recommendedFriends, setRecommendedFriends] = useState([]);

  useEffect(() => {
    if (!refresh) return;
    fetch(`${serverOrigin}/api/friend/recommended`, {
      method: "get",
      headers: {
        "Content-Type": "application/json",
      }
    })
      .then((response) => response.json())
      .then((data) => {
        console.log(data);
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
      <ul className={styles.recommendedFriends}>
        {recommendedFriends.map((user, i) => {
          const {user_id, name} = user;
          return (
            <li className={styles.recommendedFriend} key={i}>
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
            <FriendRequestBtn 
              userInfo={user}
              setResponse={setResponse}
            />
          </li>
          )
        })}
      </ul>
    </div>
  );
};

export default RecommendedFriendsViewer;