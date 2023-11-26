import React, { useState, useEffect, useCallback, useRef } from "react";
import styles from "./Friends.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAngleRight, faUserFriends } from "@fortawesome/free-solid-svg-icons";

const serverOrigin = process.env.REACT_APP_ORIGIN;

function Friends({ isSidebarHovered, isSidebarOpen, userInfo }) {
  return (
    <div className={styles.Friends}>
      <div
        className={`Main ${isSidebarOpen || isSidebarHovered ? "sidebarOpen" : ""
          }`}
      >
        <div className="title">
          <i>
            <FontAwesomeIcon icon={faUserFriends} />
          </i>
          <h1>Friends</h1>
        </div>
        <div className={styles.box} id={styles.links}>
          <button>
            <i>

            </i>
            <p>
              Friend Link
            </p>
            <i>
              <FontAwesomeIcon icon={faAngleRight} />
            </i>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Friends;