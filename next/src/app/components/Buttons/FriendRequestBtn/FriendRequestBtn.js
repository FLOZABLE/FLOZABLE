import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import styles from "./FriendRequestBtn.module.css";
import { faUser } from "@fortawesome/free-solid-svg-icons";
import React, { useContext } from "react";
import config from "@/app/utils/config";
import BlobBtn from "../BlobBtn/BlobBtn";
import { ResponseContext } from "@/app/utils/Contexts";

function FriendRequestBtn({ userInfo, padding }) {
  const { setResponse } = useContext(ResponseContext);

  const requestFriend = () => {
    fetch(`${config.server}/friends/request`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ targetId: userInfo.user_id }),
      credentials: "include",
    })
      .then((response) => response.json())
      .then((data) => {
        setResponse(data);
      })
      .catch((error) => console.error(error));
  };

  return (
    <div className={styles.FriendRequestBtn}>
      <div className={styles.blobWrapper}>
        <BlobBtn
          padding={padding}
          onClick={(e) => {
            e.stopPropagation();
            requestFriend();
          }}
          color1={"#fff"}
          color2={"var(--purple)"}
          style={{
            fontSize: '0.9rem'
          }}
        >
          +<FontAwesomeIcon icon={faUser} />
        </BlobBtn>
      </div>
      <div className={styles.hoverEl}>
        <p>Become a friend with {userInfo ? userInfo.name : ""}!</p>
      </div>
    </div>
  );
}

export default FriendRequestBtn;
