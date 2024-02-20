import React, { useState, useEffect } from "react";
import styles from "./Main.module.css";
import PlanTimeline from "../../UI/PlanTimeline/PlanTimeline.js";
import FriendsActivityViewer from "../../UI/FriendsActivityViewer/FriendsActivityViewer.js";
import SmallRankingViewer from "../../UI/SmallRankingViewer/SmallRankingViewer.js";
import SmallSubjectsViewer from "../../UI/SmallSubjectsViewer/SmallSubjectsViewer.js";
import { Link } from "react-router-dom";
import AIRecommendation from "../../UI/AIRecommendation/AIRecommendation.js";
import GroupPwModal from "../../UI/GroupPwModal/GroupPwModal.js";
import RecommendedFriendsViewer from "../../UI/RecommendedFriendsViewer/RecommendedFriendsViewer.js";
import StuckModal from "../../UI/StuckModal/StuckModal.js";
import { BackArrow } from "../../../utils/svgs.js";
import DashboardChart, { App } from '../DashboardChart/DasboardChart.js'

const serverOrigin = process.env.REACT_APP_ORIGIN;

function Main({
  isSidebarOpen,
  isSidebarHovered,
  subjects,
  setResponse,
  userInfo,
  plans,
  setPlans,
  setPlanModal,
  myGroups,
  setMyGroups,
  setOtherGroups
}) {
  
  const [joinTarget, setJoinTarget] = useState(null);
  const [isGroupPwModal, setIsGroupPwModal] = useState(false);
  const [friendsCount, setFriendsCount] = useState(0);
  const [subjectsTrend, setSubjectsTrend] = useState([]);
  const [filteredTrends, setFilteredTrends] = useState([]);

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
      <StuckModal />
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
        <div className={styles.backArrow}>
         <Link to="/dashboard">
            <BackArrow />
            <h1>Dashboard</h1>

          </Link>
        </div>
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
      </div>
      
      <div className={styles.boxesContainer} id={styles.SmallRanking}>
        <div className={styles.box}>
          <div className={styles.title}>
            Today's Ranking
          </div>
          <SmallRankingViewer
            userInfo={userInfo}
          />
        </div>
      </div>
      <div className={styles.boxesContainer}>
        <div className={styles.box}>
          <div className={styles.title}>
            <div>
              <p>AI recommendation</p>
            </div>      
          </div>
            <AIRecommendation/>
          </div>
        </div>
      </div>
      <div className={styles.DashboardChart}>
        <DashboardChart subjects={subjects} userInfo={userInfo}/>
      </div>

      <div className={styles.boxesContainer} id={styles.toStats}>
        <div className={styles.box}>
          <Link to="/dashboard/planner">
            <button className={styles.toStatsBtn}>View Plans</button>
          </Link>
        </div>
      </div>
  </div>

);

  {/* 
   <div className={styles.boxesContainer}>
          <div className={styles.box}>
            <SmallSubjectsViewer subjects={subjects} />
          </div>
          <div className={styles.box}>
            
            <Link to="/dashboard/planner">
              <button className={styles.toStatsBtn}>View Plans</button>
            </Link>
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
              <p>AI recommendation</p>
            </div>
            <AIRecommendation
            />
          </div>
        </div>*/} 

}

export default Main;