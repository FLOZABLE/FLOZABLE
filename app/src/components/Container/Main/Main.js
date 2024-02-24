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
import { BackArrow, IconStatsChart } from "../../../utils/svgs.js";
import FriendsRankingViewer from "../../UI/FriendsRankingViewer/FriendsRankingViewer.js";
import StudyTrendChart from "../../UI/StudyTrendChart.js";
import { updateSubjectsTrendChart } from "../Stats/StatTools.js";

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
  const [friendsRanking, setFriendsRanking] = useState({});

  useEffect(() => {
    if (!subjects) return;

    const { daily } = subjects;

    if (!daily) return;

    const subjectsTrend = updateSubjectsTrendChart(subjects, new Date(), 'Daily', 'day');
    setSubjectsTrend(subjectsTrend);
    /* fetch(`${serverOrigin}/AI/input`, {
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
      .catch((error) => console.error(error)); */

  }, [subjects]);

  const getFriendsRanking = () => {
    fetch(`${serverOrigin}/ranking/friends`, {
      method: "get",
      headers: {
        "Content-Type": "application/json",
      }
    })
      .then((response) => response.json())
      .then((response) => {
        if (response.success) {
          const { day, week, month } = response;
          setFriendsRanking({ day, week, month });
        };
      })
  }
  useEffect(() => {
    if (!userInfo) return;
    getFriendsRanking();
  }, [userInfo]);

  return (
    <div>
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
        <div className={styles.title}>
          Dashboard
        </div>
        <div className={styles.Main}>
          {/* <div className={styles.backArrow}>
            <Link to="/dashboard">
              <BackArrow />
              <h1>Dashboard</h1>

            </Link>
          </div> */}
          <div className={styles.boxesWrapper}>
            <div className={styles.boxesContainer} >
              <div className={styles.box} id={styles.subjectsTrend}>
                <StudyTrendChart
                  subjectsTrend={subjectsTrend}
                />
              </div>
              <div className={styles.smallBoxesWrapper}  >
                <div className={styles.box}>
                  <SmallSubjectsViewer
                    subjects={subjects}
                  />
                </div>
                <div className={styles.box} id={styles.rankingContainer}>
                  <div>
                  <div className={styles.title}>
                    <h3>Friend's Rank</h3>
                    <i>
                      <IconStatsChart />
                    </i>
                  </div>
                    <div>
                      <FriendsRankingViewer friendsRanking={friendsRanking} />
                    </div>
                  </div>
                </div>
                <div className={styles.box} id={styles.recommendedFriends}>
                  <RecommendedFriendsViewer 
                  setResponse={setResponse}
                  />
                </div>
              </div>
            </div>
            <div className={styles.boxesContainer}>
              <div className={styles.box} id={styles.Timeline}>
                <PlanTimeline
                  plans={plans}
                  viewDate={new Date(new Date().setHours(0, 0, 0, 0))}
                  viewMode={"timeGridDay"}
                  subjects={subjects}
                  setPlans={setPlans}
                  mode={"study"}
                  setPlanModal={setPlanModal}
                />
              </div>
              {/* <div className={styles.box}>
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
                  <p>Friend's Rank</p>
                  <i>
                    <IconStatsChart />
                  </i>
                </div>
                <FriendsRankingViewer friendsRanking={friendsRanking} />
              </div> */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Main;