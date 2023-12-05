import { useEffect, useState } from "react";
import { FriendLink } from "../../../utils/svgs";
import CopyBtn from "../CopyBtn/CopyBtn";
import styles from "./FriendLinkModal.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark } from "@fortawesome/free-solid-svg-icons";

const serverOrigin = process.env.REACT_APP_ORIGIN;

function FriendLinkModal({ isOpen, setIsOpen, userInfo }) {
  const [addFriendUrl, setAddFriendUrl] = useState("");

  useEffect(() => {
    if (!userInfo) return;
    setAddFriendUrl(serverOrigin + `/friend/add?${userInfo.user_id}`);
  }, [userInfo]);
  return (
    <div className={`${styles.FriendLinkModal} modal ${isOpen ? "open" : ''}`}>
      <div className={styles.header}>
        <i
          onClick={() => {setIsOpen(false)}}
        >
          <FontAwesomeIcon icon={faXmark} />
        </i>
      </div>
      <div className={styles.iconZone}>
        <i>
          <FriendLink />
        </i>
      </div>
      <p className={styles.title}>Friend Link</p>
      <p className={styles.explanation}>
        Send this link to anyone, and they will become your friend when they sign up.
      </p>
      <div className={styles.linkContainer}>
        <div className={styles.content}>
          {addFriendUrl}
        </div>
        <CopyBtn 
          text={addFriendUrl}
        />
      </div>
    </div>
  )
};

export default FriendLinkModal;