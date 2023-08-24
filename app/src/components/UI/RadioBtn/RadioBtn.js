import React from "react";
import styles from "./RadioBtn.module.css";

function RadioBtn(props) {
  const radioElements = props.items.map((item, index) => {
    return (
      <div className={styles.selectorItem} key={index}>
      <input
        type="radio"
        id={"radio" + index}
        name="selector"
        className={styles.selectorItemRadio}
        onClick={() => {
          props.changeEvent(item);
          console.log('changed');
        }}
        defaultChecked={props.defaultViewer == index}
      />
      <label htmlFor={"radio" + index} className={styles.selectorItemLabel}>
        {item}
      </label>
    </div>
    )
  })
  return (
    <div className={styles.RadioBtnContainer}>
      <div className={styles.container}>
      <div className={styles.selector}>
        {radioElements}
      </div>
      </div>
    </div>
  );
};

export default RadioBtn;