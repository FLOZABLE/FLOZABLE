"use client";

import React, { useState, useEffect } from "react";
import styles from "./FriendsActivityViewer.module.css";
import config from "@/app/utils/config";
import UserSubjectViewer from "@/app/components/Users/UserSubjectViewer/UserSubjectViewer";
import UserGroupViewer from "@/app/components/Users/UserGroupViewer/UserGroupViewer";
import RecommendedFriendsViewer from "../RecommendedFriendsViewer/RecommendedFriendsViewer";
import { Wave } from "@/app/utils/Svg";
import UserContainer from "../../Users/UserContainer/UserContainer";
import { useRouter } from "next/navigation";
import DmBtn from "../../Buttons/DmBtn/DmBtn";
import { useAccount } from "@/Hooks/accountHooks";

//mode 0 is for friends page's component, mode 1 is for main page's component
function FriendsActivityViewer() {
  const { userInfo } = useAccount();

  const [friends, setFriends] = useState([]);

  const router = useRouter();

  useEffect(() => {
    if (!userInfo) return;

    fetch(`${config.server}/friends/status`, {
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
                        router.push(`/dashboard/user/${friend.user_id}`);
                      }}
                    />
                    <div className={styles.activeInfo}>
                      <UserSubjectViewer userInfo={friend} />
                      <UserGroupViewer userInfo={friend} />
                    </div>
                  </div>
                  <div className={styles.buttons}>
                    <DmBtn userInfo={friend} padding={"0.3rem 0.6rem"} />
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
