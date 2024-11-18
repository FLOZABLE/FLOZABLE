import styles from "./SimpleToggleBtn.module.css";
import React from "react";

function SimpleToggleBtn({ onToggle, checked, id, tutorial }) {
  return (
    <div
      className={styles.SimpleToggleBtn}
      onClick={onToggle}
      data-tutorial={tutorial}
    >
      <input
        className={`${styles.tgl} ${styles.tglIos}`}
        id={id}
        type="checkbox"
        checked={checked}
        onClick={(e) => e.preventDefault()}
        onChange={() => {}}
      />
      <label
        className={styles.tglBtn}
        htmlFor={id}
        onClick={(e) => e.preventDefault()}
      />
    </div>
  );
}

export default SimpleToggleBtn;
