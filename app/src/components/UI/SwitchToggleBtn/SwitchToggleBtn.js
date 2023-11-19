import React from "react";
import styles from "./SwitchToggleBtn.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck, faXmark } from "@fortawesome/free-solid-svg-icons";

function SwitchToggleBtn() {
  return (
    <div className={styles.swithCheck}>
      <label className={`${styles.rocker} ${styles.rockerSize}`}>
        <input type="checkbox" />
        <span className={styles.switchLeft}>
          <FontAwesomeIcon icon={faCheck} />
        </span>
        <span className={styles.switchRight}>
          <FontAwesomeIcon icon={faXmark} />
        </span>
      </label>
    </div>
  );
}

export default SwitchToggleBtn;
