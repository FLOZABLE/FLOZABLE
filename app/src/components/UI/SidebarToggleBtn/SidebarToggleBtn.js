import React, { useEffect, useState } from "react";
import styles from "./SidebarToggleBtn.module.css";

function SidebarToggleBtn({ isOpen, setIsOpen }) {
  const [id, setId] = useState(null);

  useEffect(() => {
    setId(Math.random().toString(36).substring(7));
  }, []);

  return (
    <div className={styles.SidebarToggleBtn}>
      <input
        type="checkbox"
        className={styles.openSidebarMenu}
        id={id}
        checked={isOpen}
        onChange={() => {
          setIsOpen(!isOpen);
        }}
      />
      <label htmlFor={id} className={styles.sidebarIconToggle}>
        <div
          className={`${styles.spinner} ${styles.diagonal} ${styles.part1}`}
        ></div>
        <div className={`${styles.spinner} ${styles.horizontal}`}></div>
        <div
          className={`${styles.spinner} ${styles.diagonal} ${styles.part2}`}
        ></div>
      </label>
    </div>
  );
}

export default SidebarToggleBtn;
