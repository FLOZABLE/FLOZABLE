"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import styles from "./PremiumBtn.module.css";
import { faCrown } from "@fortawesome/free-solid-svg-icons";
import { useRouter } from "next/navigation";

export default function PremiumBtn() {
  const router = useRouter();

  return (
    <div className={styles.PremiumBtn} onClick={() => {router.push("/dashboard/premium")}}>
      <i>
      <FontAwesomeIcon icon={faCrown} />
      </i>
      <div className={styles.hoverEl}>
        Explore premium features!
      </div>
    </div>
  )
}