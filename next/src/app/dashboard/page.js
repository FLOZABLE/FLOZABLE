import styles from "./page.module.css";

export default function Dashboard() {
  return (
    <div className={`Main`}>
    <div className="title">
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
                  <h3>Friend Ranking</h3>
                  <i>
                    <IconStatsChart />
                  </i>
                </div>
                <div className={styles.friendsRankingWrapper}>
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
          <div className={styles.box} id={styles.planTimeline}>
            <PlanTimeline
              plans={plans}
              viewDate={new Date(new Date().setHours(0, 0, 0, 0))}
              viewMode={"timeGridDay"}
              subjects={subjects}
              setPlans={setPlans}
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
