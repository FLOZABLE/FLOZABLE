import React from "react";
import styles from "./CheckBox.module.css";

function CheckBox(props) {
  const { id, checked } = props;

  return (
    <div className={styles.CheckBoxWrapper}>
      <input
        type="checkbox"
        className={styles.Checkbox}
        id={"id" + id}
        defaultChecked={checked}
      />
      <label htmlFor={"id" + id}>
        <div className={styles.tickMark}></div>
      </label>
    </div>
  );
}

export default CheckBox;