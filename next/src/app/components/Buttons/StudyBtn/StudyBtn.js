"use client";

import Link from "next/link";
import styles from "./StudyBtn.module.css";

export default function StudyBtn() {
  return (
    <Link
      href={"/dashboard/study"}
      className={styles.StudyBtn}
      data-tutorial={8}
    >
      <i>Study</i>
    </Link>
  );
}
