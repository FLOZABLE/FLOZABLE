import React from 'react';
import styles from "./ToggleBtn.module.css";

function ToggleBtn(props) {
  return (
    <div className={styles.ToggleBtn}>
      <button onClick={props.onToggle} style={props.style}>
        <div>{props.content}{props.isToggled ? props.off : props.on}</div>   
      </button>
    </div>
  );
}

export default ToggleBtn;