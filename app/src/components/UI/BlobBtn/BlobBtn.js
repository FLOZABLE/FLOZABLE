import React from "react";
import styles from "./BlobBtn.module.css";

function BlobBtn(props) {
  const handleClick = () => {
    props.setClicked(true);
    setTimeout(() => {
      props.setClicked(false);
    }, 2000);
  }
  return (
    <button className={styles.BlobBtn} onClick={handleClick}>
        {props.name}
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