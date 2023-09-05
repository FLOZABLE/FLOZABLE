import React from "react";
import styles from "./CheckBox.module.css";

function CheckBox(props) {
  return (
    <div className={styles.CheckBoxWrapper}>
      <input id={props.id} type="checkbox" name="r" value="2" />
      <label id={props.id}>{props.text}</label>
      <div className={styles.info}>
        <p>dfd</p>
      </div>
    </div>
  );
};

export default CheckBox;