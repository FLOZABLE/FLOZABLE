import React, { useState } from "react";
import styles from "./RefreshBtn.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faRotate } from "@fortawesome/free-solid-svg-icons";

function RefreshBtn({ interval = 3, onClick }) {
  const [lastUpd, setLastUpd] = useState(new Date().getTime() / 1000);
  const [refresh, setRefresh] = useState(false);

  return (
    <i
      className={`${styles.RefreshBtn} ${refresh ? styles.refresh : ""}`}
      onClick={() => {
        const now = new Date().getTime() / 1000;
        if (now - lastUpd > interval) {
          onClick();
          setLastUpd(now);
          setRefresh(true);
          setTimeout(() => {
            setRefresh(false);
          }, 1000);
        }
      }}
    >
      <FontAwesomeIcon icon={faRotate} />
    </i>
  );
}

export default RefreshBtn;
