import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faComments } from "@fortawesome/free-solid-svg-icons";
import React, { useCallback, useContext } from "react";
import { ChatModalContext } from "@/app/utils/Contexts";
import BlobBtn from "../BlobBtn/BlobBtn";
import { postChatRequest } from "@/Api/chatApi";
import styles from "./ChatBtn.module.css";
import { useChatRooms } from "@/Hooks/chatHooks";
import { useAccount } from "@/Hooks/accountHooks";

export default function ChatBtn({ targetInfo, padding }) {
  const { setChatModal } = useContext(ChatModalContext);

  const { chatrooms } = useChatRooms();
  const { accountData } = useAccount();

  const chatRequest = useCallback(async () => {
    try {
      const response = await postChatRequest(targetInfo.user_id);

      if (response.message === "DM already created!") {
        const { chatroom_id } = response.data.chatroom;

        setChatModal((prev) => ({
          ...prev,
          chatroom_id,
          opened: true,
        }));
      }
    } catch (err) {
      console.log(err);
    }
  }, [targetInfo]);

  return (
    <div className={styles.ChatBtn}>
      <div className={styles.blobWrapper}>
        <BlobBtn
          onClick={(e) => {
            e.stopPropagation();
            if (!targetInfo) {
              return setChatModal((prev) => ({
                ...prev,
                opened: true,
                chatroom_id: null,
              }));
            }
            const chatroom = chatrooms.find(
              (chatroom) =>
                chatroom.members.sort().join() ===
                [accountData.user_id, targetInfo?.user_id].sort().join()
            );

            if (chatroom) {
              setChatModal((prev) => ({
                ...prev,
                chatroom_id: chatroom.chatroom_id,
                opened: true,
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
        Chat with {targetInfo?.name}!
      </div>
    </div>
  );
}
