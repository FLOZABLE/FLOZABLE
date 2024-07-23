"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import styles from "./ChatModal.module.css";
import { faXmark } from "@fortawesome/free-solid-svg-icons";
import React, {
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  GroupsContext,
  ModalsContext,
  UserInfoContext,
} from "@/app/utils/Contexts";
import { BackArrow } from "@/app/utils/Svg";
import config from "@/app/utils/config";
import SendBtn from "@/app/components/Buttons/SendBtn/SendBtn";
import { socket } from "@/app/utils/socket";
import ChatRoom from "@/app/components/Chats/ChatRoom/ChatRoom";
import { DateTime } from "luxon";
import ChatContainer from "@/app/components/Chats/ChatContainer/ChatContainer";
import MyChatContainer from "@/app/components/Chats/MyChatContainer/MyChatContainer";
import { useGetChatrooms } from "@/Hooks/chatroomsHooks";

function ChatModal({}) {
  const { userInfo } = useContext(UserInfoContext);
  const { chatModal, setChatModal } = useContext(ModalsContext);

  /* const [selectedRoom, setSelectedRoom] = useState(null);
  const [chatRooms, setChatRooms] = useState([]);
  const [readStatus, setReadStatus] = useState({});
  const [msgInput, setMsgInput] = useState(""); */

  const [chatrooms, setChatRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState({
    members: [],
    messages: [],
  });
  const [messages, setMessages] = useState([]);
  const [msgInput, setMsgInput] = useState("");

  const moveRef = useRef(null);
  const chatsContainerRef = useRef(null);

  const { data: useGetChatroomsData } = useGetChatrooms(userInfo);

  useEffect(() => {
    console.log(useGetChatroomsData);
    if (!useGetChatroomsData?.success) return;

    setChatRooms(useGetChatroomsData.chatrooms);
  }, [useGetChatroomsData]);

  const onSubmit = useCallback(() => {
    socket.emit("chat/send", chatModal.chatroom, msgInput)
  }, [msgInput, chatModal]);

  return (
    <div
      className={`${styles.ChatModal} ${chatModal.open ? styles.open : ""}`}
      ref={moveRef}
    >
      <div className={styles.header}>
        <i
          onClick={() => {
            setChatModal((prev) => ({ ...prev, open: true }));
          }}
        >
          <BackArrow />
        </i>
        <p>Messages</p>
        <i
          onClick={() => {
            setChatModal((prev) => ({ ...prev, open: false }));
          }}
        >
          <FontAwesomeIcon icon={faXmark} />
        </i>
      </div>
      <ul className={`${styles.chatroomsContainer} customScroll`}>
        {chatrooms.map((chatroom, i) => {
          return <ChatRoom key={i} chatroom={chatroom} />;
        })}
      </ul>
      <div
        className={`${styles.chatScreen} ${
          chatModal?.chatroom ? styles.open : ""
        }`}
      >
        <ul
          className={`${styles.chatsContainer} customScroll`}
          ref={chatsContainerRef}
        >
          <div className={styles.header}>
            <i
              onClick={() => {
                setChatModal((prev) => ({ ...prev, chatroom: null }));
              }}
            >
              <BackArrow />
            </i>
            <p>Messages</p>
            <i
              onClick={() => {
                setChatModal((prev) => ({ ...prev, open: false }));
              }}
            >
              <FontAwesomeIcon icon={faXmark} />
            </i>
          </div>
          {selectedRoom?.messages?.map((msg) => {
            const { u, m, i, t } = msg;
            const formattedTime = DateTime.fromSeconds(t * 60).toFormat(
              "h:mm a"
            );
            if (u === userInfo.user_id) {
              return <MyChatContainer time={formattedTime} m={m} key={i} />;
            } else {
              const user = selectedRoom.members.find((member) => {
                return member.user_id === u;
              });
              return (
                <ChatContainer
                  userInfo={user}
                  time={formattedTime}
                  m={m}
                  key={i}
                />
              );
            }
          })}
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
