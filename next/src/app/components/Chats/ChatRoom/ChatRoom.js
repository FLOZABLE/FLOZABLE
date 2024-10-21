import styles from "./ChatRoom.module.css";
import React, { useContext, useEffect, useState } from "react";
import { DateTime } from "luxon";
import { ModalsContext } from "@/app/utils/Contexts";
import ChatRoomCoverImg from "../ChatRoomCoverImg/ChatRoomCoverImg";

function ChatRoom({ chatroom }) {
  const { setChatModal } = useContext(ModalsContext);

  const [timeDisp, setTimeDisp] = useState("");

  useEffect(() => {
    if (!chatroom.lastMsg?.sent_at) return;
    const dateTime = DateTime.fromSeconds(chatroom.lastMsg.sent_at);
    if (DateTime.now().hasSame(dateTime, "day")) {
      const timeDisp = dateTime.toLocaleString(DateTime.TIME_SIMPLE);
      setTimeDisp(timeDisp);
    } else {
      const timeDisp = dateTime.toFormat("M/d");
      setTimeDisp(timeDisp);
    }
  }, [chatroom.lastMsg]);

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
        <div className={styles.msgInfo}>
          <div className={styles.msg}>{chatroom.lastMsg?.message}</div>
          {chatroom.unreads ? (
            <div className={styles.unreads}>
              {chatroom.unreads} new messages
            </div>
          ) : null}
        </div>
      </div>
    </li>
  );
}

export default ChatRoom;
