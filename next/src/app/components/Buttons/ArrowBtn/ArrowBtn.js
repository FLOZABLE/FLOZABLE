import React from "react";
import styles from "./ArrowBtn.module.css";
        
function ArrowBtn({
  onClick,
  color1 = "#ffffff",
  color2 = "var(--blue1)",
  id,
  children,
  style = {},
  disabled,
  type,
  ...otherProps
}) {
  return (
    <div
      className={styles.BlobBtn}
      onClick={(e) => {
        if (disabled) return;
        onClick ? onClick(e) : null;
      }}
      style={{ "--color1": color1, "--color2": color2, ...style }}
      id={id}
      type={type}
      {...otherProps}
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

export default ArrowBtn;
