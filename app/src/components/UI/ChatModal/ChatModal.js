import React from "react";
import styles from "./ChatModal.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark } from "@fortawesome/free-solid-svg-icons";
import SidebarToggleBtn from "../SidebarToggleBtn/SidebarToggleBtn";

function ChatModal(props) {
  const { setIsChatModal, isChatModal } = props;

  return (
    <div className={`${styles.ChatModal} ${isChatModal ? styles.open : ''}`}>
      <div className={styles.header}>
        <SidebarToggleBtn />
        <i onClick={() => { setIsChatModal(!isChatModal) }} className={styles.closeBtn}>
          <FontAwesomeIcon icon={faXmark} />
        </i>
      </div>
    </div>
  )
};

export default ChatModal;