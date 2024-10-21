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
import { socket } from "@/app/utils/socket";
import ChatRoom from "@/app/components/Chats/ChatRoom/ChatRoom";
import { DateTime } from "luxon";
import ChatContainer from "@/app/components/Chats/ChatContainer/ChatContainer";
import MyChatContainer from "@/app/components/Chats/MyChatContainer/MyChatContainer";
import {
  useChatMessages,
  useChatRoomMembers,
  useChatRooms,
} from "@/Hooks/chatHooks";
import { getChatMessages } from "@/Api/chatApi";

function ChatModal({}) {
  const { userInfo } = useContext(UserInfoContext);
  const { chatModal, setChatModal } = useContext(ModalsContext);

  const [chatrooms, setChatRooms] = useState([]);
  const [messages, setMessages] = useState([]);
  const [members, setMembers] = useState([]);
  const [msgInput, setMsgInput] = useState("");
  const [targetMessageId, setTargetMessageId] = useState(null);
  const [chatDataOptions, setChatDataOptions] = useState({
    offset: 0,
    length: 10,
    lastMsgId: null,
  });//this part has to be updated

  const moveRef = useRef(null);
  const chatsContainerRef = useRef(null);
  const messageRefs = useRef({});

  const { chatRoomsData } = useChatRooms();
  const { chatroomMembersData } = useChatRoomMembers(chatModal.chatroom);

  const { chatMessagesData } = useChatMessages({
    chatroomId: chatModal.chatroom,
    ...chatDataOptions,
  });

  //console.log("chatmessage", messages, chatrooms);

  useEffect(() => {
    if (!chatMessagesData?.success) return;

    setMessages(chatMessagesData.messages);
    console.log("1");
  }, [chatMessagesData]);

  useEffect(() => {
    if (!chatRoomsData?.success) return;

    setChatRooms(chatRoomsData.chatrooms);
  }, [chatRoomsData]);

  const onSubmit = useCallback(() => {
    socket.emit("chat/send", chatModal.chatroom, msgInput);
    setMsgInput("");
  }, [msgInput, chatModal.chatroom]);

  useEffect(() => {
    if (chatModal.chatroom) {
      socket.emit("chat/read", chatModal.chatroom);
      setChatRooms((prevChatrooms) => {
        const newChatrooms = [...prevChatrooms];
        const chatroomIndex = newChatrooms.findIndex(
          (chatroom) => chatroom.chatroom_id === chatModal.chatroom
        );
        if (chatroomIndex !== -1) {
          newChatrooms[chatroomIndex].unreads = 0;
        }
        return newChatrooms;
      });
    }
    console.log("2");

    const onChatMessage = (message) => {
      setTimeout(() => {
        if (chatsContainerRef.current) {
          chatsContainerRef.current.scrollTo({
            top: chatsContainerRef.current.scrollHeight,
            behavior: "smooth",
          });
        }
      }, 10);
      setChatRooms((prevChatrooms) => {
        let updatedChatrooms = [...prevChatrooms];
        const chatroomIndex = updatedChatrooms.findIndex(
          (chatroom) => chatroom.chatroom_id === message.chatroom_id
        );

        if (chatroomIndex !== -1) {
          const updatedChatroom = {
            ...updatedChatrooms[chatroomIndex],
            lastMsg: message,
          };
          updatedChatrooms = [
            updatedChatroom,
            ...updatedChatrooms.filter((_, idx) => idx !== chatroomIndex),
          ];
        }

        if (chatModal.chatroom === message.chatroom_id) {
          setMessages((prevMessages) => [...prevMessages, message]);
          socket.emit("chat/read", chatModal.chatroom);
          updatedChatrooms[chatroomIndex].lastRead = message.message_id;
        } else if (message.user_id !== userInfo?.user_id) {
          updatedChatrooms[0].unreads += 1;
        }

        return updatedChatrooms;
      });
    };

    socket.on("chat/message", onChatMessage);

    return () => {
      socket.off("chat/message", onChatMessage);
    };
  }, [chatModal.chatroom, userInfo]);

  useEffect(() => {
    if (!chatModal.chatroom) {
      chatsContainerRef.current?.scrollTo({
        top: chatsContainerRef.current.scrollHeight,
        behavior: "smooth",
      });
      return setTargetMessageId(null);
    }

    const newChatrooms = [...chatrooms];
    const chatroomIndex = newChatrooms.findIndex(
      (chatroom) => chatroom.chatroom_id === chatModal.chatroom
    );
    if (chatroomIndex === -1) return;

    const chatroom = newChatrooms[chatroomIndex];

    console.log("lastread", chatroom.lastRead, chatrooms);

    if (chatroom.lastRead) {
      setTargetMessageId(chatroom.lastRead);
      newChatrooms[chatroomIndex].lastRead = chatroom.lastMsg?.message_id;
      setChatRooms(newChatrooms);
    } else {
      setTargetMessageId(null);
      console.log("bottom");
      setTimeout(() => {
        if (chatsContainerRef.current) {
          chatsContainerRef.current.scrollTo({
            top: chatsContainerRef.current.scrollHeight,
            behavior: "smooth",
          });
        }
      }, 50);
    }
  }, [chatModal.chatroom]);

  useEffect(() => {
    if (!chatroomMembersData?.success) return;

    setMembers(chatroomMembersData.members);
  }, [chatroomMembersData]);

  useEffect(() => {
    // Scroll to the message with targetMessageId
    setTimeout(() => {
      console.log(
        "try scrooll",
        targetMessageId,
        messageRefs.current[targetMessageId]
      );
      if (targetMessageId && messageRefs.current[targetMessageId]) {
        console.log("scrooll");
        messageRefs.current[targetMessageId].scrollIntoView({
          behavior: "smooth",
          block: "start", // Scroll to the bottom of the last read message
        });
      }
    }, 200);
  }, [targetMessageId]);

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

            //since targeteMessageId is the last read message id, we have to compare last index's id
            const isNewLine =
              targetMessageId &&
              messages[index - 1]?.message_id === targetMessageId;

            //commented out my lastread line since my chat will never have new indicator since it's the sender
            if (user_id === userInfo.user_id) {
              return (
                <div
                  ref={(el) => (messageRefs.current[message_id] = el)}
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
                  ref={(el) => (messageRefs.current[message_id] = el)}
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
