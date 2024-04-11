import React from "react";
import styles from "./BlobBtn.module.css";

function BlobBtn({
  setClicked,
  name,
  delay = -1,
  color1 = "#fff",
  color2 = "#ecbd00",
  opt = 0,
  padding,
  id
}) {
  const handleClick = () => {
    setClicked(true);
    if (!delay || delay !== -1) {
      setTimeout(() => {
        setClicked(false);
      }, 2000);
    }
  };
  return (
    <button
      className={`${styles.BlobBtn} ${opt === 1 ? styles.opt1 : ""} ${
        opt === 2 ? styles.opt2 : ""
      }`}
      onClick={handleClick}
      style={{ "--color1": color1, "--color2": color2, padding: padding }}
      id={id}
    >
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
}

export default BlobBtn;
