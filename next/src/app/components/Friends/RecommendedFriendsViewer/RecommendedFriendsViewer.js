"use client";

import React, { useContext, useEffect, useState } from 'react';
import styles from "./RecommendedFriendsViewer.module.css";
import Link from 'next/link';
import { ResponseContext, UserInfoContext } from '@/app/utils/Contexts';
import config from '@/app/utils/config';
import RefreshBtn from '../../Buttons/RefreshBtn/RefreshBtn';
import ProfileImage from '../../Users/ProfileImage/ProfileImage';
import CountryViewer from '../../Others/CountryViewer/CountryViewer';
import FriendRequestBtn from '../../Buttons/FriendRequestBtn/FriendRequestBtn';


function RecommendedFriendsViewer({}) {
  const {userInfo} = useContext(UserInfoContext);

  const {setResponse} = useContext(ResponseContext);
  const [refresh, setRefresh] = useState(true);
  const [recommendedFriends, setRecommendedFriends] = useState([]);

  useEffect(() => {
    if (!refresh) return;
    fetch(`${config.server}/friend/recommended`, {
      method: "get",
      headers: {
        "Content-Type": "application/json",
      },
      credentials:"include"
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          setRecommendedFriends(data.users);
          setTimeout(() => {
            setRefresh(false)
          }, 3000);
        }
      });
  }, [refresh]);

  useEffect(() => {
    if (!userInfo) return;

    setRefresh(false);

    setTimeout(() => {
      setRefresh(true);
    }, 500);
  }, [userInfo]);

  return (
    <div className={styles.RecommendedFriendsViewer}>
      <div className={styles.title}>
        Recommended Friends
        <RefreshBtn
          refresh={refresh}
          setRefresh={setRefresh}
        />
      </div>
      <div className={styles.recommendedFriends}>
        {recommendedFriends.map((user, i) => {
          const { user_id, name, timezone } = user;
          return (
            <div
              className={styles.recommendedFriend} key={i}>
              <Link
              href={`/dashboard/user/${user_id}`}
              >
              <ProfileImage 
                userId={user_id}
              />
              <p className={styles.name}>{name}</p>
              </Link>
              <CountryViewer timezone={timezone} />
              <div className={styles.buttons}>
                <FriendRequestBtn
                  userInfo={user}
                  setResponse={setResponse}
                  padding={"0.1875rem 0.313rem"}
                />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  );
};

export default RecommendedFriendsViewer;