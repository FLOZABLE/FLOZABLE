"ues client";

import { useState } from "react";
import styles from "./page.module.css";
import CalendarModal from "@/app/components/Modals/CalendarModal/CalendarModal";
import RadioBtn from "@/app/components/Buttons/RadioBtn/RadioBtn";
import FriendRequestBtn from "@/app/components/Buttons/FriendRequestBtn/FriendRequestBtn";
import StudyTrendChart from "@/app/components/Charts/StudyTrendChart";

function User({ params }) {
  const { userId } = params;
  const [statsViewer, setStatsViewer] = useState('Daily');
  const [viewDate, setViewDate] = useState(new Date(new Date().setHours(0, 0, 0, 0)));
  
  return (
    <div>
      <CalendarModal isCalendarOpen={isCalendarOpen} setIsCalendarOpen={setIsCalendarOpen} updateViewDate={updateViewDate} viewDate={viewDate} />
      <div className={`Main`}>
        <div className="title">
          User
        </div>
        <div className={styles.User}>
          <div className={styles.searchOpt}>
            <RadioBtn items={[{ view: 'Daily', value: 'Daily' }, { view: 'Weekly', value: 'Weekly' }, { view: 'Monthly', value: 'Monthly' }]} changeEvent={updateViewer} defaultViewer={0} />
          </div>
          <div className={styles.profileCard}>
            <div>
              <div className={styles.profileImg}
                style={{
                  backgroundImage: `url("${serverOrigin}/profile-images/${userInfo ? userInfo.user_id : ''}.jpeg")`, backgroundSize: 'cover',
                  backgroundPosition: 'center center',
                  backgroundRepeat: 'no-repeat',
                }}
              ></div>
              <div className={`${styles.name} overflowDot`}>
                {userInfo?.name}
              </div>
            </div>
            <div>
              Joined at {userInfo ? DateTime.fromSeconds(parseInt(userInfo.datum_point)).toLocaleString(DateTime.DATE_FULL) : null}
            </div>
            <div>
              <FriendRequestBtn userInfo={userInfo} />
              <DmBtn setIsChatModal={setIsChatModal} setResponse={setResponse} userInfo={userInfo} />
            </div>
            <div className={styles.timezone}>
              Timezone:
              {userInfo?.timezone ? <>
                <i>
                  <CountryViewer timezone={userInfo.timezone} />
                </i>
                <p>
                  {userInfo.timezone}
                </p>
              </> : 'UTC'}
            </div>
          </div>
          <div className={styles.boxContainer}>
            <div className={styles.box}>
              <div className={styles.title}>
                Study Trend
              </div>
              <div className={styles.chartContainer}>
                <StudyTrendChart
                  subjectsTrend={subjectsTrend}
                />
              </div>
            </div>
            <div className={styles.box}>
              <div className={styles.title}>
                Ranking Trend
              </div>
              <div className={styles.chartContainer}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={rankingsTrend}
                    margin={{
                      top: 5,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="label" tickFormatter={(data) => {
                      const dateTime = DateTime.fromISO(data);

                      return dateTime.toFormat('M/d');
                    }} />
                    <YAxis reversed={true} />
                    <Tooltip />
                    <Line type="monotone" dataKey={"ranking"} stroke="#8884d8" activeDot={{ r: 8 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className={styles.box} id={styles.groupBox}>
              <div className={styles.title}>
                {userInfo ? userInfo.name : ''}'s groups
              </div>
              <div className={`${styles.groupsContainer} customScroll`}>
                <Groups
                  groups={userGroups}
                  myGroups={myGroups}
                  setMyGroups={setMyGroups}
                  setOtherGroups={setOtherGroups}
                  setJoinGroupResponse={setResponse}
                  setIsGroupPwModal={setIsGroupPwModal}
                  setJoinTarget={setJoinTarget}
                  userInfo={myInfo}
                  queryTags={[]}
                  type={1}
                />
              </div>
            </div>
            <div className={styles.box} id={styles.friendsBox}>
              <div className={styles.title}>
                {userInfo ? userInfo.name : ''}'s friends
              </div>
              <div className={styles.friendsContainer}>
                <FriendsViewer friends={userFriends} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
};

export default User;