import BlobBtn from "../BlobBtn/BlobBtn";
import styles from "./DmBtn.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faComments } from "@fortawesome/free-solid-svg-icons";
import React from 'react';

const serverOrigin = process.env.REACT_APP_ORIGIN;

function DmBtn({userInfo, setResponse, padding, setIsChatModal}) {
  const requestChat = () => {
    fetch(`${serverOrigin}/chat/chat-request`, {
      method: "post",
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ targetId: userInfo.user_id }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.reason === "DM already created!") {
          console.log(21, data.room);
          setIsChatModal(data.room);
        }
        else{
          setResponse(data);
        }
      })
      .catch((error) => console.error(error));
  }

  return (
    <div className={styles.DmBtn}>
      <div className={styles.blobWrapper}>
        <BlobBtn padding={padding} name={<FontAwesomeIcon icon={faComments} />} setClicked={() => { requestChat() }} opt={2} />
      </div>
      <div className={styles.hoverEl}>
        <p>Chat with {userInfo ? userInfo.name : ''}!</p>
      </div>
    </div>
  );
};

export default DmBtn;