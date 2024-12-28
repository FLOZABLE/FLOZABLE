"use client";

import Link from "next/link";
import styles from "./MainHeader.module.css";
import AccountBtn from "../../Buttons/AccountBtn/AccountBtn";

export default function MainHeader() {
  return (
    <header className={styles.MainHeader}>
      <div className={styles.left}>
        <h1>FLOZABLE</h1>
      </div>
      <div className={styles.pages}>
        <div className={styles.page}>
          <Link href={"/#about"}>About</Link>
        </div>
        <div className={styles.page}>
          <Link href={"/#feature"}>Feature</Link>
        </div>
        <div className={styles.page}>
          <Link href={"/#pricing"}>Pricing</Link>
        </div>
        <div className={styles.page}>
          <Link href={"/#pricing"}>Review</Link>
        </div>
        <div className={styles.page}>
          <Link href={"/dashboard"}>Dashboard</Link>
        </div>
      </div>
      <div className={styles.right}>
        <AccountBtn />
      </div>
    </header>
  );
}
