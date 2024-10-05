import { generateRandomId } from "@/app/utils/Tool";
import styles from "./SimpleToggleBtn.module.css";
import React from "react";

function SimpleToggleBtn({
  onToggle,
  checked,
  id = generateRandomId(10),
  tutorial,
}) {
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
      />
      <label className={styles.tglBtn} htmlFor={id} />
    </div>
  );
}

export default SimpleToggleBtn;
