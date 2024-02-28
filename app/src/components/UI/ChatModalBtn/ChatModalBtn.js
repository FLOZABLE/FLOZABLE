import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import styles from "./ChatModalBtn.module.css";
import { faCommentDots } from "@fortawesome/free-solid-svg-icons";
import React, { useEffect } from "react";

function ChatModalBtn({setIsChatModal, bounce}) {

  return (
    <button className={styles.ChatModalBtn}
      onClick={() => {
        setIsChatModal(prev => !prev)
      }}
    >
      <i>
        <FontAwesomeIcon icon={faCommentDots} bounce={bounce}/>
      </i>
    </button>
  )
};

export default ChatModalBtn;