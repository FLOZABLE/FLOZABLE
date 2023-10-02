import React, { useState } from "react";
import styles from "./SendBtn.module.css";

function SendBtn(props) {
  const { send, setSend } = props;

  const handleSend = () => {
    setSend(true);
    setTimeout(() => {
      setSend(false);
    }, 800);
  };

  return (
    <div className={styles.SendBtn} onClick={() => { handleSend() }} >
      <button className={styles.btn}><img src="https://i.cloudup.com/gBzAn-oW_S-2000x2000.png" className={`${send ? styles.animation : ''}`} id="plane" /></button>
      <div className={`${styles.bg} ${send ? styles.animation2 : ''}`}><img src="https://i.cloudup.com/2ZAX3hVsBE-3000x3000.png" id="bg" /></div>
    </div>
  )
};

export default SendBtn;