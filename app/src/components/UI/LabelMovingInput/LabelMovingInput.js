import styles from "./LabelMovingInput.module.css";
import React from 'react';

function  LabelMovingInput({ title, type, value, setValue, onEnter }) {
  return (
    <div className={styles.LabelMovingInput}>
      <form onKeyDown={(e) => {
        if (e.key == "Enter") {
          e.preventDefault();
        }
      }}>
        <input
          type={type}
          defaultValue={value}
          onChange={(e) => {
            setValue(e.target.value);
          }}
          onKeyDown={(e) => {
            if (e.key == "Enter" && onEnter) {
              onEnter();
            }
          }}
        />
        <label className={`${styles.label} ${value.length ? styles.hidden : ''}`}>{title}</label>
      </form>
    </div>
  );
}

export default LabelMovingInput;