import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import styles from"./CustomInput.module.css";

function CustomInput(props) {
  const handleEnterKeyPress = (event) => {
    if (event.key === 'Enter') {
      props.handleEnter();
    }
  };
  return (
    <div className={styles.CustomInput}>
    <span className={styles.pwIcon}>
      <i>
        <FontAwesomeIcon icon={props.icon} />
      </i>
    </span>
    <input
      className={styles.formField}
      value={props.input}
      onChange={props.handleInput}
      type={props.type}
      onKeyDown={handleEnterKeyPress}
      placeholder={props.placeholder}
    />
    </div>
  )
};

export default CustomInput;