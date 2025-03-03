import React, { useState } from "react";
import styles from "./LineInput.module.css";

function LineInput({ title, value, setValue, type, icon }) {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <div className={`${styles.LineInput} ${isFocused ? styles.focused : ""}`}>
      {icon ? <i className={styles.icon}>{icon}</i> : null}
      <input
        type={type}
        onFocus={() => {
          setIsFocused(true);
        }}
        onBlur={() => {
          setIsFocused(false);
        }}
        value={value}
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
