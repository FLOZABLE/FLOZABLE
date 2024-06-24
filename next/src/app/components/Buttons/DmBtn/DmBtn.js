import styles from "./DmBtn.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faComments } from "@fortawesome/free-solid-svg-icons";
import React, { useContext } from "react";
import config from "@/app/utils/config";
import { ModalsContext, ResponseContext } from "@/app/utils/Contexts";
import BlobBtn from "../BlobBtn/BlobBtn";

function DmBtn({ userInfo, padding }) {
  const { setResponse } = useContext(ResponseContext);
  const { setChatModal } = useContext(ModalsContext);

  const requestChat = () => {
    fetch(`${config.server}/chat/chat-request`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ targetId: userInfo.user_id }),
      credentials: "include",
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.reason === "DM already created!") {
          setChatModal({ ...data.room, chatRoom: data.room.id, open: true });
        } else {
          setResponse(data);
        }
      })
      .catch((error) => console.error(error));
  };

  return (
    <div className={styles.DmBtn}>
      <div className={styles.blobWrapper}>
        <BlobBtn
          padding={padding}
          onClick={(e) => {
            e.stopPropagation();
            requestChat();
          }}
          style={{
            fontSize: '0.9rem'
          }}
        >
          <FontAwesomeIcon icon={faComments} />
        </BlobBtn>
      </div>
      <div className={styles.hoverEl}>
        <p>Chat with {userInfo ? userInfo.name : ""}!</p>
      </div>
    </div>
  );
}

export default DmBtn;
