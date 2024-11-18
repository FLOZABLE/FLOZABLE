import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import styles from "./FriendRequestBtn.module.css";
import { faUser } from "@fortawesome/free-solid-svg-icons";
import React, { useCallback } from "react";
import BlobBtn from "../BlobBtn/BlobBtn";
import { postFriendsRequest } from "@/Api/friendsApi";
import { useFriends } from "@/Hooks/friendsHooks";

function FriendDeleteBtn() {
  <div className={styles.FriendRequestBtn}>
    <div className={styles.blobWrapper}>
      <BlobBtn
        onClick={(e) => {
          e.stopPropagation();
          if (
            friendsData.find((friend) => friend.friend_id === userInfo?.user_id)
          ) {
            //friend
          }
          requestFriend();
        }}
        style={{
          fontSize: "0.9rem",
          padding,
        }}
      >
        +<FontAwesomeIcon icon={faUser} />
      </BlobBtn>
    </div>
    <div className={`HoverText ${styles.hoverText}`}>
      Become a friend with {userInfo?.name}
    </div>
  </div>;
}

function FriendRequestBtn({ userInfo, padding }) {
  const { friendsData } = useFriends();

  console.log(friendsData, "gd");

  const requestFriend = useCallback(async () => {
    try {
      const targetId = userInfo.user_id;
      await postFriendsRequest({ targetId });
    } catch (err) {
      console.log(err);
    }
  }, [userInfo]);

  return (
    <div className={styles.FriendRequestBtn}>
      <div className={styles.blobWrapper}>
        <BlobBtn
          onClick={(e) => {
            e.stopPropagation();
            requestFriend();
          }}
          style={{
            fontSize: "0.9rem",
            padding,
          }}
        >
          +<FontAwesomeIcon icon={faUser} />
        </BlobBtn>
      </div>
      <div className={`HoverText ${styles.hoverText}`}>
        Become a friend with {userInfo?.name}
      </div>
    </div>
  );
}

export default FriendRequestBtn;
