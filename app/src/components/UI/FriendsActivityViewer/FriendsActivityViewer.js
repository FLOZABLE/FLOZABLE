import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import styles from "./FriendsActivityViewer.module.css";
import CountryViewer from "../CountryViewer/CountryViewer";
import { Punch } from "../../../utils/svgs";
import DmBtn from "../DmBtn/DmBtn";
import ChallengeBtn from "../ChallengeBtn/ChallengeBtn";
import MemberTimer from "../MemberTimer/MemberTimer";
import UserSubjectViewer from "../UserSubjectViewer/UserSubjectViewer";
import { DateTime } from "luxon";
import UserGroupViewer from "../UserGroupViewer/UserGroupViewer";

const serverOrigin = process.env.REACT_APP_ORIGIN;

function FriendsActivityViewer({ setResponse, userInfo, setJoinTarget }) {
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
    if (!userInfo) return;

    setFriendsEl(friends.map((friend) => {
      const { user_id, timezone, name, totalTime, activeSubject } = friend;
      const { time, id } = activeSubject;
      let liveTotal = parseInt(totalTime);
      if (id) {
        liveTotal += DateTime.now().toSeconds().toFixed() - time;
      };
      return (
        <div
          className={styles.friend} key={user_id}>
          <Link
            to={`/dashboard/user/${user_id}`}
            className={styles.userInfo}>
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
              <CountryViewer timezone={timezone} />
            </div>
          </Link>
          <div className={styles.subject}>
            <UserSubjectViewer
              userInfo={friend}
              setResponse={setResponse}
            />
          </div>
          <div className={styles.group}>
            <UserGroupViewer
              userInfo={friend}
              myInfo={userInfo}
              setResponse={setResponse}
              setJoinTarget={setJoinTarget}
            />
          </div>
          <div className={styles.right}>
            <div className={styles.today}>
              <p>Today: </p>
              <p>&nbsp;</p>
              <MemberTimer
                userInfo={friend}
                initialStatus={id ? true : false}
                initialSec={liveTotal}
                setResponse={setResponse}
              />
            </div>
            <ChallengeBtn userInfo={friend}
              setResponse={setResponse}
            />
            <DmBtn userInfo={friend}
              setResponse={setResponse}
            />
          </div>
        </div>
      )
    }))
  }, [friends, userInfo]);

  return (
    <div className={styles.FriendsActivityViewer}>
      {friendsEl}
    </div>
  )
};

export default FriendsActivityViewer;