import styles from "./ChatRoom.module.css";
import React, { useContext, useEffect, useState } from "react";
import { DateTime } from "luxon";
import { socket } from "@/utils/socket";
import { ModalsContext } from "@/utils/Contexts";

function ChatRoom({ room, lastMsg, lastRead, setTotalNewMsg }) {
  const {chatModal, setChatModal} = useContext(ModalsContext);

  const [newMsgs, setNewMsgs] = useState(0);

  useEffect(() => {
    if (!chatModal) return;

    const onNewMsg = (roomId, msgInfo) => {
      console.log(chatModal.chatRoom === room.id && roomId === room.id)
      /* if (chatModal.chatRoom !== room.id && roomId === room.id) {
        setNewMsgs(prev => prev + 1);
      }; */
      if (chatModal.chatRoom === room.id && roomId === room.id) {
        setTimeout(() => {
          setNewMsgs(0);
        }, 100);
      }
    };

    socket.on('msgReceived', onNewMsg);

    return () => {
      socket.off('msgReceived', onNewMsg);
    }
  }, [room, chatModal]);

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
    //setChatModal(prev => ({...prev, totalNewMsg: prev.totalNewMsg + 1}));
    setNewMsgs(newMsgs);
  }, [lastRead, room]);

  return (
    <li
      className={styles.ChatRoom}
      onClick={() => {
        setChatModal(prev => ({...prev, totalNewMsg: prev.totalNewMsg - newMsgs, chatRoom: room.id}));
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