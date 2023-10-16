import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import styles from "./SendBtn.module.css";
import { faPaperPlane } from "@fortawesome/free-solid-svg-icons";
import { useCallback } from "react";

function SendBtn({submit, setSubmit}) {
  const handleSubmit = useCallback(() => {
    setSubmit(true);
    setTimeout(() => {
      setSubmit(false);
    }, 1000);
  });

  return (
    <div className={styles.SendBtn} onClick={() => {handleSubmit()}}>
      <i className={`${submit ? styles.submit : ''}`}>
      <FontAwesomeIcon icon={faPaperPlane} />
      </i>
    </div>
  )
};

export default SendBtn;