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
import { useChatroomMembers, useChatRooms } from "@/Hooks/chatroomsHooks";
import { getChatMessages } from "@/Api/chatApi";

function ChatModal({}) {
  const { userInfo } = useContext(UserInfoContext);
  const { chatModal, setChatModal } = useContext(ModalsContext);

  const [chatrooms, setChatRooms] = useState([]);
  const [messages, setMessages] = useState([]);
  const [members, setMembers] = useState([]);
  const [msgInput, setMsgInput] = useState("");
  const [targetMessageId, setTargetMessageId] = useState("");

  const moveRef = useRef(null);
  const chatsContainerRef = useRef(null);
  const messageRefs = useRef({});

  const { chatRoomsData } = useChatRooms(userInfo);
  const { chatroomMembersData } = useChatroomMembers(chatModal.chatroom);

  useEffect(() => {
    if (!chatRoomsData?.success) return;

    setChatRooms(chatRoomsData.chatrooms);
  }, [chatRoomsData]);

  const onSubmit = useCallback(() => {
    socket.emit("chat/send", chatModal.chatroom, msgInput);
    setMsgInput("");
  }, [msgInput, chatModal.chatroom]);

  useEffect(() => {
    (async () => {
      if (!chatModal.chatroom) return;

      const data = await getChatMessages(chatModal.chatroom);
      if (!data.success) return;

      socket.emit("chat/read", chatModal.chatroom);
      setMessages(data.messages);

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
    })();

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
          (chatroom) => chatroom.chatroom_id === message.r
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

        if (chatModal.chatroom === message.r) {
          setMessages((prevMessages) => [...prevMessages, message]);
          socket.emit("chat/read", chatModal.chatroom);
          updatedChatrooms[chatroomIndex].lastRead = message.i;
        } else if (message.u !== userInfo?.user_id) {
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
    if (!chatModal.chatroom) return;

    const newChatrooms = [...chatrooms];
    const chatroomIndex = newChatrooms.findIndex(
      (chatroom) => chatroom.chatroom_id === chatModal.chatroom
    );
    if (chatroomIndex === -1) return;

    const chatroom = newChatrooms[chatroomIndex];

    console.log("lastread", chatroom.lastRead, chatrooms);

    if (chatroom.lastRead) {
      setTargetMessageId(chatroom.lastRead);
      newChatrooms[chatroomIndex].lastRead = chatroom.lastMsg?.i;
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
      if (targetMessageId && messageRefs.current[targetMessageId]) {
        messageRefs.current[targetMessageId].scrollIntoView({
          behavior: "smooth",
          block: "start", // Scroll to the top of the message
        });
      }
    }, 50);
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
            const { u, m, t } = msg;

            const dateTime = DateTime.fromSeconds(t);
            let timeDisp;

            if (DateTime.now().hasSame(dateTime, "day")) {
              timeDisp = dateTime.toFormat("h:mm a");
            } else {
              timeDisp = dateTime.toFormat("M/d h:mm a");
            }

            if (u === userInfo.user_id) {
              return (
                <div
                  ref={(el) => (messageRefs.current[msg.i] = el)}
                  key={index}
                >
                  <MyChatContainer time={timeDisp} m={m} />
                </div>
              );
            } else {
              const user = members.find((member) => {
                return member.user_id === u;
              });
              return (
                <div
                  ref={(el) => (messageRefs.current[msg.i] = el)}
                  key={index}
                >
                  <ChatContainer userInfo={user} time={timeDisp} m={m} />
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
