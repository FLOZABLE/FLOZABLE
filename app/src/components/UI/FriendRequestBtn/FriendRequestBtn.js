import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import BlobBtn from "../BlobBtn/BlobBtn";
import styles from "./FriendRequestBtn.module.css";
import { faUser } from "@fortawesome/free-solid-svg-icons";
import React from 'react';

const serverOrigin = process.env.REACT_APP_ORIGIN;

function FriendRequestBtn({ userInfo, setResponse, padding }) {

  const requestFriend = () => {
    fetch(`${serverOrigin}/friend/request`, {
      method: "post",
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ targetId: userInfo.user_id }),
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