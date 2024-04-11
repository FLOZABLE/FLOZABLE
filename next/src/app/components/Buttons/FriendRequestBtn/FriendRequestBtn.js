import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import styles from "./FriendRequestBtn.module.css";
import { faUser } from "@fortawesome/free-solid-svg-icons";
import React, { useContext } from 'react';
import config from "@/app/utils/config";
import BlobBtn from "../BlobBtn/BlobBtn";
import { ResponseContext } from "@/app/utils/Contexts";

function FriendRequestBtn({ userInfo, padding }) {
  const {setResponse} = useContext(ResponseContext);

  const requestFriend = () => {
    fetch(`${config.server}/friend/request`, {
      method: "post",
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ targetId: userInfo.user_id }),
      credentials: 'include'
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
        <BlobBtn padding={padding} delay={-1} name={<>+<FontAwesomeIcon icon={faUser} /></>} setClicked={() => { requestFriend() }} color1={'#fff'} color2={"var(--purple)"} opt={2} />
      </div>
      <div className={styles.hoverEl}>
        <p>Become a friend with {userInfo ? userInfo.name : ''}!</p>
      </div>
    </div>
  );
};

export default FriendRequestBtn;