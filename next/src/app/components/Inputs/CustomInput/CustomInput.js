import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import styles from "./CustomInput.module.css";

function CustomInput({
  handleEnter = () => {},
  handleInput,
  input,
  icon,
  type,
  placeHolder,
}) {
  const handleEnterKeyPress = (event) => {
    if (event.key === "Enter") {
      handleEnter(event);
    }
  };
  return (
    <div className={styles.CustomInput}>
      <span className={styles.pwIcon}>
        <i>{icon ? <FontAwesomeIcon icon={icon} /> : null}</i>
      </span>
      <input
        className={styles.formField}
        value={input}
        onChange={handleInput}
        type={type}
        onKeyDown={handleEnterKeyPress}
        placeholder={placeHolder}
      />
    </div>
  );
}

export default CustomInput;