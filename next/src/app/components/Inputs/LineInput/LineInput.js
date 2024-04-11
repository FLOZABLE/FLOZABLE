import React, { useState } from "react";
import styles from "./LineInput.module.css";

function LineInput({ title, value, setValue, type}) {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <div className={styles.LineInput}>
      <input
        type={type}
        onFocus={() => {
          setIsFocused(true);
        }}
        onBlur={() => {
          setIsFocused(false);
        }}
        defaultValue={value}
        onChange={(e) => {
          setValue(e.target.value);
        }}
      />
      {title ? <div className={styles.title}>{title}</div> : ""}
      <div
        className={`${styles.lineContainer} ${isFocused ? styles.focused : ""}`}
      >
        <div className={`${styles.line} ${styles.left}`}></div>
        <div className={`${styles.line} ${styles.right}`}></div>
      </div>
    </div>
  );
}

export default LineInput;