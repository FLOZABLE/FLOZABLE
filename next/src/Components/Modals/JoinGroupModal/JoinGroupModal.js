"use client";

import { ModalsContext } from "@/utils/Contexts";
import styles from "./JoinGroupModal.module.css";
import { faXmark } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useContext } from "react";

function JoinGroupModal() {
  const {joinGroupModal, setJoinGroupModal} = useContext(ModalsContext);

  return (
    <div
      className={`${styles.JoinGroupModal} modal ${joinGroupModal.open ? "open" : ""}`}
    >
      <div className={styles.header}>
        <i
          onClick={() => {
            setJoinByLink(false);
            setIsOpen(false);
          }}
        >
          <FontAwesomeIcon icon={faXmark} />
        </i>
      </div>
    </div>
  )
};

export default JoinGroupModal;