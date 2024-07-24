import styles from "./ChatRoom.module.css";
import React, { useContext, useEffect, useState } from "react";
import { DateTime } from "luxon";
import { socket } from "@/app/utils/socket";
import { ModalsContext } from "@/app/utils/Contexts";

function ChatRoom({ chatroom }) {
  const { setChatModal } = useContext(ModalsContext);

  const [lastMsg, setLastMsg] = useState({});

  useEffect(() => {
    if (!chatroom?.lastMsg) return;

    setLastMsg(chatroom.lastMsg);

    const onChatMessage = (message) => {
      if (chatroom.chatroom_id === message.r) {
        setLastMsg(message);
      }
    };

    socket.on("chat/message", onChatMessage);

    return () => {
      socket.off("chat/message", onChatMessage);
    };
  }, [chatroom]);

  return (
    <li
      className={styles.ChatRoom}
      onClick={() => {
        setChatModal((prev) => ({ ...prev, chatroom: chatroom.chatroom_id }));
      }}
    >
      <div
        className={styles.imgContainer}
        style={{ backgroundColor: chatroom.color }}
      ></div>
      <div className={styles.roomInfo}>
        <div className={styles.header}>
          <div className={styles.name}>{chatroom.name}</div>
          <strong>({chatroom.members.length})</strong>
          <div className={styles.msgCount}>
            {/* {newMsgs ? <div>{newMsgs} new messages</div> : null} */}
          </div>
        </div>
        <div className={styles.msgInfo}>
          <div className={styles.msg}>{lastMsg?.m}</div>
          <div className={styles.time}>
            {lastMsg && lastMsg.t
              ? DateTime.fromSeconds(lastMsg.t * 60).toLocaleString(
                  DateTime.TIME_SIMPLE
                )
              : null}
          </div>
        </div>
      </div>
    </li>
  );
}

export default ChatRoom;
