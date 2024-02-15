import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import styles from "./FriendsActivityViewer.module.css";
import CountryViewer from "../CountryViewer/CountryViewer";
import DmBtn from "../DmBtn/DmBtn";
import ChallengeBtn from "../ChallengeBtn/ChallengeBtn";
import MemberTimer from "../MemberTimer/MemberTimer";
import UserSubjectViewer from "../UserSubjectViewer/UserSubjectViewer";
import { DateTime } from "luxon";
import UserGroupViewer from "../UserGroupViewer/UserGroupViewer";

const serverOrigin = process.env.REACT_APP_ORIGIN;

//mode 0 is for friends page's component, mode 1 is for main page's component
function FriendsActivityViewer({ setResponse, userInfo, setJoinTarget, mode = 1, setCount, searchQuery, myGroups, setMyGroups, setOtherGroups }) {
  const [friendsEl, setFriendsEl] = useState([]);
  const [friends, setFriends] = useState([]);

  useEffect(() => {
    fetch(`${serverOrigin}/friend/status`, {
      method: "get",
      headers: {
        'Content-Type': 'application/json'
      },
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          setFriends(data.friendsInfo);
          setCount(data.friendsInfo.length)
        };
      })
      .catch((error) => console.error(error));
  }, []);

  useEffect(() => {
    if (!userInfo) return;
    let totalSearched = 0;
    setFriendsEl(friends.map((friend, i) => {
      const { user_id, timezone, name, totalTime, activeSubject } = friend;
      const { time, id } = activeSubject;
      let liveTotal = parseInt(totalTime);
      if (id) {
        liveTotal += DateTime.now().toSeconds().toFixed() - time;
      };
      const searched = !searchQuery || name.includes(searchQuery);
      if (searched) {
        totalSearched += 1;
      };

      return (
        <div
          className={`${styles.friend} ${searched  ? styles.searched : ''}`} key={i}
          >
          <Link
            to={`/dashboard/user/${user_id}`}
            className={styles.userInfo}>
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
              myGroups={myGroups}
              setMyGroups={setMyGroups}
              setOtherGroups={setOtherGroups}
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
            <div className={`${styles.buttonsWrapper} ${!mode ? styles.hidden : ''}`}>
              <div className={styles.requestBtn}>
                <ChallengeBtn userInfo={friend}
                  setResponse={setResponse}
                />
              </div>
              <div className={styles.requestBtn}>
                <DmBtn userInfo={friend}
                  setResponse={setResponse}
                />
              </div>
            </div>
          </div>
        </div>
      )
    }));
    setCount(totalSearched);
  }, [friends, userInfo, searchQuery]);

  return (
    <div className={styles.FriendsActivityViewer}>
      {friendsEl}
    </div>
  )
};

export default FriendsActivityViewer;