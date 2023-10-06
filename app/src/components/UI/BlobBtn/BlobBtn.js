import React from "react";
import styles from "./BlobBtn.module.css";

function BlobBtn(props) {
  const {color1 = "#fff", color2 = "#ecbd00", opt = 0} = props;
  const { setClicked, name, delay } = props;
  const handleClick = () => {
    setClicked(true);
    if (!delay || delay !== -1) {
      setTimeout(() => {
        setClicked(false);
      }, 2000);
    };
  }
  return (
    <button className={`${styles.BlobBtn} ${opt ? styles.opt1 : '' }`} onClick={handleClick} style={{"--color1": color1 , "--color2": color2}}>
      {name}
      <span className={styles.blobBtnInner}>
        <span className={styles.blobBtnBlobs}>
          <span className={styles.blobBtnBlob}></span>
          <span className={styles.blobBtnBlob}></span>
          <span className={styles.blobBtnBlob}></span>
          <span className={styles.blobBtnBlob}></span>
        </span>
      </span>
    </button>
  );
};

export default BlobBtn;