import React, { useCallback } from "react";
import styles from "./OptionToggleBtn.module.css";

function OptionToggleBtn(props) {
  const {value, setValue, opt1, opt2} = props;

  const toggleValue = useCallback(() => {
    const newVal = value === opt1.val ? opt2.val : opt1.val;
    setValue(newVal);
  }, [opt1, opt2]);

  return (
    <div className={styles.OptionToggleBtn}>
        <input className={`${styles.tgl} ${styles.tglSkewed}`} id="cb38" type="checkbox" defaultChecked={true} onChange={() => {toggleValue()}}/>
        <label className={styles.tglBtn} data-tg-off={opt1.name} data-tg-on={opt2.name} htmlFor="cb38"></label>
    </div>
  );
};

export default OptionToggleBtn;