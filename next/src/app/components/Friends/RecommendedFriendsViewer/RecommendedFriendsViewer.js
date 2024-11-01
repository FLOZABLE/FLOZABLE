"use client";

import React, { useContext } from "react";
import styles from "./RecommendedFriendsViewer.module.css";
import RefreshBtn from "../../Buttons/RefreshBtn/RefreshBtn";
import FriendRequestBtn from "../../Buttons/FriendRequestBtn/FriendRequestBtn";
import CircularLoading from "../../LoadingScreen/CircularLoading/CircularLoading";
import UserContainer from "../../Users/UserContainer/UserContainer";
import { useRouter } from "next/navigation";
import { useFriendsRecommended } from "@/Hooks/friendsHooks";
import { ModalsContext } from "@/app/utils/Contexts";

function RecommendedFriendsViewer({}) {
  const { setSearchUsersModal } = useContext(ModalsContext);

  const {
    friendsRecommendedData,
    friendsRecommendedIsLoading,
    friendsRecommendedRefetch,
  } = useFriendsRecommended();

  const router = useRouter();

  return (
    <div className={`Box ${styles.RecommendedFriendsViewer}`}>
      <div className={styles.header}>
        <h3>Recommended Friends</h3>
        <RefreshBtn onClick={friendsRecommendedRefetch} />
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
      <div className={`contents customScroll`}>
        {friendsRecommendedIsLoading ? (
          <CircularLoading />
        ) : (
          friendsRecommendedData?.data?.users.map((user, i) => {
            return (
              <div className={styles.user} key={i}>
                <UserContainer
                  userInfo={user}
                  onClick={() => {
                    router.push(`/dashboard/user/${user.user_id}`);
                  }}
                >
                  <FriendRequestBtn
                    userInfo={user}
                    padding={"0.1875rem 0.313rem"}
                  />
                </UserContainer>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

export default RecommendedFriendsViewer;
