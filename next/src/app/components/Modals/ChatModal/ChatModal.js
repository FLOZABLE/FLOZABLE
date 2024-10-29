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
import { toast } from "react-toastify";

function ChatModal({}) {
  const { userInfo } = useContext(UserInfoContext);
  const { chatModal, setChatModal } = useContext(ModalsContext);

  const [chatrooms, setChatRooms] = useState([]);
  const [messages, setMessages] = useState([]);
  const [messageDataOptions, setMessageDataOptions] = useState({
    chatroomId: null,
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
  const [scrollBottom, setScrollBottom] = useState(0);
  //const debouncedScrollBottom = useDebounce(scrollBottom, 300);

  const { chatRoomsData } = useChatRooms();
  const { chatroomMembersData } = useChatRoomMembers(chatModal.chatroom);
  const { chatMessagesData, fetchNextPage, hasNextPage } =
    useChatMessages(messageDataOptions);

  const { ref: inViewRef, inView } = useInView();

  const scrollToBottom = useCallback((behavior = "instant") => {
    setTimeout(() => {
      console.log("scroll bottom");
      if (chatsContainerRef.current) {
        chatsContainerRef.current.scrollTo({
          top: chatsContainerRef.current.scrollHeight,
          behavior,
        });
      }
    }, 50);
  }, []);

  const onSubmit = useCallback(() => {
    socket.emit("chat/send", chatModal.chatroom, msgInput);
    setMsgInput("");
    scrollToBottom("smooth");
  }, [msgInput, chatModal.chatroom]);

  const onScroll = useCallback((event) => {
    const scrollBottom =
      event.target.scrollHeight -
      event.target.scrollTop -
      event.target.clientHeight;

    setScrollBottom(scrollBottom);
  }, []);

  useEffect(() => {
    if (!chatroomMembersData?.success) return;

    setMembers(chatroomMembersData.members);
  }, [chatroomMembersData]);

  useEffect(() => {
    if (!chatRoomsData?.success) return;

    setChatRooms(chatRoomsData.data.chatrooms);
  }, [chatRoomsData]);

  useEffect(() => {
    //console.log(inView, "gd", hasNextPage);
    if (inView && hasNextPage) {
      console.log("fetch");
      fetchNextPage();
    }
  }, [inView, fetchNextPage, hasNextPage]);

  useEffect(() => {
    if (!chatMessagesData?.pages) return;

    console.log(chatMessagesData);
    const allMessages = [];
    chatMessagesData.pages.map((page) => {
      if (!page?.success) return;

      allMessages.push(...page.data.messages);
    });
    /* const allMessages = chatMessagesData.pages.reduce((acc, page) => {
      if (page?.success) {
        return [...acc, ...page.messages];
      }
      return acc;
    }, []); */
    allMessages.sort((a, b) => a.sent_at - b.sent_at);

    const container = chatsContainerRef.current;
    const previousScrollHeight = container?.scrollHeight;
    const previousScrollTop = container?.scrollTop;

    setMessages(allMessages);
    if (chatsContainerRef.current) {
      console.log(
        "last scroll",
        chatsContainerRef.current.scrollHeight - scrollBottom
      );
      setTimeout(() => {
        const newScrollHeight = container.scrollHeight;
        const heightDifference = newScrollHeight - previousScrollHeight;
        container.scrollTop = previousScrollTop + heightDifference;
      }, 0);
    }
  }, [chatMessagesData]);

  useEffect(() => {
    scrollToBottom();
    if (chatModal.chatroom) {
      setMessageDataOptions((prev) => {
        const newMessageDataOptions = structuredClone(prev);
        const chatroom = chatrooms.find(
          (chatroom) => chatroom.chatroom_id === chatModal.chatroom
        );
        if (chatroom?.lastMsg) {
          newMessageDataOptions.lastMsgId = chatroom.lastMsg.message_id;
        }
        if (newMessageDataOptions.chatroomId === chatModal.chatroom) {
          return newMessageDataOptions;
        }
        newMessageDataOptions.chatroomId = chatModal.chatroom;
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
        console.log("lastread", lastRead);
        if (lastRead) {
          setTimeout(() => {
            console.log("trigger");
            setLastReadMessageId(lastRead);
          }, 100);
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
      scrollToBottom("smooth");
      setChatRooms((prev) => {
        const newChatrooms = [...prev];
        const chatroomIndex = newChatrooms.findIndex(
          (chatroom) => chatroom.chatroom_id === message.chatroom_id
        );
        if (chatroomIndex === -1) return prev;

        newChatrooms[chatroomIndex].lastMsg = message;

        if (chatModal.chatroom === message.chatroom_id) {
          setMessages((prev) => [...prev, message]);
          socket.emit("chat/read", chatModal.chatroom);
          newChatrooms[chatroomIndex].unreads = 0;
          newChatrooms[chatroomIndex].lastRead = message.message_id;
          setLastReadMessageId(message.message_id);
        } else {
          newChatrooms[chatroomIndex].unreads += 1;
          newChatrooms[chatroomIndex].lastMsg = message;
          toast.info(
            <div>
              {chatrooms[chatroomIndex].name}
              <br />"{message.message}"
            </div>
          );
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
    console.log("scrollintoview");
    setTimeout(() => {
      lastReadMessageRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start", // Scroll to the bottom of the last read message
      });
    }, 50);
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
          onScroll={onScroll}
        >
          {messages.map((msg, index) => {
            const { user_id, message, sent_at, message_id } = msg;

            const dateTime = DateTime.fromSeconds(sent_at);
            let timeDisp;

            if (DateTime.now().hasSame(dateTime, "day")) {
              timeDisp = dateTime.toFormat("h:mm a");
            } else {
              timeDisp = dateTime.toFormat("M/d h:mm a");
            }

            const isLastRead =
              lastReadMessageId &&
              messages[index - 1]?.message_id === lastReadMessageId;

            if (user_id === userInfo.user_id) {
              return (
                <div
                  ref={(el) => {
                    if (isLastRead) {
                      lastReadMessageRef.current = el;
                    }
                    if (index === 5) {
                      setTimeout(() => {
                        inViewRef(el);
                      }, 100);
                    }
                  }}
                  key={message_id}
                  className={styles.chatWrapper}
                >
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
                    if (isLastRead) {
                      lastReadMessageRef.current = el;
                    }
                    if (index === 5) {
                      setTimeout(() => {
                        inViewRef(el);
                      }, 100);
                    }
                  }}
                  key={message_id}
                  className={styles.chatWrapper}
                >
                  {isLastRead ? (
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
