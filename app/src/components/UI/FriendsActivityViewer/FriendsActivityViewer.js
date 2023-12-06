import {useState, useEffect} from "react";
import { Link } from "react-router-dom";
import styles from "./FriendsActivityViewer.module.css";
import CountryViewer from "../CountryViewer/CountryViewer";
import { Punch } from "../../../utils/svgs";
import DmBtn from "../DmBtn/DmBtn";
import ChallengeBtn from "../ChallengeBtn/ChallengeBtn";
import MemberTimer from "../MemberTimer/MemberTimer";
import UserSubjectViewer from "../UserSubjectViewer/UserSubjectViewer";

const serverOrigin = process.env.REACT_APP_ORIGIN;

function FriendsActivityViewer({setResponse}) {
  const [friendsEl, setFriendsEl] = useState([]);
  const [friends, setFriends] = useState([]);
  useEffect(() => {
    fetch(`${serverOrigin}/api/friend/status`, {
      method: "get",
      headers: {
        'Content-Type': 'application/json'
      },
    })
      .then((response) => response.json())
      .then((data) => {
        console.log(data);
        if (data.success) {
          setFriends(data.friendsInfo);
        };
      })
      .catch((error) => console.error(error));
  }, []);

  useEffect(() => {
    setFriendsEl(friends.map((friend) => {
      const {user_id, timezone, name} = friend;
      return (
        <Link 
          to={`/dashboard/user/${user_id}`}
        className={styles.friend} key={user_id}>
        <div className={styles.userInfo}>
        <div className={styles.profileImg}
          style={{
            backgroundImage: `url("${serverOrigin}/profile-images/{user_id}.jpeg")`, backgroundSize: 'cover',
            backgroundPosition: 'center center',
            backgroundRepeat: 'no-repeat',
          }}
        >
        </div>
        <div className={styles.name}>
          {name}
        </div>
        <div className={styles.flagWrapper}>
          <CountryViewer timezone={timezone}/>
        </div>
        </div>
        <div className={styles.subject}>
          <UserSubjectViewer userInfo={friend} />
        </div>
        <div className={styles.group}>
          <p>inside <strong>Math club</strong></p> 
        </div>
        <div className={styles.buttons}>
          <ChallengeBtn userInfo={friend} />
          <DmBtn userInfo={friend} />
        </div>
      </Link>
      )
    }))
  }, [friends]);

  return (
    <div className={styles.FriendsActivityViewer}>

      {friendsEl}
    </div>
  )
};

export default FriendsActivityViewer;