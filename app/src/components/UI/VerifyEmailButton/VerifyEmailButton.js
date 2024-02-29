import React from "react";
import styles from "./VerifyEmailButton.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck, faXmark } from "@fortawesome/free-solid-svg-icons";

const serverOrigin = process.env.REACT_APP_ORIGIN;

function VerifyEmailButton({setResponse}) {

  function sendEmail() {
    fetch(`${serverOrigin}/account/send-verification-link`, {
      method: "post",
    })
      .then((response) => response.json())
      .then((data) => {
        setResponse(data);
      })
      .catch((error) => console.error(error));
  }

  return (
    <div className={styles.VerifyEmailButton}>
      <button onClick={sendEmail}>Send Verification Link</button>
    </div>
  );
}

export default VerifyEmailButton;