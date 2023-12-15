import React, { useState, useEffect, useRef } from "react";
import styles from "./Main.module.css";
import parse from "html-react-parser";
import { plugins } from "chart.js";
import Draggable, { DraggableCore } from "react-draggable";
import { DateTime } from "luxon";
import { Quotes } from "../../../utils/Quotes.js";
import PlanTimeline from "../../UI/PlanTimeline/PlanTimeline.js";
import FriendsActivityViewer from "../../UI/FriendsActivityViewer/FriendsActivityViewer.js";
import SmallRankingViewer from "../../UI/SmallRankingViewer/SmallRankingViewer.js";

const serverOrigin = process.env.REACT_APP_ORIGIN;

function Main({
  isSidebarOpen,
  isSidebarHovered,
  subjects,
  plans,
  setIsAddPlanModal,
  setPlans,
  setResponse,
  userInfo
}) {
  const [joinTarget, setJoinTarget] = useState(null);

  return (
    <div className={styles.MainContainer}>
      <div className={` Main ${isSidebarOpen || isSidebarHovered ? 'sidebarOpen' : ''}`}>
        <div className={styles.boxesContainer}>
          <div className={styles.box}>
            <FriendsActivityViewer
              setResponse={setResponse}
              userInfo={userInfo}
              setJoinTarget={setJoinTarget}
            />
          </div>
          <div className={styles.box}>
            <SmallRankingViewer 
              userInfo={userInfo}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Main;