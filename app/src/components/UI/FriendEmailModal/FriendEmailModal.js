import React, { useEffect, useState } from "react";
import { EmailInvitation, FriendLink } from "../../../utils/svgs";
import CopyBtn from "../CopyBtn/CopyBtn";
import styles from "./FriendEmailModal.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark } from "@fortawesome/free-solid-svg-icons";
import SendBtn from "../SendBtn/SendBtn";

const serverOrigin = process.env.REACT_APP_ORIGIN;

function FriendEmailModal({ isOpen, setIsOpen }) {

  const [email, setEmail] = useState("");

  useEffect(() => {
    if (!isOpen) return;

    fetch(`${serverOrigin}/friend/email-invitation`, {
      method: "post",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((res) => res.json())
      .then((res) => {
        if (res.success) {
        }
      })
      .catch((error) => console.error(error));
  }, [isOpen]);

  return (
    <div className={`${styles.FriendEmailModal} modal ${isOpen ? "open" : ''}`}>
      <div className={styles.header}>
        <i
          onClick={() => { setIsOpen(false) }}
        >
          <FontAwesomeIcon icon={faXmark} />
        </i>
      </div>
      <div className={styles.iconZone}>
        <i>
          <EmailInvitation />
        </i>
      </div>
      <p className={styles.title}>Email Invite</p>
      <p className={styles.explanation}>
        Invite a friend to join you on FLOZABLE and study together!
      </p>
      <div className={styles.emailContainer}>
        <input type="text" name="" id="" onChange={(e) => {setEmail(e.target.value)}}/>
        <div className={styles.sendBtnWrapper}>
          <SendBtn onSubmit={() => {
            fetch(`${serverOrigin}/friend/email-invitation`, {
              method: "post",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({email})
            })
              .then((res) => res.json())
              .then((res) => {
              })
              .catch((error) => console.error(error));
          }} />
        </div>
      </div>
    </div>
  )
};

export default FriendEmailModal;