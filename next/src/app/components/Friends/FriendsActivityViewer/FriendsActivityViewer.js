import React, { useState, useEffect } from "react";
import styles from "./FriendsActivityViewer.module.css";
import { DateTime } from "luxon";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCaretRight } from "@fortawesome/free-solid-svg-icons";
import Link from "next/link";
import config from "@/app/utils/config";
import ProfileImage from "@/app/components/Users/ProfileImage/ProfileImage";
import CountryViewer from "@/app/components/Others/CountryViewer/CountryViewer";
import UserSubjectViewer from "@/app/components/Users/UserSubjectViewer/UserSubjectViewer";
import UserGroupViewer from "@/app/components/Users/UserGroupViewer/UserGroupViewer";

//mode 0 is for friends page's component, mode 1 is for main page's component
function FriendsActivityViewer() {
  const [friends, setFriends] = useState([]);

  useEffect(() => {
    fetch(`${config.server}/friend/status`, {
      method: "get",
      headers: {
        'Content-Type': 'application/json'
      },
      credentials:"include"
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
                href={`${config.server}/dashboard/user/${user_id}`}
              >
                <ProfileImage userId={user_id} />
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