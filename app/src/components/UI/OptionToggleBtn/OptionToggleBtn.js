import React, { useCallback, useEffect } from "react";
import styles from "./OptionToggleBtn.module.css";
import { randomIntInRange } from "../../../utils/Tool";

function OptionToggleBtn({ value, setValue, opt1, opt2, id=0 }) {

  const toggleValue = useCallback(() => {
    const newVal = value === opt1.val ? opt2.val : opt1.val;
    setValue(newVal);
  }, [opt1, opt2]);

  return (
    <div className={styles.OptionToggleBtn}>
      <input
        className={`${styles.tgl} ${styles.tglSkewed}`}
        id={id}
        type="checkbox"
        checked={value}
        onChange={() => {
          toggleValue();
        }}
      />
      <label
        className={styles.tglBtn}
        data-tg-off={opt1.name}
        data-tg-on={opt2.name}
        htmlFor={id}
      ></label>
    </div>
  );
}

export default OptionToggleBtn;