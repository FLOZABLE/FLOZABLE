import { useEffect, useState, useCallback, useRef } from "react";
import SendBtn from "../SendBtn/SendBtn";
import styles from "./ChatModal.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCaretDown, faXmark } from "@fortawesome/free-solid-svg-icons";
import SidebarToggleBtn from "../SidebarToggleBtn/SidebarToggleBtn";

const serverOrigin = process.env.REACT_APP_ORIGIN;

const msg1Render = (msgInfo, timeDisp, i) => {
  return (
    <div className={`${styles.msgWrapper} ${styles.me}`} key={i}>
      <div className={styles.msg}>
        <p>{msgInfo.m}</p>
      </div>
      <p className={styles.timeDisp}>{timeDisp}</p>
    </div>
  );
};

const msg2Render = (user, msgInfo, timeDisp, i) => {
  return (
    <div className={`${styles.msgWrapper} ${styles.others}`} key={i}>
      <div className={styles.profileWrapper} style={{
        backgroundImage: `url("${serverOrigin}/profile-images/${user.user_id}.jpeg")`, backgroundSize: 'cover',
        backgroundPosition: 'center center',
        backgroundRepeat: 'no-repeat',
      }}>
      </div>
      <p className={styles.name} >{user.name}</p>
      <div className={styles.msg}>
        <p>{msgInfo.m}</p>
      </div>
      <p className={styles.timeDisp}>{timeDisp}</p>
    </div>
  );
};

const timeDiff = (changeDate, i) => {
  return (
    <div className={styles.dateChange} key={(i + 1) * (Math.random() + 1 * 100)}>
      <p>{changeDate.getMonth() + 1}/{changeDate.getDate()}</p>
    </div>
  )
}

