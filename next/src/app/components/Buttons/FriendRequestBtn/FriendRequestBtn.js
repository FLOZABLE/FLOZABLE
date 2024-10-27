import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import styles from "./FriendRequestBtn.module.css";
import { faUser } from "@fortawesome/free-solid-svg-icons";
import React, { useCallback } from "react";
import BlobBtn from "../BlobBtn/BlobBtn";
import { postFriendsRequest } from "@/Api/friendsApi";

function FriendRequestBtn({ userInfo, padding }) {
  const requestFriend = useCallback(() => {
    (async () => {
      const targetId = userInfo.user_id;
      const response = await postFriendsRequest({ targetId });
    })();
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
