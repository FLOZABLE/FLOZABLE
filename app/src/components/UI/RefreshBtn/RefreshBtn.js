import React, { useState } from "react";
import styles from "./RefreshBtn.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faRotate } from "@fortawesome/free-solid-svg-icons";

function RefreshBtn({ refresh, setRefresh }) {
  const [lastUpd, setLastUpd] = useState(new Date().getTime() / 1000);

  return (
    <i className={`${styles.RefreshBtn} ${refresh ? styles.refresh : ''}`}
      onClick={() => {
        const now = new Date().getTime() / 1000;
        if (now - lastUpd > 3) {
          setLastUpd(now);
          setRefresh(true);
        };
      }}
    >
      <FontAwesomeIcon icon={faRotate} />
    </i>
  )
};

export default RefreshBtn;