function ChatModal({ socket, userInfo, myGroups, allMembers, isChatModal, setIsChatModal }) {

  const msgContainerRef = useRef(null);

  const [submit, setSubmit] = useState(false);
  const [msgInput, setMsgInput] = useState("");
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [isSidebar, setIsSidebar] = useState(false);
  const [roomsEl, setRoomsEl] = useState([]);
  const [chatGroups, setChatGroups] = useState([]);
  const [groupsEl, setGroupsEl] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [isChatRooms, setIsChatRooms] = useState(true);
  const [msg, setMsg] = useState([]);
  const [reset, setReset] = useState(0);

  const bringRooms = useCallback(() => {
    fetch(`${serverOrigin}/api/chat/bring-rooms`, { method: 'post' })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          console.log(data)
          setChatGroups(data.groupRooms);
        }
      })
      .catch((error) => console.error(error));
  }, []);

  const msgRenderer = useCallback((newMessages, chats, chat, type, i) => {
    const msgInfo = JSON.parse(chat);
    const isMe = msgInfo.u === userInfo.user_id;
    const date = new Date(msgInfo.t * 1000);
    const hr = date.getHours() % 12 ? date.getHours() % 12 : 12;
    const ampm = date.getHours() / 12 ? 'PM' : 'AM';
    const timeDisp = `${hr}:${date.getMinutes().toString().padStart(2, '0')}${ampm}`;
    let prevMsg = type && i ? JSON.parse(chats[i - 1]) : false;
    //prevMsg = prevMsgs && prevMsgs.length >= 2 ? prevMsgs[prevMsgs.length - 2] : false;
    /* if (prevMsgs && prevMsgs.length) {
      prevMsg = 
    } */
    const isDateChange = prevMsg ? new Date(prevMsg.t * 1000).setHours(0, 0, 0, 0) !== new Date(msgInfo.t * 1000).setHours(0, 0, 0, 0) : true;
    if (isDateChange && type) {
      const changeDate = new Date(msgInfo.t * 1000);
      newMessages.push(
        timeDiff(changeDate, i)
      )
    };
    let newChat;
    if (!isMe) {
      newChat = msg1Render(msgInfo, timeDisp, i)
    } else {
      const userInfo = allMembers.find(user => {return user.user_id === msgInfo.u });
      if (userInfo) {
        newChat = msg2Render(userInfo, msgInfo, timeDisp, i)
      }
    }
    newMessages.push(newChat);
    return newMessages;
  }, [userInfo, allMembers]);

  useEffect(() => {
    console.log('d')
    if (!userInfo) {
      return;
    };

    const bringChat = (data) => {
      const chats = data.chats;
      let newMessages = [];
      chats.map((chat, i) => {
        newMessages = msgRenderer(newMessages, chats, chat, 1, i);
      });
      setMsg(newMessages);
    };

    const joinMyGroups = (groups) => {
      setChatGroups(groups);
    }

    socket.on('bringChat', bringChat);
    socket.on('joinMyGroups', joinMyGroups);

    //bringRooms();

    return () => {
      socket.off("bringChat", bringChat);
      socket.off('joinMyGroups', joinMyGroups);
    };
  }, [userInfo, allMembers]);

  useEffect(() => {
    if (submit) {
      socket.emit('sendMsg', selectedGroup.group_id, selectedRoom.id, msgInput);
    }
  }, [submit]);

  useEffect(() => {
    const newChatGroups = [];
    const newDm = [];

    chatGroups.map(group => {
      if (group.groupId) {
        newChatGroups.push(group);
      } else {
        newDm.push(group);
      }
    });

    setGroupsEl(newChatGroups.map((group, i) => {
      const groupInfo = myGroups.find((groupInfo) => { return groupInfo.group_id === group.groupId });
      if (groupInfo) {
        return (
          <div className={styles.group} key={i}>
            <div className={styles.groupProfile} style={{ backgroundColor: groupInfo.color }} onClick={() => { setSelectedGroup(groupInfo) }}>
            </div>
            <div className={styles.notificationN}>
              <p>1</p>
            </div>
            <div className={styles.hoverEl}>
              {groupInfo.name}
            </div>
          </div>
        )
      };
    }));
    if (myGroups && myGroups[0]) {
      const defaultGroup = myGroups[0];
      setSelectedGroup(defaultGroup);
      const chatGroup = chatGroups.find(chatGroup => { return chatGroup.groupId === defaultGroup.group_id });
      if (chatGroup && chatGroup.rooms[0]) {
        const newRoom = chatGroup.rooms[0];
        setSelectedRoom({ ...newRoom });
      }
    };
  }, [chatGroups, myGroups]);

  useEffect(() => {
    if (selectedGroup) {
      const chatGroup = chatGroups.find(chatGroup => { return chatGroup.groupId === selectedGroup.group_id });
      if (chatGroup) {
        setRoomsEl(chatGroup.rooms.map((room, i) => {
          return (
            <div className={styles.roomContainer} key={i}>
              <div className={styles.type}>
                <p onClick={() => { setSelectedRoom(room) }}>#{room.name}</p>
              </div>
            </div>
          )
        })
        );
      }
    }
  }, [selectedGroup]);

  useEffect(() => {
    const onMsg = (group, room, msgInfo) => {
      console.log(room, selectedRoom)
      if (room === selectedRoom.id) {
        let newMessages = [];
        newMessages = msgRenderer([], [], JSON.stringify(msgInfo), 0, msgInfo.i, msg);
        console.log(newMessages)
        setMsg(prevMsg => [...prevMsg, ...newMessages]);
      }
    };
    //group not user
    console.log("new Room", selectedRoom)
    if (selectedGroup && selectedRoom) {
      socket.emit('bringChat', selectedGroup.group_id, selectedRoom.id);
    };
    socket.on('msgReceived', onMsg);

    return () => {
      socket.off("msgReceived", onMsg);
    };
  }, [selectedRoom]);

  useEffect(() => {
    msgContainerRef.current.scrollTo({
      top: msgContainerRef.current.scrollHeight,
      behavior: 'smooth',
    });
  }, [msg]);

  return (
    <div className={`${styles.ChatModal} ${isChatModal ? styles.isOpen : ''}`}>
      <div className={styles.header}>
        <i className={styles.sidebarToggleBtn}>
          <SidebarToggleBtn isOpen={isSidebar} setIsOpen={setIsSidebar} />
        </i>
        <i className={styles.closeBtn} onClick={() => {setIsChatModal(false)}}>
          <FontAwesomeIcon icon={faXmark} />
        </i>
      </div>
      <div className={`${styles.sidebar} ${isSidebar ? styles.open : ''}`}>
        <div className={styles.header}>
          <div className={styles.roomTitle}>
            {selectedGroup ? selectedGroup.name : ""}
          </div>
          <i className={styles.sidebarToggleBtn}>
            <SidebarToggleBtn isOpen={isSidebar} setIsOpen={setIsSidebar} />
          </i>
        </div>
        <div className={styles.groupsWrapper}>
          <div className={styles.groups}>
            {groupsEl}
          </div>
          <div className={styles.rooms}>
            <button className={styles.roomType} onClick={() => { setIsChatRooms(!isChatRooms) }}>
              Chat Rooms
              <i className={isChatRooms ? styles.clicked : ''}>
                <FontAwesomeIcon icon={faCaretDown} />
              </i>
            </button>
            {roomsEl}
          </div>
        </div>
      </div>
      <div className={`${styles.msgContainer} customScroll`} ref={msgContainerRef} >
        {msg}
      </div>
      <div className={styles.inputWrapper}>
        <input type="text" value={msgInput} onChange={(e) => setMsgInput(e.target.value)} />
        <SendBtn submit={submit} setSubmit={setSubmit} />
      </div>
    </div>
  )
};

export default ChatModal;