import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import styles from "./FriendRequestBtn.module.css";
import { faBan, faUser } from "@fortawesome/free-solid-svg-icons";
import React, { useCallback } from "react";
import BlobBtn from "../BlobBtn/BlobBtn";
import { deleteFriend, postFriendsRequest } from "@/Api/friendsApi";
import { useFriends, useFriendsStatus, useFriendsTrends } from "@/Hooks/friendsHooks";
import { DateTime } from "luxon";

function FriendDeleteBtn({ userInfo, friendData, padding }) {
  const { updateFriendsData } = useFriends();
  const { friendsStatusRefetch } = useFriendsStatus();
  const { friendsTrendRefetch } = useFriendsTrends();

  const onDeleteFriend = useCallback(async () => {
    const response = await deleteFriend(userInfo.user_id);
    if (!response.success) return;
    
    updateFriendsData((prev) =>
      prev.filter((friend) => friend.friend_id !== userInfo.user_id)
    );
    friendsStatusRefetch();
    friendsTrendRefetch();
  }, [userInfo]);

  return (
    <div className={styles.FriendRequestBtn}>
      <div className={styles.blobWrapper}>
        <BlobBtn
          onClick={(e) => {
            e.stopPropagation();
            onDeleteFriend();
          }}
          style={{
            fontSize: "0.9rem",
            padding,
          }}
          color2="red"
        >
          <FontAwesomeIcon icon={faBan} />
        </BlobBtn>
      </div>
      <div className={`HoverText ${styles.hoverText}`}>
        Friend since {DateTime.fromSeconds(friendData.date).toISODate()}
      </div>
    </div>
  );
}

function FriendRequestBtn({ userInfo, padding }) {
  const { friendsData } = useFriends();

  const requestFriend = useCallback(async () => {
    try {
      const targetId = userInfo.user_id;
      await postFriendsRequest({ targetId });
    } catch (err) {
      console.log(err);
    }
  }, [userInfo]);

  if (!userInfo) return;

  const friendData = friendsData.find(
    (friend) => friend.friend_id === userInfo.user_id
  );

  if (friendData) {
    return (
      <FriendDeleteBtn
        userInfo={userInfo}
        friendData={friendData}
        padding={padding}
      />
    );
  }

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
        Become a friend with {userInfo.name}
      </div>
    </div>
  );
}

export default FriendRequestBtn;
