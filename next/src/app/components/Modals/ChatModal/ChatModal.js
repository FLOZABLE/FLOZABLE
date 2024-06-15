"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import styles from "./ChatModal.module.css";
import { faXmark } from "@fortawesome/free-solid-svg-icons";
import React, { useCallback, useContext, useEffect, useRef, useState } from "react";
import { ChatsContext, GroupsContext, ModalsContext, UserInfoContext } from "@/app/utils/Contexts";
import { BackArrow } from "@/app/utils/Svg";
import config from "@/app/utils/config";
import SendBtn from "@/app/components/Buttons/SendBtn/SendBtn";
import { socket } from "@/app/utils/socket";
import ChatRoom from "@/app/components/Chats/ChatRoom/ChatRoom";
import { DateTime } from "luxon";
import ChatContainer from "@/app/components/Chats/ChatContainer/ChatContainer";
import MyChatContainer from "@/app/components/Chats/MyChatContainer/MyChatContainer";

function ChatModal({
}) {
  const { userInfo } = useContext(UserInfoContext);
  const { chatModal, setChatModal } = useContext(ModalsContext);
  const { myGroups } = useContext(GroupsContext);

  const [selectedRoom, setSelectedRoom] = useState(null);
  const [chatRooms, setChatRooms] = useState([]);
  const [readStatus, setReadStatus] = useState({});
  const [msgInput, setMsgInput] = useState("");

  useEffect(() => {
    fetch(`${config.server}/chat/bring-rooms`, { method: "POST", credentials: "include" })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          setChatRooms(data.rooms);
          setReadStatus(data.readStatus);

          let totalNewMsg = 0;
          data.rooms.map((room) => {
            const lastRead = data.readStatus[room.id];
            const [lastReadMsg, lastMsgTime] = lastRead ? lastRead.split(":") : [null, null];
            const lastMsgIndex = room.chats.findIndex(chat => {
              return chat.i === lastReadMsg;
            });
            if (lastMsgIndex === -1) return;
            const newMsgs = room.chats.length - lastMsgIndex - 1;
            totalNewMsg += newMsgs;
          });
          setChatModal((prev) => ({...prev, totalNewMsg }));
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


  const onMsgReceived = useCallback(
    (roomId, msgInfo) => {
      const chatRoomIndex = chatRooms.findIndex((chatRoom) => {
        return chatRoom.id === roomId;
      });
      if (chatRoomIndex !== -1) {
        const newChatRooms = JSON.parse(JSON.stringify(chatRooms));
        newChatRooms[chatRoomIndex].chats.push(msgInfo);
        /* if (selectedRoom.id !== roomId) {
          newChatRooms[chatRoomIndex].
        }; */
        setChatRooms(newChatRooms);
      };
      if (selectedRoom?.id !== roomId || !selectedRoom) {
        setChatModal((prev) => ({ ...prev, totalNewMsg: prev.totalNewMsg + 1 }));
      };
    },
    [chatRooms, selectedRoom]
  );

  useEffect(() => {
    socket.on("msgReceived", onMsgReceived);
    chatsContainerRef.current.scrollTo({
      top: chatsContainerRef.current.scrollHeight,
      behavior: "smooth",
    });
    if (selectedRoom?.id) {
      const chatRoom = chatRooms.find(room => room.id === chatModal.chatRoom);
      if (chatRoom) {
        socket.emit("readMsg", { roomId: selectedRoom.id, type: chatRoom.type });
      };
    }
    return () => {
      socket.off("msgReceived", onMsgReceived);
    };
  }, [chatRooms, selectedRoom]);

  useEffect(() => {
    if (!chatModal.chatRoom) return;

    const chatRoom = chatRooms.find((room) => room.id === chatModal.chatRoom);
    if (!chatRoom) return;

    const { type, id, chats, members } = chatRoom;
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

      fetch(`${config.server}/chat/members?roomId=${id}`, { method: "get", credentials: "include" })
        .then((response) => response.json())
        .then((data) => {
          if (data.success) {
            const { membersInfo } = data;
            setSelectedRoom({ ...chatRoom, members: membersInfo });
          }
        })
        .catch((error) => console.error(error));
    } else {
      chatRoom.name = members.map((member) => { return member.name; }).join(",");
      chatRoom.color = "var(--purple)";
      setSelectedRoom(chatRoom);
    };
  }, [chatModal.chatRoom, myGroups, chatRooms]);

  return (
    <div className={`${styles.ChatModal} ${chatModal.open ? styles.open : ""}`}
      ref={moveRef}
    >
      <div className={styles.header}>
        <i
          onClick={() => {
            setChatModal(prev => ({ ...prev, open: true }));
          }}>
          <BackArrow />
        </i>
        <p>Messages</p>
        <i
          onClick={() => {
            setChatModal(prev => ({ ...prev, open: false }));
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
                readStatus={readStatus}
                setReadStatus={setReadStatus}
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
                readStatus={readStatus}
                setReadStatus={setReadStatus}
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
              setChatModal(prev => ({ ...prev, chatRoom: false }));
              setSelectedRoom(null);
            }}
          >
            <BackArrow />
          </i>
          <p>{selectedRoom?.name}</p>
          <i
            id={styles.closeBtn}
            onClick={() => {
              setChatModal(prev => ({ ...prev, open: false }));
            }}
          >
            <FontAwesomeIcon icon={faXmark} />
          </i>
        </div>
        <ul
          className={`${styles.chatsContainer} customScroll`}
          ref={chatsContainerRef}
        >
          {
            selectedRoom?.chats?.map((msg) => {
              const { u, m, i, t } = msg;
              const formattedTime = DateTime.fromSeconds(t * 60).toFormat(
                "h:mm a",
              );
              if (u === userInfo.user_id) {
                return (
                  <MyChatContainer
                    time={formattedTime}
                    m={m}
                    key={i}
                  />
                );
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
            })
          }

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