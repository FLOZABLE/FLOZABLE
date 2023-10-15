import { useEffect, useState, useCallback } from "react";
import SendBtn from "../SendBtn/SendBtn";
import styles from "./ChatModal.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark } from "@fortawesome/free-solid-svg-icons";
import SidebarToggleBtn from "../SidebarToggleBtn/SidebarToggleBtn";

const serverOrigin = process.env.REACT_APP_ORIGIN;
function ChatModal({ socket, userInfo, myGroups }) {

  const [submit, setSubmit] = useState(false);
  const [msgInput, setMsgInput] = useState("");
  const [rooms, setRooms] = useState([]);
  const [isSidebar, setIsSidebar] = useState(false);
  const [roomsEl, setRoomsEl] = useState([]);
  const [chatGroups, setChatGroups] = useState([]);
  const [groupsEl, setGroupsEl] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [selectedRoom, setSelectedRoom] = useState(null);

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

  useEffect(() => {
    const onMsg = (group, room, msgInfo) => {
      console.log(group, room, msgInfo);
    };

    socket.on('msgReceived', onMsg);

    bringRooms();

    return () => {
      socket.off("msgReceived", onMsg);
    };
  }, []);

  useEffect(() => {
    if (submit) {
      console.log(msgInput, myGroups, rooms)
      //socket.emit('sendMsg', )
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
        console.log('group', groupInfo);
        return (
          <div className={styles.group} key={i}>
            <div className={styles.groupProfile} style={{ backgroundColor: groupInfo.color }} onClick={() => {setSelectedGroup(groupInfo)}}>
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
  }, [chatGroups, myGroups]);

  useEffect(() => {
    if (selectedGroup) {
      console.log(selectedGroup)
      const groupRooms = chatGroups.find(chatGroup => {return chatGroup.groupId === selectedGroup.group_id});
      console.log(groupRooms)
    }
  }, [selectedGroup]);

  return (
    <div className={styles.ChatModal}>
      <div className={styles.header}>
        <i className={styles.sidebarToggleBtn}>
          <SidebarToggleBtn isOpen={isSidebar} setIsOpen={setIsSidebar} />
        </i>
      </div>
      <div className={`${styles.sidebar} ${isSidebar ? styles.open : ''}`}>
        <div className={styles.header}>
          <i className={styles.sidebarToggleBtn}>
            <SidebarToggleBtn isOpen={isSidebar} setIsOpen={setIsSidebar} />
          </i>
        </div>
        <div className={styles.groupsWrapper}>
          <div className={styles.groups}>
            {groupsEl}
          </div>
          <div className={styles.rooms}>

          </div>
        </div>
      </div>
      <div className={styles.inputWrapper}>
        <input type="text" value={msgInput} onChange={(e) => setMsgInput(e.target.value)} />
        <SendBtn submit={submit} setSubmit={setSubmit} />
      </div>
    </div>
  )
};

export default ChatModal;