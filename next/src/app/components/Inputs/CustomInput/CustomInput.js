import React from "react";
import styles from "./CustomInput.module.css";

function CustomInput({
  handleEnter = () => {},
  handleInput,
  input,
  type="text",
  placeHolder,
  children,
}) {
  const handleEnterKeyPress = (event) => {
    if (event.key === "Enter") {
      handleEnter(event);
    }
  };
  return (
    <div className={styles.CustomInput}>
      <span>{children}</span>
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
