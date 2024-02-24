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
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCaretRight } from "@fortawesome/free-solid-svg-icons";

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

  return (
    <div className={styles.FriendsActivityViewer}>
      {
        friends.map((friend, i) => {
          const { user_id, timezone, name, totalTime, activeSubject } = friend;
          console.log('friend', friend)

          let liveTotal = parseInt(totalTime);
          if (activeSubject && activeSubject.id) {
            liveTotal += DateTime.now().toSeconds().toFixed() - activeSubject.time;
          };

          return (
            <div
              className={styles.friend} key={i}
            >
              <Link
                className={styles.profile}
              >
                <div className={styles.profileImg}
                  style={{
                    backgroundImage: `url("${serverOrigin}/profile-images/{user_id}.jpeg")`, backgroundSize: 'cover',
                    backgroundPosition: 'center center',
                    backgroundRepeat: 'no-repeat',
                  }}
                >
                </div>
                <div>{name}</div>
                <i>
                  <CountryViewer timezone={timezone} />
                </i>
              </Link>
              <i>
                <FontAwesomeIcon icon={faCaretRight} />
              </i>
              <div className={styles.activeInfo}>
                {/* {
                  id ?
                    <div>
                      <div>
                        Studying <strong>sdfsdf</strong> for 0:00:00
                      </div>
                      <div>
                        since 12:00 am
                      </div>
                    </div> :
                  null
                } */}
                <UserSubjectViewer
                  userInfo={friend}
                />
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
            </div>
          )
        })
      }
    </div>
  )
};

export default FriendsActivityViewer;