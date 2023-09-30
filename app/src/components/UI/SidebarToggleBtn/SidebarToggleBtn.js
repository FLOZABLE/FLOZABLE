import React from "react";
import styles from "./SidebarToggleBtn.module.css";

function SidebarToggleBtn(props) {
  return (
    <div className={styles.SidebarToggleBtn}>
      <input type="checkbox" class={styles.openSidebarMenu} id="openSidebarMenu" />
      <label htmlFor="openSidebarMenu" className={styles.sidebarIconToggle}>
        <div className={`${styles.spinner} ${styles.diagonal} ${styles.part1}`}></div>
        <div className={`${styles.spinner} ${styles.horizontal}`}></div>
        <div className={`${styles.spinner} ${styles.diagonal} ${styles.part2}`}></div>
      </label>
    </div>
  );
};

export default SidebarToggleBtn;