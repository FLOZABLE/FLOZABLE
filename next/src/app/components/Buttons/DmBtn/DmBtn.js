import styles from "./DmBtn.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faComments } from "@fortawesome/free-solid-svg-icons";
import React, { useContext } from 'react';
import config from "@/app/utils/config";
import { ResponseContext } from "@/app/utils/Contexts";
import BlobBtn from "../BlobBtn/BlobBtn";

function DmBtn({userInfo, padding, setIsChatModal}) {
  const {setResponse} = useContext(ResponseContext);
  
  const requestChat = () => {
    fetch(`${config.server}/chat/chat-request`, {
      method: "post",
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ targetId: userInfo.user_id }),
      credentials:"include"
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