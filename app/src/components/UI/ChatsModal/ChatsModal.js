import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import styles from "./ChatsModal.module.css";
import { faChevronLeft, faXmark } from "@fortawesome/free-solid-svg-icons";
import { useCallback, useEffect, useRef, useState } from "react";
import SendBtn from "../SendBtn/SendBtn";
import { DateTime } from "luxon";
import { Link } from "react-router-dom";

const serverOrigin = process.env.REACT_APP_ORIGIN;

function ChatsModal({ socket, isChatModal, setIsChatModal, myGroups, userInfo }) {
  const [chatRooms, setChatRooms] = useState([]);
  const [chatRoomsEl, setChatRoomsEl] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(false);
  const [msgInput, setMsgInput] = useState("");
  const [msgViewer, setMsgViewer] = useState([]);
  const [roomName, setRoomName] = useState("");
  const chatsContainerRef = useRef(null);
  const [roomMembers, setRoomMembers] = useState([]);

  useEffect(() => {
    fetch(`${serverOrigin}/api/chat/bring-rooms`, { method: "post" })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          setChatRooms(data.rooms);
        }
      })
      .catch((error) => console.error(error));
  }, []);

  const onMsgReceived = useCallback((roomId, msgInfo) => {
    const chatRoomIndex = chatRooms.findIndex(chatRoom => { return chatRoom.id === roomId });
    if (chatRoomIndex !== -1) {
      const newChatRooms = [...chatRooms];
      newChatRooms[chatRoomIndex].chats.push(JSON.stringify(msgInfo));
      setChatRooms(newChatRooms);
    };
    if (selectedRoom.id === roomId) {
      const { u, m, i, t } = msgInfo;
      const formattedTime = DateTime.fromSeconds(t * 60).toFormat('h:mm a');
      if (u === userInfo.user_id) {
        setMsgViewer(prevMsgViewer => [
          ...prevMsgViewer,
          <li className={`${styles.msg} ${styles.me}`} key={i}>
            <p className={styles.time}>{formattedTime}</p>
            <p>{m}</p>
          </li>
        ]);
      } else {
        const user = roomMembers.find(member => { return member.user_id === u });
        const { name } = user;
        setMsgViewer(prevMsgViewer => [
          ...prevMsgViewer,
          <li className={`${styles.msg} ${styles.others}`} key={i}>
            <Link 
            to={`/dashboard/user/${u}`}
            className={styles.profileImg}
              style={{
                backgroundImage: `url("${serverOrigin}/profile-images/${u}.jpeg")`,
                backgroundSize: 'cover',
                backgroundPosition: 'center center',
                backgroundRepeat: 'no-repeat',
              }}>
            </Link>
            <p className={styles.name}>{name}</p>
            <p className={styles.time}>{formattedTime}</p>
            <p>{m}</p>
          </li>
        ]);
      };
    };
  }, [userInfo, chatRooms, selectedRoom, roomMembers]);

  useEffect(() => {
    chatsContainerRef.current.scrollTo({
      top: chatsContainerRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [msgViewer]);

  useEffect(() => {
    socket.on('msgReceived', onMsgReceived);
    return () => {
      socket.off('msgReceived', onMsgReceived);
    }
  }, [chatRooms, selectedRoom, roomMembers]);

  const onSubmit = useCallback(() => {
    if (msgInput.length) {
      setMsgInput("");
      socket.emit(
        "sendMsg",
        selectedRoom.id,
        msgInput,
      );
    }
  }, [msgInput, selectedRoom]);

  useEffect(() => {
    setChatRoomsEl(
      chatRooms.map((chatRoom, i) => {
        //this means it's group chat room
        const { type, id, members } = chatRoom;
        if (!type) {
          const group = myGroups.find(group => { return group.group_id === id });
          if (!group) return;
          const { members, group_id, name, color } = group;
          return (
            <li
              className={styles.chatRoom}
              key={i}
            >
              <div className={styles.imgContainer} style={{ backgroundColor: color }}>
              </div>
              <div className={styles.roomInfo}
                onClick={() => {
                  setSelectedRoom(chatRoom);
                  setRoomName(name);
                }}
              >
                <div className={styles.roomName}>
                  {name}
                  <strong>{members.length}</strong>
                </div>
                <div className={styles.newMsgCount}>
                  {/* 10 new messages */}
                </div>
              </div>
            </li>
          )
        } else {
          const users = members.map(member => {
            return roomMembers.find(user => {return user.user_id === member});
          });
          if (!userInfo) return;
          return (
            <li
              className={styles.chatRoom}
              key={i}
            >
              <div className={styles.imgContainer}>
              </div>
              <div className={styles.roomInfo}
                onClick={() => {
                  setSelectedRoom(chatRoom);
                  setRoomName(users.map(user => {return user ? user.name : null}));
                }}
              >
                <div className={styles.roomName}>
                  {users.map(user => {return user ? user.name : null})}
                  <strong>{members.length}</strong>
                </div>
                <div className={styles.newMsgCount}>
                  {/* 10 new messages */}
                </div>
              </div>
            </li>
          )
        }
      })
    );
  }, [chatRooms, myGroups, roomMembers, userInfo]);

  useEffect(() => {
    const {chats, id} = selectedRoom;
    if (selectedRoom && chats && userInfo) {
      const {user_id} = userInfo;
      fetch(`${serverOrigin}/api/chat/members?roomId=${id}`, { method: "get" })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          const {membersInfo} = data;
          setRoomMembers([...membersInfo]);
          setMsgViewer(chats.map((msg) => {
            const { u, m, i, t } = JSON.parse(msg);
            const formattedTime = DateTime.fromSeconds(t * 60).toFormat('h:mm a');
            if (u === user_id) {
              return (
                <li className={`${styles.msg} ${styles.me}`} key={i}>
                  <p className={styles.time}>{formattedTime}</p>
                  <p>{m}</p>
                </li>
              )
            } else {
              const user = membersInfo.find(member => { return member.user_id === u });
              const { name } = user;
              return (
                <li className={`${styles.msg} ${styles.others}`} key={i}>
                  <Link to={`/dashboard/user/${u}`}
                   className={styles.profileImg}
                    style={{
                      backgroundImage: `url("${serverOrigin}/profile-images/${u}.jpeg")`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center center',
                      backgroundRepeat: 'no-repeat',
                    }}>
                  </Link>
                  <p className={styles.name}>{name}</p>
                  <p className={styles.time}>{formattedTime}</p>
                  <p>{m}</p>
                </li>
              )
            };
          }));
        }
      })
      .catch((error) => console.error(error));
    };
  }, [selectedRoom, userInfo]);

  return (
    <div className={`${styles.ChatsModal} ${isChatModal ? styles.open : ''}`}>
      <div className={styles.header}>
        <i onClick={() => {
          setIsChatModal(false);
        }}>
          <FontAwesomeIcon icon={faXmark} />
        </i>
      </div>
      <div className={styles.content}>
        <ul className={`${styles.chatRoomsContainer} customScroll`}>
          {chatRoomsEl}
        </ul>
        <div className={`${styles.chatsWrapper} ${selectedRoom ? styles.open : ''}`}>
          <div className={styles.chatsHeader}>
            <i id={styles.exitBtn} onClick={() => {
              setSelectedRoom(false);
            }}>
              <FontAwesomeIcon icon={faChevronLeft} />
            </i>
            <div className={styles.roomInfo}>
              {/* <div className={styles.imgContainer}>

              </div> */}
              <div className={styles.roomName}>
                <p>{roomName}</p>
              </div>
            </div>
            <i id={styles.closeBtn} onClick={() => {
              setIsChatModal(false);
            }}>
              <FontAwesomeIcon icon={faXmark} />
            </i>
          </div>
          <ul className={`${styles.chatsContainer} customScroll`} ref={chatsContainerRef}>
            {msgViewer}
          </ul>
          <div className={styles.inputWrapper}>
            <input
              type="text"
              value={msgInput}
              onKeyDown={(e) => {

              }}
              onChange={(e) => setMsgInput(e.target.value)}
            />
            <SendBtn onSubmit={onSubmit} />
          </div>
        </div>
      </div>
    </div>
  )
};

export default ChatsModal;