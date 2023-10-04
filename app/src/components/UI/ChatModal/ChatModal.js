import React, { useCallback, useEffect, useState, useRef } from "react";
import styles from "./ChatModal.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faComments, faSchool, faXmark } from "@fortawesome/free-solid-svg-icons";
import SidebarToggleBtn from "../SidebarToggleBtn/SidebarToggleBtn";
import SendBtn from "../SendBtn/SendBtn";
import CustomInput from "../CustomInput/CustomInput";

const serverOrigin = process.env.REACT_APP_SERVER_ORIGIN;

function ChatModal(props) {
  const { setIsChatModal, isChatModal, rooms, setGroupChats, socket, userInfo, allMembers, groups } = props;

  const [isSidebar, setIsSidebar] = useState(false);
  const [groupsEl, setGroupsEl] = useState(null);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [groupRoomsEl, setGroupRoomsEl] = useState(null);
  const [room, setRoom] = useState(null);
  const [message, setMessage] = useState("");
  const [send, setSend] = useState(false);
  const [messages, setMessages] = useState([]);

  const msgContainerRef = useRef(null);

  useEffect(() => {
    if (send) {
      socket.emit('sendMsg', selectedGroup.group_id, message);
    }
  }, [send]);

  useEffect(() => {
    const onMsg = (group, msgInfo) => {
      const isMe = msgInfo.u === userInfo.user_id;
      const date = new Date(msgInfo.t * 1000);
      const hr = date.getHours() % 12 ? date.getHours() % 12 : 12;
      const ampm = date.getHours() / 12 ? 'PM' : 'AM';
      const timeDisp = `${hr}:${date.getMinutes().toString().padStart(2, '0')}${ampm}`;
      let newChat = (
        <div className={`${styles.messageWrapper} ${styles.others}`} key={msgInfo.i}>
          <div className={styles.profileWrapper} style={{backgroundImage: `url("${serverOrigin}/profile-images/${userInfo.user_id}.jpeg")`}}>

          </div>
          <div className={styles.message}>
            <p>{msgInfo.m}</p>
          </div>
          <p className={styles.timeDisp}>{timeDisp}</p>
        </div>
      )
      if (!isMe) {
        newChat = (
          <div className={`${styles.messageWrapper} ${styles.me}`} key={msgInfo.i}>
            <div className={styles.message} >
              <p>{msgInfo.m}</p>
            </div>
            <p className={styles.timeDisp}>{timeDisp}</p>
          </div>
        )
      };
      /* if (group === selectedGroup) {

      } */
      setMessages((prevMessages) => [...prevMessages, newChat]);
    };
    socket.on('msgReceived', onMsg);

    return () => {
      socket.off("msgReceived", onMsg);
    };
  });

  useEffect(() => {
    console.log(groups)
    setGroupsEl(groups.map((group, i) => {
      return (
        <li className={styles.group} key={i} style={{ backgroundColor: group.color }} onClick={() => { setSelectedGroup(group) }}>
          {/* <div className={styles.bar}></div> */}
          <div className={styles.notifications}>1</div>
          <div className={styles.hoverEl}>
            <p>{group.name}</p>
          </div>
        </li>
      );
    }));
    /* if (groupChatRooms[0]) {
      setSelectedGroup(
        groupChatRooms[0]
      );
      setRoom('general');
    }; */
  }, [groups]);

  const roomChange = useCallback((room) => {
    setRoom(room);
    setIsSidebar(false);
  }, []);

  /*   useEffect(() => {
      
    }, []); */

  useEffect(() => {
    msgContainerRef.current.scrollTo({
      top: msgContainerRef.current.scrollHeight,
      behavior: 'smooth',
    });
  }, [messages]);

  useEffect(() => {
    if (room) {
      const newMessages = room.chats.map((chat, i) => {
        const msgInfo = JSON.parse(chat);
        const isMe = msgInfo.u === userInfo.user_id;
        const date = new Date(msgInfo.t * 1000);
        const hr = date.getHours() % 12 ? date.getHours() % 12 : 12;
        const ampm = date.getHours() / 12 ? 'PM' : 'AM';
        const timeDisp = `${hr}:${date.getMinutes().toString().padStart(2, '0')}${ampm}`;
        let newChat = (
          <div className={styles.messageWrapper} key={i}>
            <div className={styles.profileWrapper}>

            </div>
            <div className={styles.message}>
              <p>{msgInfo.m}</p>
            </div>
            <p className={styles.timeDisp}>{timeDisp}</p>
          </div>
        )
        if (isMe) {
          newChat = (
            <div className={`${styles.messageWrapper} ${styles.me}`} key={i}>
              <div className={styles.message}>
                <p>{msgInfo.m}</p>
              </div>
              <p className={styles.timeDisp}>{timeDisp}</p>
            </div>
          )
        };
        return newChat;
      });
      setMessages(newMessages);
    };
  }, [room]);

  const handleMessageInput = (e) => {
    setMessage(e.target.value);
  };


  useEffect(() => {
    console.log(rooms, 'ddd');
    const groupRooms = rooms.filter(room => {return room.group_id === selectedGroup.group_id});
    console.log(groupRooms);
    setGroupRoomsEl(
      <div className={styles.rooms}>
        <ul className={styles.roomTypes}>
          <li>
            <p className={styles.type}><FontAwesomeIcon icon={faComments} />TEXT CHANNELS</p>
            <ul className={styles.roomsContainer}>
              {groupRooms.map((room, i) => {
                return (
                  <li className={styles.room} key={i} onClick={() => { 
                    setRoom(room);
                    setIsSidebar(false);
                   }}>#{room.name}</li>
                )
              })}
            </ul>
          </li>
          <li>
            <p className={styles.type}><FontAwesomeIcon icon={faSchool} /> STUDY SESSION</p>
            <ul>
              <li className={styles.room}>tester1</li>
            </ul>
          </li>
        </ul>
      </div>
    );
    //setRoom(selectedGroup);
  }, [selectedGroup]);

  return (
    <div className={`${styles.ChatModal} ${isChatModal ? styles.open : ''}`}>
      <div className={styles.header}>
        <i className={styles.sidebarToggleBtn}>
          <SidebarToggleBtn isOpen={isSidebar} setIsOpen={setIsSidebar} />
        </i>
        <i onClick={() => { setIsChatModal(!isChatModal) }} className={styles.closeBtn}>
          <FontAwesomeIcon icon={faXmark} />
        </i>
      </div>
      <div className={`${styles.sidebar} ${isSidebar ? styles.open : ''}`}>
        <div className={styles.sidebarHeader}>
          <p className={styles.groupName}>
            {selectedGroup ? selectedGroup.name : ''}
          </p>
          <i className={styles.closeBtn} >
            <SidebarToggleBtn isOpen={isSidebar} setIsOpen={setIsSidebar} />
          </i>
        </div>
        <div className={styles.content}>
          <ul className={styles.groupContainer}>
            <li className={styles.dms}>
              <p>DM</p>
            </li>
            {groupsEl}
          </ul>
          {groupRoomsEl}
        </div>
      </div>
      <div className={`${styles.chatsContainer} customScroll`} ref={msgContainerRef} >
        {messages}
      </div>
      <div className={styles.messageInputContainer}>
        <CustomInput input={message} handleInput={handleMessageInput} handleEnter={() => { setSend(true); setTimeout(() => { setSend(false) }, 800) }} icon={null} type={"text"} />
        <SendBtn send={send} setSend={setSend} />
      </div>
    </div>
  )
};

export default ChatModal;