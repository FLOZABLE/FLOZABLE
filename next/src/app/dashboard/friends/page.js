"use client";

import React, { useState, useEffect, useContext } from "react";
import styles from "./page.module.css";
import { Bar, CartesianGrid, Legend, BarChart, Rectangle, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { ModalsContext } from "@/utils/Contexts";
import FriendLinkModal from "@/Components/Modals/FriendLinkModal/FriendLinkModal";
import FriendEmailModal from "@/Components/Modals/FriendEmailModal/FriendEmailModal";
import { IconEmailOutline, IconStatsChart, IconUser } from "@/utils/Svg";
import FriendsRankingViewer from "@/Components/Friends/FriendsRankingViewer/FriendsRankingViewer";
import FriendsActivityViewer from "@/Components/Friends/FriendsActivityViewer/FriendsActivityViewer";
import SearchBar from "@/Components/Inputs/SearchBar/SearchBar";
import SearchUsers from "@/Components/Users/SearchUsers/SearchUsers";
import FriendRequestsViewer from "@/Components/Friends/FriendRequestsViewer/FriendRequestsViewer";
import config from "@/utils/config";
import FriendsTrendChart from "@/Components/Charts/FriendsTrendChart";

function Friends({
}) {
  const { setJoinGroupModal } = useContext(ModalsContext);

  const [isFriendLinkModal, setIsFriendLinkModal] = useState(false);
  const [isFriendEmailModal, setIsFriendEmailModal] = useState(false);
  const [joinTarget, setJoinTarget] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  const [friendCount, setFriendCount] = useState(0);
  const [suggestionsCount, setSuggestionsCount] = useState(0);
  const [friendsRanking, setFriendsRanking] = useState({});

  const [search, setSearch] = useState(false);
  const [friendsTrends, setFriendsTrends] = useState([]);

  const getFriendsRanking = () => {
    fetch(`${config.server}/ranking/friends`, {
      method: "get",
      headers: {
        "Content-Type": "application/json",
      },
      credentials:"include"
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
    getFriendsRanking();
  }, []);

  return (
    <div>
      <FriendLinkModal
        isOpen={isFriendLinkModal}
        setIsOpen={setIsFriendLinkModal}
      />
      <FriendEmailModal
        isOpen={isFriendEmailModal}
        setIsOpen={setIsFriendEmailModal}
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
                  <h3>Friend&apos;s Rank</h3>
                  <i>
                    <IconStatsChart />
                  </i>
                </div>
                <div>
                  <FriendsRankingViewer />
                </div>
              </div>
            </div>
            <div>
              <div className={styles.box} id={styles.activeFriends}>
                <div>
                  <div className={styles.title}>
                    <h3>Friends Status</h3>
                  </div>
                  <FriendsActivityViewer />
                </div>
              </div>
              <div className={styles.box} id={styles.friendsStats}>
                <div>
                  <div className={styles.title}>
                    <h3>Friends&apos; Stats</h3>
                  </div>
                  <div className={styles.chartWrapper}>
                    <FriendsTrendChart
                      friendsTrends={friendsTrends}
                    />
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
                <FriendRequestsViewer />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Friends;