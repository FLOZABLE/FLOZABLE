import React, { useContext, useEffect, useState } from "react";
import styles from "./FriendLinkModal.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark } from "@fortawesome/free-solid-svg-icons";
import config from "@/app/utils/config";
import { FriendLink } from "@/app/utils/Svg";
import CopyBtn from "@/app/components/Buttons/CopyBtn/CopyBtn";
import { UserInfoContext } from "@/app/utils/Contexts";

function FriendLinkModal({ isOpen, setIsOpen }) {
  const { userInfo } = useContext(UserInfoContext);

  const [addFriendUrl, setAddFriendUrl] = useState("");

  useEffect(() => {
    if (!isOpen || addFriendUrl.length) return;

    fetch(`${config.server}/friends/link/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    })
      .then((res) => res.json())
      .then((res) => {
        if (res.success) {
          setAddFriendUrl(
            config.server +
              `/friends/link/add?user=${userInfo.user_id}&id=${res.linkId}`
          );
        }
      })
      .catch((error) => console.error(error));
  }, [isOpen]);

  return (
    <div className={`${styles.FriendLinkModal} modal ${isOpen ? "open" : ""}`}>
      <div className={styles.header}>
        <i
          onClick={() => {
            setIsOpen(false);
          }}
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
        Send this link to anyone and they will become your friend when they sign
        up.
      </p>
      <div className={styles.linkContainer}>
        <div className={`${styles.content} overflowDot`}>{addFriendUrl}</div>
        <CopyBtn text={addFriendUrl} />
      </div>
    </div>
  );
}

export default FriendLinkModal;
