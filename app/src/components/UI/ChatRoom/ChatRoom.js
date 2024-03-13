import styles from "./ChatRoom.module.css";
import { socket } from "../../../socket";
import React, { useEffect, useState } from "react";
import { DateTime } from "luxon";

function ChatRoom({ room, setSelectedRoom, setRoomName, lastMsg, lastRead, setTotalNewMsg, isSelected }) {
  const [newMsgs, setNewMsgs] = useState(0);
  useEffect(() => {
    if (!room || isSelected) return;
    const onNewMsg = (roomId, msgInfo) => {
      if (roomId === room.id) {
        setNewMsgs(prev => prev + 1);
      };
    };

    socket.on('msgReceived', onNewMsg);

    return () => {
      socket.off('msgReceived', onNewMsg);
    }
  }, [room, isSelected]);

  useEffect(() => {
    if (!room) return;
    /* if (!lastRead) {
      const newMsgs = room.chats.length;
      setTotalNewMsg(prev => prev + newMsgs);
      setNewMsgs(newMsgs);
      return;
    }; */
    const [lastReadMsg, lastReadTime] = lastRead ? lastRead.split(":") : [null, null];
    const lastMsgIndex = room.chats.findIndex(chat => {
      return chat.i === lastReadMsg;
    });
    if (lastMsgIndex === -1) return;
    const newMsgs = room.chats.length - lastMsgIndex - 1;
    setTotalNewMsg(prev => prev + newMsgs);
    setNewMsgs(newMsgs);
  }, [lastRead, room]);

  return (
    <li
      className={styles.ChatRoom}
      onClick={() => {
        setSelectedRoom(room);
        setRoomName(room?.name);
        setTotalNewMsg(prev => prev - newMsgs)
        setNewMsgs(0);
      }}
    >
      <div className={styles.imgContainer} style={{ backgroundColor: room?.color }}>
      </div>
      <div className={styles.roomInfo}
      >
        <div className={styles.header}>
          <div className={styles.name}>
            {room?.name}
          </div>
          <strong>({room?.members.length})</strong>
          <div className={styles.msgCount}>
            {newMsgs ? <div>{newMsgs} new messages</div> : null}  
          </div>
        </div>
        <div className={styles.msgInfo}>
          <div className={styles.msg}>
            {lastMsg?.m}
          </div>
          <div className={styles.time}>
            {lastMsg && lastMsg.t ? DateTime.fromSeconds(lastMsg.t * 60).toLocaleString(DateTime.TIME_SIMPLE) : null}
          </div>
        </div>
      </div>
    </li>
  );
};

export default ChatRoom;