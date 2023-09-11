import React from "react";
import styles from "./BlobBtn.module.css";

function BlobBtn(props) {
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
    <button className={styles.BlobBtn} onClick={handleClick}>
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