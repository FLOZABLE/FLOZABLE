import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import styles from "./ChatsModal.module.css";
import { faXmark } from "@fortawesome/free-solid-svg-icons";
import { useEffect, useState } from "react";

const serverOrigin = process.env.REACT_APP_ORIGIN;

function ChatsModal({ }) {
  const [chatRooms, setChatRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(false);

  useEffect(() => {
    fetch(`${serverOrigin}/api/chat/bring-rooms`, { method: "post" })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          setChatRooms(data.groupRooms);
        }
      })
      .catch((error) => console.error(error));
  }, []);


  return (
    <div className={styles.ChatsModal}>
      <div className={styles.header}>
        <i>
          <FontAwesomeIcon icon={faXmark} />
        </i>
      </div>
      <div className={styles.content}>
      <ul className={styles.chatRoomsContainer}>
        <li
          className={styles.chatRoom}
        >
          <div className={styles.imgContainer}>

          </div>
          <div className={styles.roomInfo}
          onClick={() => {
            setSelectedRoom(true)
          }}
          >
            <div className={styles.roomName}>
              shdfsidf dfosd
              <strong>10</strong>
            </div>
            <div className={`${styles.lastMsg} ${selectedRoom ? styles.open : ''}`}>
              onggg
            </div>
          </div>
        </li>
      </ul>
      <ul className={styles.chatsContainer}>
          <li>
            sdfsdkfsdf
          </li>
        </ul>
      </div>
    </div>
  )
};

export default ChatsModal;