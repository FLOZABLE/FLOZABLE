import React, { useState, useEffect, useCallback, useRef } from "react";
import styles from "./Friends.module.css";

const serverOrigin = process.env.REACT_APP_ORIGIN;

function Friends({ isSidebarHovered, isSidebarOpen, userInfo }) {
  return (
    <div className={styles.Account}>
      <div
        className={`Main ${isSidebarOpen || isSidebarHovered ? "sidebarOpen" : ""
          }`}
      >
      </div>
    </div>
  );
};

export default Friends;