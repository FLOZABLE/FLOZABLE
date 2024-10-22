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
import { ModalsContext, UserInfoContext } from "@/app/utils/Contexts";
import { BackArrow } from "@/app/utils/Svg";
import SendBtn from "@/app/components/Buttons/SendBtn/SendBtn";
import ChatRoom from "@/app/components/Chats/ChatRoom/ChatRoom";
import { DateTime } from "luxon";
import ChatContainer from "@/app/components/Chats/ChatContainer/ChatContainer";
import MyChatContainer from "@/app/components/Chats/MyChatContainer/MyChatContainer";
import {
  useChatMessages,
  useChatRoomMembers,
  useChatRooms,
} from "@/Hooks/chatHooks";
import { socket } from "@/app/utils/socket";

function ChatModal({}) {
  const { userInfo } = useContext(UserInfoContext);
  const { chatModal, setChatModal } = useContext(ModalsContext);

  const [chatrooms, setChatRooms] = useState([]);
  const [messages, setMessages] = useState([]);
  const [members, setMembers] = useState([]);
  const [msgInput, setMsgInput] = useState("");
  const moveRef = useRef(null);
  const chatsContainerRef = useRef(null);
  const messageRefs = useRef({});

  const { chatRoomsData } = useChatRooms();
  const { chatroomMembersData } = useChatRoomMembers(chatModal.chatroom);

  const onSubmit = useCallback(() => {
    socket.emit("chat/send", chatModal.chatroom, msgInput);
    setMsgInput("");
  }, [msgInput, chatModal.chatroom]);

  useEffect(() => {
    if (!chatroomMembersData?.success) return;

    setMembers(chatroomMembersData.members);
  }, [chatroomMembersData]);

  useEffect(() => {
    if (!chatRoomsData?.success) return;

    setChatRooms(chatRoomsData.chatrooms);
  }, [chatRoomsData]);

  useEffect(() => {
    const onChatMessage = (message) => {
      console.log(message)
    };

    socket.on("chat/message", onChatMessage);

    return () => {
      socket.off("chat/message", onChatMessage);
    };
  }, [userInfo]);

  useEffect(() => {

  }, [])

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
          {/* <BackArrow /> */}
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
        {chatrooms.length ? (
          chatrooms.map((chatroom, i) => {
            return <ChatRoom key={i} chatroom={chatroom} />;
          })
        ) : (
          <div className={styles.noChatrooms}>No chatrooms!</div>
        )}
      </ul>
      <div
        className={`${styles.chatScreen} ${
          chatModal?.chatroom ? styles.open : ""
        }`}
      >
        <div className={styles.header}>
          <i
            onClick={() => {
              setChatModal((prev) => ({ ...prev, chatroom: null }));
            }}
          >
            <BackArrow />
          </i>
          <p className={`overflowDot ${styles.name}`}>{chatModal?.name}</p>
          <i
            onClick={() => {
              setChatModal((prev) => ({ ...prev, open: false }));
            }}
          >
            <FontAwesomeIcon icon={faXmark} />
          </i>
        </div>
        <ul
          className={`${styles.chatsContainer} customScroll`}
          ref={chatsContainerRef}
        >
          {messages?.map((msg, index) => {
            const { user_id, message, sent_at, message_id } = msg;

            const dateTime = DateTime.fromSeconds(sent_at);
            let timeDisp;

            if (DateTime.now().hasSame(dateTime, "day")) {
              timeDisp = dateTime.toFormat("h:mm a");
            } else {
              timeDisp = dateTime.toFormat("M/d h:mm a");
            }

            //commented out my lastread line since my chat will never have new indicator since it's the sender
            if (user_id === userInfo.user_id) {
              return (
                <div
                  ref={(el) => {
                    messageRefs.current[message_id] = el;
                  }}
                  key={index}
                  className={styles.chatWrapper}
                >
                  {/* {isNewLine ? (
                    <div className={styles.lastRead}>
                      <p>New</p>
                      <div className={styles.line}></div>
                    </div>
                  ) : null} */}
                  <MyChatContainer time={timeDisp} message={message} />
                </div>
              );
            } else {
              const user = members.find((member) => {
                return member.user_id === user_id;
              });
              return (
                <div
                  ref={(el) => {
                    messageRefs.current[message_id] = el;
                  }}
                  key={index}
                  className={styles.chatWrapper}
                >
                  {/* {isNewLine ? (
                    <div className={styles.lastRead}>
                      <p>New</p>
                      <div className={styles.line}></div>
                    </div>
                  ) : null} */}
                  <ChatContainer
                    userInfo={user}
                    time={timeDisp}
                    message={message}
                  />
                </div>
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
