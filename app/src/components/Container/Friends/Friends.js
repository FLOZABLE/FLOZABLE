import React, { useState, useEffect } from "react";
import styles from "./Friends.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAngleRight, faCaretRight, faUserFriends } from "@fortawesome/free-solid-svg-icons";
import FriendsRankingViewer from "../../UI/FriendsRankingViewer/FriendsRankingViewer";
import RecommendedFriendsViewer from "../../UI/RecommendedFriendsViewer/RecommendedFriendsViewer";
import FriendRequestsViewer from "../../UI/FriendRequestsViewer/FriendRequestsViewer";
import { EmailInvitation, Fight1, FriendLink, IconBxHome, IconEmailOutline, IconFire, IconStatsChart, IconUser } from "../../../utils/svgs";
import FriendLinkModal from "../../UI/FriendLinkModal/FriendLinkModal";
import FriendsActivityViewer from "../../UI/FriendsActivityViewer/FriendsActivityViewer";
import GroupPwModal from "../../UI/GroupPwModal/GroupPwModal";
import Search from "../../UI/Search/Search";
import SearchUsers from "../../UI/SearchUsers/SearchUsers";
import FriendEmailModal from "../../UI/FriendEmailModal/FriendEmailModal";
import { Link } from "react-router-dom";
import SearchBar from "../../UI/SearchBar/SearchBar";
import { Bar, CartesianGrid, Legend, BarChart, Rectangle, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { DateTime } from "luxon";
import { secondConverter } from "../../../utils/Tool";

const serverOrigin = process.env.REACT_APP_ORIGIN;

function Friends({
  isSidebarHovered,
  isSidebarOpen,
  userInfo,
  notifications,
  setNotifications,
  setResponse,
  otherGroups,
  setOtherGroups,
  myGroups,
  setMyGroups
}) {
  const [isFriendLinkModal, setIsFriendLinkModal] = useState(false);
  const [isFriendEmailModal, setIsFriendEmailModal] = useState(false);
  const [isGroupPwModal, setIsGroupPwModal] = useState(false);
  const [joinTarget, setJoinTarget] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  const [friendCount, setFriendCount] = useState(0);
  const [suggestionsCount, setSuggestionsCount] = useState(0);
  const [friendsRanking, setFriendsRanking] = useState({});

  const [search, setSearch] = useState(false);
  const [friendsTrends, setFriendsTrends] = useState([]);

  useEffect(() => {
    if (!joinTarget) return;
    setJoinTarget(joinTarget);
    const { group_id, visibility } = joinTarget;

    if (visibility) {
      fetch(`${serverOrigin}/groups/join/${group_id}`, {
        method: "post",
      })
        .then((response) => response.json())
        .then((data) => {
          setResponse(data);
          setOtherGroups(
            (prev) => {
              prev.filter(group => {
                return group.group_id != group_id;
              })
            }
          );
          setMyGroups((prev) => [...prev, joinTarget]);
        })
        .catch((error) => console.error(error));
    } else {
      setIsGroupPwModal(true);
    };
  }, [joinTarget]);

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
          const { day, week, month, dayTrend } = response;
          setFriendsRanking({ day, week, month });
          setFriendsTrends(dayTrend);
        };
      })
  }
  useEffect(() => {
    if (!userInfo) return;
    getFriendsRanking();
  }, [userInfo]);

  return (
    <div>
      <FriendLinkModal
        userInfo={userInfo}
        isOpen={isFriendLinkModal}
        setIsOpen={setIsFriendLinkModal}
      />
      <FriendEmailModal
        isOpen={isFriendEmailModal}
        setIsOpen={setIsFriendEmailModal}
      />
      <GroupPwModal
        myGroups={myGroups}
        setMyGroups={setMyGroups}
        groups={otherGroups}
        setOtherGroups={setOtherGroups}
        setIsGroupPwModal={setIsGroupPwModal}
        isGroupPwModal={isGroupPwModal}
        joinTarget={joinTarget}
        setJoinGroupResponse={setResponse}
      />
      <div
        className={`Main`}
      >
        <div className="title" id={styles.friend}>
          Friends
        </div>
        <div className={styles.Friends}>
          <div className={styles.container}>
            <div>
              <div className={styles.smallBox}>
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
            <div>
              <div className={styles.box} id={styles.activeFriends}>
                <div>
                  <div className={styles.title}>
                    <h3>Friends Status</h3>
                  </div>
                  <FriendsActivityViewer
                    setResponse={setResponse}
                    userInfo={userInfo}
                    setJoinTarget={setJoinTarget}
                    searchQuery={searchQuery}
                    setCount={setFriendCount}
                    myGroups={myGroups}
                    setMyGroups={setMyGroups}
                    setOtherGroups={setOtherGroups}
                  />
                </div>
              </div>
              <div className={styles.box} id={styles.friendsStats}>
                <div>
                  <div className={styles.title}>
                    <h3>Friends' Stats</h3>
                  </div>
                  <div className={styles.chartWrapper}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        width={500}
                        height={300}
                        data={friendsTrends.map(dayVal => {
                          const friendsData = {};
                          Object.keys(dayVal.friends).map((friend) => {
                            friendsData[friend] = dayVal.friends[friend].t
                          });
                          return { ...friendsData, ...dayVal };
                        })}
                        margin={{
                          top: 5,
                          right: 30,
                          left: 20,
                          bottom: 5,
                        }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis tickFormatter={(data) => {
                          const { value, type } = secondConverter(data);
                          return `${value} ${type}`
                        }} />
                        <Tooltip formatter={(data) => {
                          const { value, type } = secondConverter(data);
                          return `${value} ${type}`
                        }} />
                        <Legend />
                        {friendsTrends.length ? Object.keys(friendsTrends[0].friends).map((friend, i) => {
                          return (
                            <Bar name={friendsTrends[0].friends[friend].name} key={i} dataKey={friend} fill="#8884d8" />
                          )
                        }) : null}
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </div>
            <div>
              <div className={styles.smallBox}
                onClick={() => {
                  setIsFriendEmailModal(true);
                }}
              >
                <div className={styles.title}>
                  <h3>Email Invitation</h3>
                  <i>
                    <IconEmailOutline />
                  </i>
                </div>
              </div>
              <div className={styles.smallBox}
                onClick={() => {
                  setIsFriendLinkModal(true);
                }}
              >
                <div className={styles.title}>
                  <h3>Friend Link</h3>
                  <i>
                    <IconUser />
                  </i>
                </div>
              </div>
              {/* <div className={styles.smallBox}>
                <div className={styles.title}>
                  <h3>Challenge URL</h3>
                  <i>
                    <IconFire />
                  </i>
                </div>
              </div> */}
              <div className={styles.smallBox}>
                <div className={styles.title}>
                  <h3>Search for Friends</h3>
                  <i>
                  </i>
                </div>
                <SearchBar
                  searchQuery={searchQuery}
                  setSearchQuery={setSearchQuery}
                  onEnter={() => { setSearch(true) }}
                />
                <SearchUsers
                  searchQuery={searchQuery}
                  setCount={setSuggestionsCount}
                  setResponse={setResponse}
                  search={search}
                  setSearch={setSearch}
                />
              </div>
              <div className={styles.smallBox}>
                <div className={styles.title}>
                  <h3>Friend Requests</h3>
                  <i>
                  </i>
                </div>
                <FriendRequestsViewer
                  notifications={notifications}
                  setNotifications={setNotifications}
                  setResponse={setResponse}
                  userInfo={userInfo}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Friends;