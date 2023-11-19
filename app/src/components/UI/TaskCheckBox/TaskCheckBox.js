import React from "react";
import styles from "./TaskCheckBox.module.css";

function TaskCheckBox({ id, text }) {
  return (
    <div className={styles.TaskCheckBoxWrapper}>
      <input id={id} type="checkbox" name="r" value="2" />
      <label id={id}>{text}</label>
      <div className={styles.info}>
        <p className={styles.time}>Eng, 12:45-1:30</p>
        <div className={`${styles.description} customScroll`}>
          Lorem, ipsum dolor sit amet consectetur adipisicing elit. Deleniti
          sunt fugiat ad asperiores, reprehenderit expedita ducimus enim veniam
          commodi explicabo aliquam ipsa natus atque autem quaerat tenetur
          accusamus dignissimos amet.
        </div>
      </div>
    </div>
  );
}

export default TaskCheckBox;
