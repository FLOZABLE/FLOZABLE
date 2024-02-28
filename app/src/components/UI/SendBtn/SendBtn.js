import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import styles from "./SendBtn.module.css";
import { faPaperPlane } from "@fortawesome/free-solid-svg-icons";
import React, { useState } from "react";

function SendBtn({ onSubmit }) {
  const [submit, setSubmit] = useState(false);

  const handleSubmit = () => {
    onSubmit();
    setSubmit(true);
    setTimeout(() => {
      setSubmit(false);
    }, 1000);
  };

  return (
    <div
      className={styles.SendBtn}
      onClick={() => {
        handleSubmit();
      }}
    >
      <i className={`${submit ? styles.submit : ""}`}>
        <FontAwesomeIcon icon={faPaperPlane} />
      </i>
    </div>
  );
}

export default SendBtn;