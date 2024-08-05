"use client";

import React, { useContext } from "react";
import styles from "./FriendsActivityViewer.module.css";
import UserSubjectViewer from "@/app/components/Users/UserSubjectViewer/UserSubjectViewer";
import UserGroupViewer from "@/app/components/Users/UserGroupViewer/UserGroupViewer";
import RecommendedFriendsViewer from "../RecommendedFriendsViewer/RecommendedFriendsViewer";
import UserContainer from "../../Users/UserContainer/UserContainer";
import { useRouter } from "next/navigation";
import DmBtn from "../../Buttons/DmBtn/DmBtn";
import { useFriendsStatus } from "@/Hooks/friendsHooks";
import CircularLoading from "../../LoadingScreen/CircularLoading/CircularLoading";
import { ModalsContext } from "@/app/utils/Contexts";

function FriendsActivityViewer() {
  const { setIsSearchUsersModal } = useContext(ModalsContext);

  const router = useRouter();

  const { useFriendsStatusData, useFriendsStatusIsLoading } =
    useFriendsStatus();

  if (!useFriendsStatusIsLoading && !useFriendsStatusData?.success) {
    return <RecommendedFriendsViewer />;
  }

  return (
    <div className={`Box ${styles.FriendsActivityViewer}`}>
      <div className={`header ${styles.header}`}>
        <p>Friends</p>
        <div
          id={styles.searchFriendBtn}
          onClick={() => {
            setIsSearchUsersModal((prev) => !prev);
          }}
        >
          +<div className={`HoverText ${styles.hoverText}`}>Add friend!</div>
        </div>
      </div>
      <div className={`${styles.friends} contents customScroll`}>
        {useFriendsStatusIsLoading ? (
          <CircularLoading />
        ) : (
          useFriendsStatusData?.friends?.map((friend, i) => {
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
          })
        )}
      </div>
    </div>
  );
}

export default FriendsActivityViewer;
