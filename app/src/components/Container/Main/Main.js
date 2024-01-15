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
import ChartDataLabel from "chartjs-plugin-datalabels";
import PieChart from "../../UI/PieChart";

import SmallSubjectsViewer from "../../UI/SmallSubjectsViewer/SmallSubjectsViewer.js";
import ActivityViewer from "../../UI/ActivityViewer/ActivityViewer.js";
import { Link } from "react-router-dom";
import AIRecommendation from "../../UI/AIRecommendation/AIRecommendation.js";
import GroupPwModal from "../../UI/GroupPwModal/GroupPwModal.js";
import RecommendedFriendsViewer from "../../UI/RecommendedFriendsViewer/RecommendedFriendsViewer.js";
import YouTubeAudioPlayer from "../../UI/YoutubeAudioPlayer/YoutTubeAudioPlayer.js";

const serverOrigin = process.env.REACT_APP_ORIGIN;

function Main({
  isSidebarOpen,
  isSidebarHovered,
  subjects,
  setResponse,
  userInfo,
  plans,
  setPlans,
  setIsAddPlanModal,
  myGroups,
  setMyGroups,
  setOtherGroups
}) {
  const [joinTarget, setJoinTarget] = useState(null);
  const [isGroupPwModal, setIsGroupPwModal] = useState(false);
  const [friendsCount, setFriendsCount] = useState(0);
  const [tempVolume, setTempVolume] = useState(50);

  useEffect(() => {
    if (!subjects.length) return;
    fetch(`${serverOrigin}/AI/input`, {
      method: 'post',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ subjects })
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          console.log(data);
        }
      })
      .catch((error) => console.error(error));
  }, [subjects]);

  return (
    <div className={styles.MainContainer}>
      <GroupPwModal
        myGroups={myGroups}
        setMyGroups={setMyGroups}
        setOtherGroups={setOtherGroups}
        setIsGroupPwModal={setIsGroupPwModal}
        isGroupPwModal={isGroupPwModal}
        joinTarget={joinTarget}
        setJoinGroupResponse={setResponse}
      />
      <div className={` Main ${isSidebarOpen || isSidebarHovered ? 'sidebarOpen' : ''}`}>
        <div className={styles.boxesContainer}>
          <div className={styles.box}>
            <div className={styles.title}>
            {friendsCount ? <p>Friends Viewer</p> : null}
            </div>
            <FriendsActivityViewer
              setResponse={setResponse}
              userInfo={userInfo}
              setJoinTarget={setJoinTarget}
              searchQuery={''}
              setCount={setFriendsCount}
              myGroups={myGroups}
              setMyGroups={setMyGroups}
              setOtherGroups={setOtherGroups}
              mode={0}
            />
            {!friendsCount ? <RecommendedFriendsViewer setResponse={setResponse} /> : null}
          </div>
          <div className={styles.box}>
            <div className={styles.title}>
              Today's Ranking
            </div>
            <SmallRankingViewer
              userInfo={userInfo}
            />
          </div>
          <div className={styles.box}>
            <SmallSubjectsViewer subjects={subjects} />
          </div>
          <div className={styles.box}>
            <PlanTimeline
              plans={plans}
              viewDate={new Date(new Date().setHours(0, 0, 0, 0))}
              viewMode={"timeGridDay"}
              subjects={subjects}
              setPlans={setPlans}
              setIsAddPlanModal={setIsAddPlanModal}
              mode={"planner"}
            />
            <Link to="/dashboard/planner">
              <button className={styles.toStatsBtn}>View Plans</button>
            </Link>
          </div>
          <div className={styles.box}>
            <div className={styles.title}>
              <p>AI recommendation</p>
            </div>
            <AIRecommendation
            />
          </div>
          {/* <div className={styles.box}>
            <div className={styles.title}>
              <p>Activity Viewer</p>
            </div>
            <ActivityViewer
              subjects={subjects}
            />
          </div> */}
        </div>
        </div>
    </div>
  );
}

export default Main;