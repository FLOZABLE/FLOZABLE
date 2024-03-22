"use client";

import StudyTrendChart from "@/Components/Charts/StudyTrendChart";
import styles from "./page.module.css";
import { useContext, useEffect, useState } from "react";
import SmallSubjectsViewer from "@/Components/Subjects/SmallSubjectsViewer/SmallSubjectsViewer";
import { SubjectsContext, TutorialsContext, UserInfoContext } from "@/utils/Contexts";
import { IconStatsChart } from "@/utils/Svg";
import FriendsRankingViewer from "@/Components/Friends/FriendsRankingViewer/FriendsRankingViewer";
import RecommendedFriendsViewer from "@/Components/Friends/RecommendedFriendsViewer/RecommendedFriendsViewer";
import PlanTimeline from "@/Components/Plans/PlanTimeline/PlanTimeline";
import config from "@/utils/config";

export default function Dashboard() {
  const {userInfo} = useContext(UserInfoContext);
  const { subjects } = useContext(SubjectsContext);
  const [subjectsTrend, setSubjectsTrend] = useState([]);
  const [friendsRanking, setFriendsRanking] = useState([]);
  const [planModal, setPlanModal] = useState({});
  const {tutorialBoxRef, tutorialTextRef} = useContext(TutorialsContext);

  const getFriendsRanking = () => {
    fetch(`${config.server}/ranking/friends`, {
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
    setTimeout(() => {
      getFriendsRanking();
    }, 10000);
  }, [userInfo]);

  return (
    <div className={`Main`}>
      <div className="title">
        Dashboard
      </div>
      <div className={styles.Main}>
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
                    <h3>Friend Ranking</h3>
                    <i>
                      <IconStatsChart />
                    </i>
                  </div>
                  <div className={styles.friendsRankingWrapper}>
                    <FriendsRankingViewer />
                  </div>
                </div>
              </div>
              <div className={styles.box} id={styles.recommendedFriends}>
                <RecommendedFriendsViewer />
              </div>
            </div>
          </div>
          <div className={styles.boxesContainer}>
            <div className={styles.box} id={styles.planTimeline}>
              <PlanTimeline
                viewDate={new Date(new Date().setHours(0, 0, 0, 0))}
                viewMode={"timeGridDay"}
                subjects={subjects}
                mode={"study"}
                setPlanModal={setPlanModal}
                tutorialBoxRef={tutorialBoxRef}
                tutorialTextRef={tutorialTextRef}
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
  );
}
