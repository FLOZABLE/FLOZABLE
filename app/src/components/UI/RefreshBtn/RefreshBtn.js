import { useState } from "react";
import styles from "./RefreshBtn.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faRotate } from "@fortawesome/free-solid-svg-icons";

function RefreshBtn({refresh, setRefresh}) {
  const [lastUpd, setLastUpd] = useState(new Date().getTime() / 1000);

  return (
    <div className={styles.RefreshBtn}
      onClick={() => {
        const now = new Date().getTime() / 1000;
        if (now - lastUpd > 3) {
          setLastUpd(now);
          setRefresh(true);
          setTimeout(() => {
            setRefresh(false)
          }, 3000);
        };
      }}
    >
      <i className={refresh ? styles.refresh : ''}>
        <FontAwesomeIcon icon={faRotate}
        />
      </i>
    </div>
  )
};

export default RefreshBtn;