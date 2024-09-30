import Link from "next/link";
import styles from "./StudyBtn.module.css";

export default function StudyBtn() {
  return (
    <Link href={"/dashboard/study"} className={styles.StudyBtn}>
      Study
    </Link>
  );
}
