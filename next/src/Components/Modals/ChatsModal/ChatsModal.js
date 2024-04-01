import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import styles from "./ChatsModal.module.css";
import { faXmark } from "@fortawesome/free-solid-svg-icons";
import React, { useCallback, useContext, useEffect, useRef, useState } from "react";
import { DateTime } from "luxon";
import config from "@/utils/config";
import { GroupsContext, ModalsContext, UserInfoContext } from "@/utils/Contexts";
import Link from "next/link";
import ChatRoom from "@/Components/Chats/ChatRoom/ChatRoom";
import { socket } from "@/utils/socket";

function ChatsModal({
  setTotalNewMsg,
}) {
  const {userInfo} = useContext(UserInfoContext);
  const {myGroups} = useContext(GroupsContext);
  const {chatModal, setChatModal} = useContext(ModalsContext);

  const [chatRooms, setChatRooms] = useState([]);
  const [chatRoomsEl, setChatRoomsEl] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(false);
  const [msgInput, setMsgInput] = useState("");
  const [msgViewer, setMsgViewer] = useState([]);
  const [roomName, setRoomName] = useState("");
  const chatsContainerRef = useRef(null);
  const [roomMembers, setRoomMembers] = useState([]);
  const [readStatus, setReadStatus] = useState({});
  const moveRef = useRef(null);

  useEffect(() => {
    if (!myGroups) return;

    fetch(`${config.server}/chat/bring-rooms`, { method: "post" })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          setChatRooms(data.rooms);
          setReadStatus(data.readStatus);
        }
      })
      .catch((error) => console.error(error));
  }, [myGroups]);

  const onMsgReceived = useCallback(
    (roomId, msgInfo) => {
      const chatRoomIndex = chatRooms.findIndex((chatRoom) => {
        return chatRoom.id === roomId;
      });
      if (chatRoomIndex !== -1) {
        const newChatRooms = [...chatRooms];
        newChatRooms[chatRoomIndex].chats.push(msgInfo);
        setChatRooms(newChatRooms);
      }
      if (selectedRoom.id === roomId) {
        const { u, m, i, t } = msgInfo;
        const formattedTime = DateTime.fromSeconds(t * 60).toFormat("h:mm a");
        if (u === userInfo.user_id) {
          setMsgViewer((prevMsgViewer) => [
            ...prevMsgViewer,
            <li className={`${styles.msg} ${styles.me}`} key={i}>
              <p className={styles.time}>{formattedTime}</p>
              <p>{m}</p>
            </li>,
          ]);
        } else {
          const user = roomMembers.find((member) => {
            return member.user_id === u;
          });
          const { name } = user;
          setMsgViewer((prevMsgViewer) => [
            ...prevMsgViewer,
            <li className={`${styles.msg} ${styles.others}`} key={i}>
              <Link
                href={`/dashboard/user/${u}`}
                className={styles.profileImg}
                style={{
                  backgroundImage: `url("${config.server}/profile-images/${u}.jpeg")`,
                  backgroundSize: "cover",
                  backgroundPosition: "center center",
                  backgroundRepeat: "no-repeat",
                }}
              ></Link>
              <p className={styles.name}>{name}</p>
              <p className={styles.time}>{formattedTime}</p>
              <p>{m}</p>
            </li>,
          ]);
        }
      } else {
        setChatModal((prev) => ({...prev, totalNewMsg: prev.totalNewMsg + 1}));
      }
    },
    [userInfo, chatRooms, selectedRoom, roomMembers],
  );

  useEffect(() => {
    chatsContainerRef.current.scrollTo({
      top: chatsContainerRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [msgViewer]);

  useEffect(() => {
    socket.on("msgReceived", onMsgReceived);
    return () => {
      socket.off("msgReceived", onMsgReceived);
    };
  }, [chatRooms, selectedRoom, roomMembers]);

  const onSubmit = useCallback(() => {
    if (msgInput.length) {
      setMsgInput("");
      socket.emit("sendMsg", selectedRoom.id, msgInput);
    }
  }, [msgInput, selectedRoom]);

  useEffect(() => {
    if (!readStatus) return;
    setChatRoomsEl(
      [...chatRooms].map((chatRoom, i) => {
        //this means it's group chat room
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
              setSelectedRoom={setSelectedRoom}
              setRoomName={setRoomName}
              lastMsg={lastMsg}
              lastRead={lastRead}
              setTotalNewMsg={setTotalNewMsg}
              isSelected={selectedRoom.id === id}
            />
          );
        } else {
          if (!userInfo) return;
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
              setSelectedRoom={setSelectedRoom}
              setRoomName={setRoomName}
              lastMsg={lastMsg}
              lastRead={lastRead}
              setTotalNewMsg={setTotalNewMsg}
              isSelected={selectedRoom.id === id}
            />
          );
        }
      }),
    );
  }, [chatRooms, myGroups, roomMembers, userInfo, readStatus, selectedRoom]);

  useEffect(() => {
    const { chats, id, type } = selectedRoom;
    if (selectedRoom && chats && userInfo) {
      const { user_id } = userInfo;
      socket.emit("readMsg", { roomId: selectedRoom.id, type });
      if (!type) {
        fetch(`${config.server}/chat/members?roomId=${id}`, { method: "get" })
          .then((response) => response.json())
          .then((data) => {
            if (data.success) {
              const { membersInfo } = data;
              setRoomMembers([...membersInfo]);
              setMsgViewer(
                chats.map((msg) => {
                  const { u, m, i, t } = msg;
                  const formattedTime = DateTime.fromSeconds(t * 60).toFormat(
                    "h:mm a",
                  );
                  if (u === user_id) {
                    return (
                      <li className={`${styles.msg} ${styles.me}`} key={i}>
                        <p className={styles.time}>{formattedTime}</p>
                        <p>{m}</p>
                      </li>
                    );
                  } else {
                    const user = membersInfo.find((member) => {
                      return member.user_id === u;
                    });
                    const { name } = user;
                    return (
                      <li className={`${styles.msg} ${styles.others}`} key={i}>
                        <Link
                          to={`/dashboard/user/${u}`}
                          className={styles.profileImg}
                          style={{
                            backgroundImage: `url("${config.server}/profile-images/${u}.jpeg")`,
                            backgroundSize: "cover",
                            backgroundPosition: "center center",
                            backgroundRepeat: "no-repeat",
                          }}
                        ></Link>
                        <p className={styles.name}>{name}</p>
                        <p className={styles.time}>{formattedTime}</p>
                        <p>{m}</p>
                      </li>
                    );
                  }
                }),
              );
            }
          })
          .catch((error) => console.error(error));
      } else {
        const { members } = selectedRoom;
        setRoomMembers([...members]);
        setMsgViewer(
          chats.map((msg) => {
            const { u, m, i, t } = msg;
            const formattedTime = DateTime.fromSeconds(t * 60).toFormat(
              "h:mm a",
            );
            if (u === user_id) {
              return (
                <li className={`${styles.msg} ${styles.me}`} key={i}>
                  <p className={styles.time}>{formattedTime}</p>
                  <p>{m}</p>
                </li>
              );
            } else {
              const user = members.find((member) => {
                return member.user_id === u;
              });
              const { name } = user;
              return (
                <li className={`${styles.msg} ${styles.others}`} key={i}>
                  <Link
                    to={`/dashboard/user/${u}`}
                    className={styles.profileImg}
                    style={{
                      backgroundImage: `url("${config.server}/profile-images/${u}.jpeg")`,
                      backgroundSize: "cover",
                      backgroundPosition: "center center",
                      backgroundRepeat: "no-repeat",
                    }}
                  ></Link>
                  <p className={styles.name}>{name}</p>
                  <p className={styles.time}>{formattedTime}</p>
                  <p>{m}</p>
                </li>
              );
            }
          }),
        );
      }
    }
  }, [selectedRoom, userInfo]);

  return (
    <div className={`${styles.ChatsModal} ${chatModal.open ? styles.open : ""}`}
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
        {chatRoomsEl}
      </ul>
      <div
        className={`${styles.chatsWrapper} ${selectedRoom ? styles.open : ""
          }`}
      >
        <div className={styles.header}>
          <i
            id={styles.exitBtn}
            onClick={() => {
              setSelectedRoom(false);
            }}
          >
            <BackArrow />
          </i>
          <p>{roomName}</p>
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
          {msgViewer}
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

export default ChatsModal;