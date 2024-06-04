import React from "react";
import styles from "./BlobBtn.module.css";

function BlobBtn({
  onClick,
  color1 = "#fff",
  color2 = "#ecbd00",
  padding,
  id,
  children,
  style={}
}) {
  return (
    <div
      className={styles.BlobBtn}
      onClick={onClick}
      style={{ "--color1": color1, "--color2": color2, padding: padding, ...style }}
      id={id}
    >
      {children}
      <span className={styles.blobBtnInner}>
        <span className={styles.blobBtnBlobs}>
          <span className={styles.blobBtnBlob}></span>
          <span className={styles.blobBtnBlob}></span>
          <span className={styles.blobBtnBlob}></span>
          <span className={styles.blobBtnBlob}></span>
        </span>
      </span>
    </div>
  );
}

export default BlobBtn;
