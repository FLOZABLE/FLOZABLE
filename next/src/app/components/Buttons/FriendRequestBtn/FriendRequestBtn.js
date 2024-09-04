import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import styles from "./FriendRequestBtn.module.css";
import { faUser } from "@fortawesome/free-solid-svg-icons";
import React, { useCallback, useContext } from "react";
import BlobBtn from "../BlobBtn/BlobBtn";
import { ResponseContext } from "@/app/utils/Contexts";
import { postFriendsRequest } from "@/Api/friendsApi";

function FriendRequestBtn({ userInfo, padding }) {
  const { setResponse } = useContext(ResponseContext);

  const requestFriend = useCallback(() => {
    (async () => {
      const targetId = userInfo.user_id;
      const data = await postFriendsRequest({ targetId });
      setResponse(data);
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
