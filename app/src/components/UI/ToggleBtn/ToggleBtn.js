import React from "react";
import styles from "./ToggleBtn.module.css";

function ToggleBtn({ onToggle, style, content, isToggled, off, on }) {
  return (
    <div className={styles.ToggleBtn}>
      <button onClick={onToggle} style={style}>
        <div>
          {content}
          {isToggled ? off : on}
        </div>
      </button>
    </div>
  );
}

export default ToggleBtn;
