import React from "react";
import styles from "./CuteToggleButton.module.css";

function CuteToggleButton() {
  return (
    <div className={styles.CuteToggleButton}>
      <div class={styles.check}>
        <input id="check-5" type="checkbox" />
        <label for="check-5"></label>
      </div>
    </div>
  );
};

export default CuteToggleButton;