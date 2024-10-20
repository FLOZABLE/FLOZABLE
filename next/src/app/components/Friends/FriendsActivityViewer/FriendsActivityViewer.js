"use client";

import React, { useContext } from "react";
import styles from "./FriendsActivityViewer.module.css";
import UserSubjectViewer from "@/app/components/Users/UserSubjectViewer/UserSubjectViewer";
import UserGroupViewer from "@/app/components/Users/UserGroupViewer/UserGroupViewer";
import RecommendedFriendsViewer from "../RecommendedFriendsViewer/RecommendedFriendsViewer";
import UserContainer from "../../Users/UserContainer/UserContainer";
import { useRouter } from "next/navigation";
import { useFriendsStatus } from "@/Hooks/friendsHooks";
import CircularLoading from "../../LoadingScreen/CircularLoading/CircularLoading";
import { ModalsContext } from "@/app/utils/Contexts";
import ChatBtn from "../../Buttons/ChatBtn/ChatBtn";

function FriendsActivityViewer() {
  const { setSearchUsersModal } = useContext(ModalsContext);

  const router = useRouter();

  const { useFriendsStatusData, friendsStatusIsLoading } = useFriendsStatus();

  if (!friendsStatusIsLoading && !useFriendsStatusData?.success) {
    return <RecommendedFriendsViewer />;
  }

  return (
    <div className={`Box ${styles.FriendsActivityViewer}`}>
      <div className={`header ${styles.header}`}>
        <p>Friends</p>
        <div
          id={styles.searchFriendBtn}
          onClick={() => {
            setSearchUsersModal((prev) => ({
              onClick: (userInfo) => {
                router.push(`/dashboard/user/${userInfo.user_id}`);
              },
              opened: !prev.opened,
            }));
          }}
        >
          +<div className={`HoverText ${styles.hoverText}`}>Add friend!</div>
        </div>
      </div>
      <div className={`${styles.friends} contents customScroll`}>
        {friendsStatusIsLoading ? (
          <CircularLoading />
        ) : (
          useFriendsStatusData?.friends?.map((friend, i) => {
            return (
              <div
                className={styles.friend}
                key={i}
                style={{ zIndex: useFriendsStatusData.friends.length - i }}
              >
                <div className={styles.info}>
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
                  <ChatBtn targetInfo={friend} padding={"0.3rem 0.6rem"} />
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
