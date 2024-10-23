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
import { useInView } from "react-intersection-observer";

function ChatModal({}) {
  const { userInfo } = useContext(UserInfoContext);
  const { chatModal, setChatModal } = useContext(ModalsContext);

  const [chatrooms, setChatRooms] = useState([]);
  const [messages, setMessages] = useState({ chatroomId: null, messages: [] });
  const [messageDataOptions, setMessageDataOptions] = useState({
    chatroomId: null,
    offset: 0,
    length: 30,
    lastMsgId: null,
  });
  const [lastReadMessageId, setLastReadMessageId] = useState(null);
  const [members, setMembers] = useState([]);
  const [msgInput, setMsgInput] = useState("");
  const moveRef = useRef(null);
  const chatsContainerRef = useRef(null);
  //const messageRefs = useRef({});
  const lastReadMessageRef = useRef(null);

  const { chatRoomsData } = useChatRooms();
  const { chatroomMembersData } = useChatRoomMembers(chatModal.chatroom);
  const { chatMessagesData, fetchNextPage, hasNextPage } = useChatMessages(messageDataOptions);

  const { ref: inViewRef, inView } = useInView();

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
    if (inView && hasNextPage) {
      fetchNextPage();
    }
  }, [inView, fetchNextPage, hasNextPage]);

  useEffect(() => {
    if (!chatMessagesData?.success) return;

    if (messages.chatroomId === chatMessagesData.chatroom_id) {
      setMessages((prev) => ({
        ...prev,
        messages: [...chatMessagesData.messages, ...prev.messages],
      }));
    } else {
      setMessages({
        chatroomId: chatMessagesData.chatroom_id,
        messages: chatMessagesData.messages,
      });
    }
  }, [chatMessagesData]);

  useEffect(() => {
    if (chatModal.chatroom) {
      setMessageDataOptions((prev) => {
        const newMessageDataOptions = structuredClone(prev);
        if (prev.chatroomId === chatModal.chatroom) {
          return prev;
        }
        newMessageDataOptions.chatroomId = chatModal.chatroom;
        newMessageDataOptions.offset = 0;
        return newMessageDataOptions;
      });

      //change unread/last read value when selected chatroom changes
      setChatRooms((prev) => {
        const newState = [...prev];
        const chatroomIndex = newState.findIndex(
          (chatroom) => chatroom.chatroom_id === chatModal.chatroom
        );

        if (chatroomIndex === -1) return prev;

        newState[chatroomIndex].unreads = 0;

        const lastRead = newState[chatroomIndex].lastRead;
        if (lastRead) {
          setLastReadMessageId(lastRead);
        }

        const lastMsg = newState[chatroomIndex].lastMsg;

        if (lastMsg) {
          newState[chatroomIndex].lastRead = lastMsg.message_id;
        }

        return newState;
      });
      socket.emit("chat/read", chatModal.chatroom);
    }

    const onChatMessage = (message) => {
      console.log(message);
      setChatRooms((prev) => {
        const newChatrooms = [...prev];
        const chatroomIndex = newChatrooms.findIndex(
          (chatroom) => chatroom.chatroom_id === message.chatroom_id
        );
        if (chatroomIndex === -1) return prev;

        newChatrooms[chatroomIndex].lastMsg = message;

        if (chatModal.chatroom === message.chatroom_id) {
          setMessages((prev) => ({
            ...prev,
            messages: [...prev.messages, message],
          }));
          socket.emit("chat/read", chatModal.chatroom);
          newChatrooms[chatroomIndex].unreads = 0;
          newChatrooms[chatroomIndex].lastRead = message.message_id;
          setLastReadMessageId(message.message_id);
        } else {
          newChatrooms[chatroomIndex].unreads += 1;
        }
        return newChatrooms;
      });
    };

    socket.on("chat/message", onChatMessage);

    return () => {
      socket.off("chat/message", onChatMessage);
    };
  }, [chatModal.chatroom, userInfo]);

  useEffect(() => {
    if (!lastReadMessageId) return;

    setTimeout(() => {
      lastReadMessageRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start", // Scroll to the bottom of the last read message
      });
    }, 500);
  }, [lastReadMessageId]);

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
          {messages.messages?.map((msg, index) => {
            const { user_id, message, sent_at, message_id } = msg;

            const dateTime = DateTime.fromSeconds(sent_at);
            let timeDisp;

            if (DateTime.now().hasSame(dateTime, "day")) {
              timeDisp = dateTime.toFormat("h:mm a");
            } else {
              timeDisp = dateTime.toFormat("M/d h:mm a");
            }

            const isNewLine =
              lastReadMessageId &&
              messages.messages[index - 1]?.message_id === lastReadMessageId;

            console.log(isNewLine, "newline", lastReadMessageId);

            //commented out my lastread line since my chat will never have new indicator since it's the sender
            if (user_id === userInfo.user_id) {
              return (
                <div
                  ref={(el) => {
                    //messageRefs.current[message_id] = el;
                    lastReadMessageRef.current = el;
                    if (Math.floor(messages.messages.length / 2) === index) {
                      inViewRef(el);
                    }
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
                    //messageRefs.current[message_id] = el;
                    lastReadMessageRef.current = el;
                    if (Math.floor(messages.messages.length / 2) === index) {
                      inViewRef(el);
                    }
                  }}
                  key={index}
                  className={styles.chatWrapper}
                >
                  {isNewLine ? (
                    <div className={styles.lastRead}>
                      <p>New</p>
                      <div className={styles.line}></div>
                    </div>
                  ) : null}
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
