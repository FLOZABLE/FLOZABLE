import styles from "./SimpleToggleBtn.module.css";
import generateRandomId from "../../../utils/RandomId";
import React from 'react';

function SimpleToggleBtn({ onToggle, checked, id = generateRandomId(10) }) {
  return (
    <div className={styles.SimpleToggleBtn}>
      <input
        className={`${styles.tgl} ${styles.tglIos}`}
        id={id}
        type="checkbox"
        defaultChecked={checked}
        onChange={(e) => {
          onToggle(e);
        }}
      />
      <label className={styles.tglBtn} htmlFor={id} />
    </div>
  );
}

export default SimpleToggleBtn;
