"use client";

import React, { useContext, useEffect } from "react";
import styles from "./FriendsActivityViewer.module.css";
import UserSubjectViewer from "@/app/components/Users/UserSubjectViewer/UserSubjectViewer";
import UserGroupViewer from "@/app/components/Users/UserGroupViewer/UserGroupViewer";
import RecommendedFriendsViewer from "../RecommendedFriendsViewer/RecommendedFriendsViewer";
import UserContainer from "../../Users/UserContainer/UserContainer";
import { useRouter } from "next/navigation";
import { useFriendsStatus } from "@/Hooks/friendsHooks";
import CircularLoading from "../../LoadingScreen/CircularLoading/CircularLoading";
import { SearchUsersModalContext } from "@/app/utils/Contexts";
import ChatBtn from "../../Buttons/ChatBtn/ChatBtn";
import { socket } from "@/app/utils/socket";

function FriendsActivityViewer() {
  const { setSearchUsersModal } = useContext(SearchUsersModalContext);

  const router = useRouter();

  const {
    friendsStatus,
    friendsStatusIsLoading,
    friendsStatusError,
    updateFriendsStatus,
  } = useFriendsStatus();

  useEffect(() => {
    const onStudying = ({ userId, subject }) => {
      updateFriendsStatus((prev) => {
        const friendIndex = prev.findIndex(
          (friend) => friend.user_id === userId
        );
        if (friendIndex === -1) return prev;

        const newFriends = [...prev];
        newFriends[friendIndex] = {
          ...newFriends[friendIndex],
          activeSubject: subject,
        };

        return newFriends;
      });
    };

    const onStopStudying = ({ userId, subject, duration }) => {
      updateFriendsStatus((prev) => {
        const friendIndex = prev.findIndex(
          (friend) => friend.user_id === userId
        );
        if (friendIndex === -1) return prev;

        const newFriends = [...prev];
        const study_time = newFriends[friendIndex].study_time + duration;
        newFriends[friendIndex] = {
          ...newFriends[friendIndex],
          activeSubject: subject,
          study_time,
        };

        return newFriends;
      });
    };

    const onDeActiveGroup = ({ userId }) => {
      updateFriendsStatus((prev) => {
        const friendIndex = prev.findIndex(
          (friend) => friend.user_id === userId
        );
        if (friendIndex === -1) return prev;

        const newFriends = [...prev];
        newFriends[friendIndex] = {
          ...newFriends[friendIndex],
          activeGroup: null,
        };

        return newFriends;
      });
    };

    const onActiveGroup = ({ userId, group }) => {
      updateFriendsStatus((prev) => {
        const friendIndex = prev.findIndex(
          (friend) => friend.user_id === userId
        );
        if (friendIndex === -1) return prev;

        const newFriends = [...prev];
        newFriends[friendIndex] = {
          ...newFriends[friendIndex],
          activeGroup: group,
        };

        return newFriends;
      });
    };

    socket.on("studying", onStudying);
    socket.on("stopStudying", onStopStudying);
    socket.on(`deActiveGroup`, onDeActiveGroup);
    socket.on(`activeGroup`, onActiveGroup);
    return () => {
      socket.off("studying", onStudying);
      socket.off("stopStudying", onStopStudying);
      socket.off(`deActiveGroup`, onDeActiveGroup);
      socket.off(`activeGroup`, onActiveGroup);
    };
  }, []);

  console.log("friends err", friendsStatusError)

  if (friendsStatusError) {
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
          friendsStatus.map((friend, i) => {
            return (
              <div
                className={styles.friend}
                key={i}
                style={{ zIndex: friendsStatus.length - i }}
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
