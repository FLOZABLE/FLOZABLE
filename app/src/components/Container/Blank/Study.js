import React from "react";
import StuckModal from "../../UI/StuckModal/StuckModal";
import TopNotification from "../../UI/TopNotification/TopNotification";
import styles from "./Study.module.css";

function Study(props) {
  return (
    <div className={styles.GroupsContainer}>
      <TopNotification duration={2500} />
      <StuckModal />
      <div
        className={`Main ${
          props.isSidebarOpen || props.isSidebarHovered ? "sidebarOpen" : ""
        }`}
      >
        <div className={styles.boxes}>
          <div className={styles.box} id="daily">
            <div className={`${styles.container} ${styles.myGroups}`}></div>
            <div className={`${styles.container} ${styles.allGroups}`}></div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Study;