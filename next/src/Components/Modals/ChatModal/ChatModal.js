"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import styles from "./ChatModal.module.css";
import { faXmark } from "@fortawesome/free-solid-svg-icons";
import React, { useCallback, useContext, useEffect, useRef, useState } from "react";
import { ChatsContext, GroupsContext, ModalsContext } from "@/utils/Contexts";
import { BackArrow } from "@/utils/Svg";
import config from "@/utils/config";
import SendBtn from "@/Components/Buttons/SendBtn/SendBtn";
import { socket } from "@/utils/socket";
import ChatRoom from "@/Components/Chats/ChatRoom/ChatRoom";

function ChatModal({
}) {
  const {chatModal, setChatModal} = useContext(ModalsContext);
  const {myGroups} = useContext(GroupsContext);

  const [selectedRoom, setSelectedRoom] = useState(null);
  const [chatRooms, setChatRooms] = useState([]);
  const [readStatus, setReadStatus] = useState({});
  const [msgInput, setMsgInput] = useState("");
  const [roomMembers, setRoomMembers] = useState([]);

  useEffect(() => {
    fetch(`${config.server}/chat/bring-rooms`, { method: "post" })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          setChatRooms(data.rooms);
          setReadStatus(data.readStatus);
          console.log('gddddd', chatRooms)
        }
      })
      .catch((error) => console.error(error));
  }, []);

  const moveRef = useRef(null);
  const chatsContainerRef = useRef(null);


  const onSubmit = useCallback(() => {
    if (msgInput.length) {
      setMsgInput("");
      socket.emit("sendMsg", selectedRoom.id, msgInput);
    }
  }, [msgInput, selectedRoom]);

  useEffect(() => {
    if (!chatModal.chatRoom || !myGroups.length) return;

    const chatRoom = chatRooms.find(room => room.id === chatModal.chatRoom);

    if (!chatRoom) return;

    const { type, id, members, chats } = chatRoom;
    const lastMsg = chats.length ? chats[chats.length - 1] : null;

    const lastRead = readStatus[id];

    if (!type) {
      const group = myGroups.find((group) => {
        return group.group_id === id;
      });
      if (!group) return;
      const { name, color } = group;

      chatRoom.name = name;
      chatRoom.color = color;
      chatRoom.members = members;
      setSelectedRoom(chatRoom);

      fetch(`${config.server}/chat/members?roomId=${id}`, { method: "get" })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          const { membersInfo } = data;
          setRoomMembers(membersInfo);
        }
      })
      .catch((error) => console.error(error));
    } else {
      chatRoom.name = members
        .map((member) => {
          return member.name;
        })
        .join(",");
      chatRoom.color = "var(--purple)";
      setSelectedRoom(chatRoom);

      setRoomMembers(chatRoom.members);
    };
  }, [chatModal.chatRoom, myGroups]);

  return (
    <div className={`${styles.ChatModal} ${chatModal.open ? styles.open : ""}`}
      ref={moveRef}
    >
      <div className={styles.header}>
        <i
          onClick={() => {
            setChatModal(prev => ({...prev, open: true}));
          }}>
          <BackArrow />
        </i>
        <p>Messages</p>
        <i
          onClick={() => {
            setChatModal(prev => ({...prev, open: false}));
          }}
        >
          <FontAwesomeIcon icon={faXmark} />
        </i>
      </div>
      <ul className={`${styles.chatRoomsContainer} customScroll`}>
        {chatRooms.map((chatRoom, i) => {
        if (!readStatus) return;

        const { type, id, members, chats } = chatRoom;
        const lastMsg = chats.length ? chats[chats.length - 1] : null;
        const lastRead = readStatus[id];

        if (!type) {
          const group = myGroups.find((group) => {
            return group.group_id === id;
          });
          if (!group) return;
          const { name, color } = group;
          const members = group.members === "" ? [] : group.members.split(",");
          chatRoom.name = name;
          chatRoom.color = color;
          chatRoom.members = members;
          return (
            <ChatRoom
              key={i}
              room={chatRoom}
              lastMsg={lastMsg}
              lastRead={lastRead}
            />
          );
        } else {
          chatRoom.name = members
            .map((member) => {
              return member.name;
            })
            .join(",");
          chatRoom.color = "var(--purple)";
          return (
            <ChatRoom
              key={i}
              room={chatRoom}
              lastMsg={lastMsg}
              lastRead={lastRead}
            />
          );
        }
        })}
      </ul>
      <div
        className={`${styles.chatsWrapper} ${chatModal?.chatRoom ? styles.open : ""
          }`}
      >
        <div className={styles.header}>
          <i
            id={styles.exitBtn}
            onClick={() => {
              setChatModal(prev => ({...prev, chatRoom: false}));
            }}
          >
            <BackArrow />
          </i>
          <p>{selectedRoom?.name}</p>
          <i
            id={styles.closeBtn}
            onClick={() => {
              setChatModal(prev => ({...prev, open: false}));
            }}
          >
            <FontAwesomeIcon icon={faXmark} />
          </i>
        </div>
        <ul
          className={`${styles.chatsContainer} customScroll`}
          ref={chatsContainerRef}
        >
          
        </ul>
        <div className={styles.inputWrapper}>
          <input
            type="text"
            value={msgInput}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                onSubmit();
              }
            }}
            onChange={(e) => setMsgInput(e.target.value)}
          />
          <SendBtn onSubmit={onSubmit} />
        </div>
      </div>
    </div>
  );
}

export default ChatModal;