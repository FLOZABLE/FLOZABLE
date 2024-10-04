import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faComments } from "@fortawesome/free-solid-svg-icons";
import React, { useCallback, useContext } from "react";
import { ModalsContext, ResponseContext } from "@/app/utils/Contexts";
import BlobBtn from "../BlobBtn/BlobBtn";
import { postChatRequest } from "@/Api/chatApi";
import styles from "./ChatBtn.module.css";
import { useChatRooms } from "@/Hooks/chatroomsHooks";

export default function ChatBtn({ userInfo, padding }) {
  const { chatRoomsData } = useChatRooms();
  const { setResponse } = useContext(ResponseContext);
  const { setChatModal } = useContext(ModalsContext);

  const chatRequest = useCallback(() => {
    (async () => {
      const data = await postChatRequest(userInfo.user_id);

      if (data.reason === "DM already created!") {
        const { name, chatroom_id } = data.chatroom;

        setChatModal((prev) => ({
          ...prev,
          chatroom: chatroom_id,
          name,
          open: true,
        }));
      } else {
        setResponse(data);
      }
    })();
  }, []);

  return (
    <div className={styles.ChatBtn}>
      <div className={styles.blobWrapper}>
        <BlobBtn
          onClick={(e) => {
            e.stopPropagation();
            if (!userInfo) {
              return setChatModal((prev) => ({
                ...prev,
                open: true,
                chatroom: null,
                name: null,
              }));
            }
            const chatroom = chatRoomsData?.chatrooms?.find(
              (chatroom) =>
                chatroom.members.sort().join() ===
                [targetId, userInfo?.user_id].sort().join()
            );

            if (chatroom) {
              setChatModal((prev) => ({
                ...prev,
                chatroom: chatroom.chatroom_id,
                name: chatroom.name,
                open: true,
              }));
              return;
            }
            chatRequest();
          }}
          style={{
            fontSize: "0.9rem",
            padding,
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
