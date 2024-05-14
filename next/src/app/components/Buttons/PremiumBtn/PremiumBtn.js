"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import styles from "./PremiumBtn.module.css";
import { faCrown } from "@fortawesome/free-solid-svg-icons";

export default function PremiumBtn() {
  return (
    <div className={styles.PremiumBtn}>
      <i>
      <FontAwesomeIcon icon={faCrown} />
      </i>
      <div className={styles.hoverEl}>
        Explore premium features!
      </div>
    </div>
  )
}