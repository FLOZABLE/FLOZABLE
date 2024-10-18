import styles from "./ChatRoom.module.css";
import React, { useContext, useEffect, useState } from "react";
import { DateTime } from "luxon";
import { socket } from "@/app/utils/socket";
import { ModalsContext } from "@/app/utils/Contexts";
import ChatRoomCoverImg from "../ChatRoomCoverImg/ChatRoomCoverImg";

function ChatRoom({ chatroom }) {
  const { setChatModal } = useContext(ModalsContext);

  const [lastMsg, setLastMsg] = useState({});
  const [timeDisp, setTimeDisp] = useState("");

  useEffect(() => {
    if (chatroom.lastMsg) {
      setLastMsg(chatroom.lastMsg);
    }

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

  useEffect(() => {
    if (!lastMsg?.t) return;
    const dateTime = DateTime.fromSeconds(lastMsg.t);
    if (DateTime.now().hasSame(dateTime, "day")) {
      const timeDisp = dateTime.toLocaleString(DateTime.TIME_SIMPLE);
      setTimeDisp(timeDisp);
    } else {
      const timeDisp = dateTime.toFormat("M/d");
      setTimeDisp(timeDisp);
    }
  }, [lastMsg]);

  return (
    <li
      className={styles.ChatRoom}
      onClick={() => {
        setChatModal((prev) => ({
          ...prev,
          chatroom: chatroom.chatroom_id,
          name: chatroom.name,
        }));
      }}
    >
      <div className={styles.ChatRoomCoverImg}>
        <ChatRoomCoverImg members={chatroom.members} />
      </div>
      <div className={styles.roomInfo}>
        <div className={styles.header}>
          <div className={styles.name}>{chatroom.name}</div>
          <strong>({chatroom.members.length})</strong>
          <div className={styles.time}>{timeDisp}</div>
        </div>
        <div className={styles.msg}>{lastMsg?.m}</div>
      </div>
    </li>
  );
}

export default ChatRoom;
