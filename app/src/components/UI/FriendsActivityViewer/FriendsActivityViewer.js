import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import styles from "./FriendsActivityViewer.module.css";
import CountryViewer from "../CountryViewer/CountryViewer";
import UserSubjectViewer from "../UserSubjectViewer/UserSubjectViewer";
import { DateTime } from "luxon";
import UserGroupViewer from "../UserGroupViewer/UserGroupViewer";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCaretRight } from "@fortawesome/free-solid-svg-icons";

const serverOrigin = process.env.REACT_APP_ORIGIN;

//mode 0 is for friends page's component, mode 1 is for main page's component
function FriendsActivityViewer({ userInfo }) {
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
        };
      })
      .catch((error) => console.error(error));
  }, []);

  return (
    <div className={`${styles.FriendsActivityViewer} customScroll`}>
      {
        friends.map((friend, i) => {
          const { timezone, name, totalTime, activeSubject, user_id } = friend;
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
                to={`${serverOrigin}/dashboard/user/${user_id}`}
              >
                <div className={styles.profileImg}
                  style={{
                    backgroundImage: `url("${serverOrigin}/profile-images/${user_id}.jpeg")`, backgroundSize: 'cover',
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
                <UserSubjectViewer
                  userInfo={friend}
                />
                <UserGroupViewer
                  userInfo={friend}
                  myInfo={userInfo}
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