import React, { useState, useEffect, useCallback, useRef } from "react";
import styles from "./Friends.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAngleRight, faUserFriends } from "@fortawesome/free-solid-svg-icons";
import FriendsRankingViewer from "../../UI/FriendsRankingViewer/FriendsRankingViewer";
import RecommendedFriendsViewer from "../../UI/RecommendedFriendsViewer/RecommendedFriendsViewer";
import FriendRequestsViewer from "../../UI/FriendRequestsViewer/FriendRequestsViewer";

const serverOrigin = process.env.REACT_APP_ORIGIN;

function Friends({ isSidebarHovered, isSidebarOpen, userInfo, notifications, setNotifications, setResponse }) {

  return (
    <div className={styles.Friends}>
      <div
        className={`Main ${isSidebarOpen || isSidebarHovered ? "sidebarOpen" : ""
          }`}
      >
        <div className={styles.fixedBoxContainer}>
          <div className={styles.box}>
            <FriendRequestsViewer
              notifications={notifications}
              setNotifications={setNotifications}
              setResponse={setResponse}
            />
          </div>
          <div className={styles.box}>
            <FriendsRankingViewer
              userInfo={userInfo}
            />
          </div>
          <div className={styles.box}>
            <RecommendedFriendsViewer
            />
          </div>
        </div>
        <div className="title">
          <i>
            <FontAwesomeIcon icon={faUserFriends} />
          </i>
          <h1>Friends</h1>
        </div>
        <div className={styles.boxesWrapper}>
          <div className={styles.box} id={styles.links}>
            <div className={styles.buttonsWrapper}>
              <div className={styles.buttonContainer}>
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
              <div className={styles.buttonContainer}>
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
              <div className={styles.buttonContainer}>
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
              <div className={styles.buttonContainer}>
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
        </div>
      </div>
    </div>
  );
};

export default Friends;