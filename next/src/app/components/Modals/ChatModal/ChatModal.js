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
import { ModalsContext } from "@/app/utils/Contexts";
import { BackArrow } from "@/app/utils/Svg";
import SendBtn from "@/app/components/Buttons/SendBtn/SendBtn";
import { socket } from "@/app/utils/socket";
import ChatRoom from "@/app/components/Chats/ChatRoom/ChatRoom";
import { DateTime } from "luxon";
import ChatContainer from "@/app/components/Chats/ChatContainer/ChatContainer";
import MyChatContainer from "@/app/components/Chats/MyChatContainer/MyChatContainer";
import { useGetChatroomMembers, useGetChatrooms } from "@/Hooks/chatroomsHooks";
import { getChatroomMessages } from "@/Api/chatroomsApi";
import { useAccount } from "@/Hooks/accountHooks";

function ChatModal({}) {
  const { userInfo } = useAccount();
  const { chatModal, setChatModal } = useContext(ModalsContext);

  const [chatrooms, setChatRooms] = useState([]);
  const [messages, setMessages] = useState([]);
  const [members, setMembers] = useState([]);
  const [msgInput, setMsgInput] = useState("");

  const moveRef = useRef(null);
  const chatsContainerRef = useRef(null);

  const { data: useGetChatroomsData } = useGetChatrooms(userInfo);
  const { data: useGetChatroomMembersData } = useGetChatroomMembers(
    chatModal.chatroom
  );

  useEffect(() => {
    if (!useGetChatroomsData?.success) return;

    setChatRooms(useGetChatroomsData.chatrooms);
  }, [useGetChatroomsData]);

  const onSubmit = useCallback(() => {
    socket.emit("chat/send", chatModal.chatroom, msgInput);
  }, [msgInput, chatModal]);

  useEffect(() => {
    const onChatMessage = (message) => {
      if (chatModal.chatroom === message.r) {
        setMessages((prev) => [...prev, message]);
        setTimeout(() => {
          chatsContainerRef.current.scrollTo({
            top: chatsContainerRef.current.scrollHeight,
            behavior: "smooth",
          });
        }, 10);
        //socket.emit("chat/read", message.i);
      }
    };

    socket.on("chat/message", onChatMessage);

    return () => {
      socket.off("chat/message", onChatMessage);
    };
  }, [chatrooms, chatModal]);

  useEffect(() => {
    if (!chatModal?.chatroom) return;
    (async () => {
      const data = await getChatroomMessages(chatModal.chatroom);
      if (!data.success) return;
      setMessages(data.messages);
    })();
  }, [chatModal.chatroom]);

  useEffect(() => {
    if (!useGetChatroomMembersData?.success) return;

    setMembers(useGetChatroomMembersData.members);
  }, [useGetChatroomMembersData]);

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
        <ul
          className={`${styles.chatsContainer} customScroll`}
          ref={chatsContainerRef}
        >
          {messages?.map((msg, index) => {
            const { u, m, t } = msg;
            const formattedTime = DateTime.fromSeconds(t * 60).toFormat(
              "h:mm a"
            );
            if (u === userInfo.user_id) {
              return <MyChatContainer time={formattedTime} m={m} key={index} />;
            } else {
              const user = members.find((member) => {
                return member.user_id === u;
              });
              return (
                <ChatContainer
                  userInfo={user}
                  time={formattedTime}
                  m={m}
                  key={index}
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
