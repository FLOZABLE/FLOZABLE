import styles from "./DmBtn.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faComments } from "@fortawesome/free-solid-svg-icons";
import React, { useCallback, useContext } from "react";
import { ModalsContext, ResponseContext } from "@/app/utils/Contexts";
import BlobBtn from "../BlobBtn/BlobBtn";
import { postChatRequest } from "@/Api/chatApi";

function DmBtn({ userInfo, padding }) {
  const { setResponse } = useContext(ResponseContext);
  const { setChatModal } = useContext(ModalsContext);

  const chatRequest = useCallback(() => {
    (async () => {
      const data = await postChatRequest(userInfo.user_id);

      if (data.reason === "DM already created!") {
        setChatModal((prev) => ({
          ...prev,
          chatroom: data.chatroom,
          open: true,
        }));
      } else {
        setResponse(data);
      }
    })();
  }, []);

  return (
    <div className={styles.DmBtn}>
      <div className={styles.blobWrapper}>
        <BlobBtn
          padding={padding}
          onClick={(e) => {
            e.stopPropagation();
            chatRequest();
          }}
          style={{
            fontSize: "0.9rem",
          }}
        >
          <FontAwesomeIcon icon={faComments} />
        </BlobBtn>
      </div>
      <div className={`HoverText ${styles.hoverText}`}>
        Chat with {userInfo?.name}!
      </div>
    </div>
  );
}

export default DmBtn;
