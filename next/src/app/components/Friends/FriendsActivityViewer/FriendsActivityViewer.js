"use client";

import React, { useState, useEffect, useContext } from "react";
import styles from "./FriendsActivityViewer.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCaretRight } from "@fortawesome/free-solid-svg-icons";
import Link from "next/link";
import config from "@/app/utils/config";
import ProfileImage from "@/app/components/Users/ProfileImage/ProfileImage";
import CountryViewer from "@/app/components/Others/CountryViewer/CountryViewer";
import UserSubjectViewer from "@/app/components/Users/UserSubjectViewer/UserSubjectViewer";
import UserGroupViewer from "@/app/components/Users/UserGroupViewer/UserGroupViewer";
import { UserInfoContext } from "@/app/utils/Contexts";
import RecommendedFriendsViewer from "../RecommendedFriendsViewer/RecommendedFriendsViewer";
import { Wave } from "@/app/utils/Svg";
import UserContainer from "../../Users/UserContainer/UserContainer";
import { useRouter } from "next/navigation";
import DmBtn from "../../Buttons/DmBtn/DmBtn";

//mode 0 is for friends page's component, mode 1 is for main page's component
function FriendsActivityViewer() {
  const { userInfo } = useContext(UserInfoContext);

  const [friends, setFriends] = useState([]);

  const router = useRouter();

  useEffect(() => {
    if (!userInfo) return;

    fetch(`${config.server}/friend/status`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          setFriends(data.friendsInfo);
        }
      })
      .catch((error) => console.error(error));
  }, [userInfo]);

  return (
    <div className={`${styles.FriendsActivityViewer} Box`}>
      {friends.length ? (
        <>
          <div className="header">
            <h3>Friends Status</h3>
            <i>
              <Wave />
            </i>
          </div>
          <div className="contents customScroll">
            {friends.map((friend, i) => {
              return (
                <div className={styles.friend} key={i}>
                  <div>
                    <UserContainer
                      userInfo={friend}
                      onClick={() => {
                        router.replace(`/dashboard/user/${friend.user_id}`);
                      }}
                    />
                    <div className={styles.activeInfo}>
                      <UserSubjectViewer userInfo={friend} />
                      <UserGroupViewer userInfo={friend} />
                    </div>
                  </div>
                  <div className={styles.buttons}>
                    <DmBtn userInfo={friend} padding={"0.25rem 0.4rem"} />
                  </div>
                </div>
              );
            })}
          </div>
        </>
      ) : (
        <RecommendedFriendsViewer />
      )}
    </div>
  );
}

export default FriendsActivityViewer;
