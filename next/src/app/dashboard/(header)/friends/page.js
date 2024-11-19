"use client";

import React, { useState } from "react";
import styles from "./page.module.css";
import FriendsActivityViewer from "@/app/components/Friends/FriendsActivityViewer/FriendsActivityViewer";
import FriendRequestsViewer from "@/app/components/Friends/FriendRequestsViewer/FriendRequestsViewer";
import FriendsTrendChart from "@/app/components/Charts/FriendsTrendChart";

function Friends({}) {
  const [viewDate, setViewDate] = useState(
    new Date(new Date().setHours(0, 0, 0, 0))
  );
  const [viewer, setViewer] = useState("day");
  const [isOnlyFriends, setIsOnlyFriends] = useState(true);

  return (
    <div className={`Main`}>
      <div className={styles.Friends}>
        {/* <div className={styles.layer} id={styles.left}>
        </div> */}
        <div className={styles.layer} id={styles.center}>
          <div
            className={`BoxContainer ${styles.boxContainer}`}
            id={styles.FriendsTrendChart}
          >
            <FriendsTrendChart />
          </div>
        </div>
        <div className={styles.layer} id={styles.right}>
          <div
            className={`BoxContainer ${styles.boxContainer}`}
            id={styles.FriendRequestsViewer}
          >
            <FriendRequestsViewer />
          </div>
          <div
            className={`BoxContainer ${styles.boxContainer}`}
            id={styles.FriendsActivityViewer}
          >
            <FriendsActivityViewer />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Friends;
