"use client";

import React, { useState, useEffect, useContext } from "react";
import styles from "./page.module.css";
import { ModalsContext, UserInfoContext } from "@/app/utils/Contexts";
import FriendLinkModal from "@/app/components/Modals/FriendLinkModal/FriendLinkModal";
import FriendEmailModal from "@/app/components/Modals/FriendEmailModal/FriendEmailModal";
import { IconEmailOutline, IconStatsChart, IconUser } from "@/app/utils/Svg";
import FriendsRankingViewer from "@/app/components/Friends/FriendsRankingViewer/FriendsRankingViewer";
import FriendsActivityViewer from "@/app/components/Friends/FriendsActivityViewer/FriendsActivityViewer";
import SearchBar from "@/app/components/Inputs/SearchBar/SearchBar";
import SearchUsers from "@/app/components/Users/SearchUsers/SearchUsers";
import FriendRequestsViewer from "@/app/components/Friends/FriendRequestsViewer/FriendRequestsViewer";
import config from "@/app/utils/config";
import FriendsTrendChart from "@/app/components/Charts/FriendsTrendChart";
import { useRouter } from "next/navigation";

function Friends({}) {
  const { userInfo } = useContext(UserInfoContext);

  const [isFriendLinkModal, setIsFriendLinkModal] = useState(false);
  const [isFriendEmailModal, setIsFriendEmailModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const [friendsRanking, setFriendsRanking] = useState({});

  const router = useRouter();

  const [search, setSearch] = useState(false);
  const [friendsTrends, setFriendsTrends] = useState([]);

  const getFriendsRanking = () => {
    fetch(`${config.server}/ranking/friends`, {
      method: "get",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    })
      .then((response) => response.json())
      .then((response) => {
        if (response.success) {
          const { day, week, month, dayTrend } = response;
          setFriendsRanking({ day, week, month });
          setFriendsTrends(dayTrend);
        }
      });
  };
  useEffect(() => {
    getFriendsRanking();
  }, [userInfo]);

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
      <div className={`Main`}>
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
                    <FriendsTrendChart friendsTrends={friendsTrends} />
                  </div>
                </div>
              </div>
            </div>
            <div>
              <div
                className={styles.smallBox}
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
              <div
                className={styles.smallBox}
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
                  <i></i>
                </div>
                <SearchBar
                  searchQuery={searchQuery}
                  setSearchQuery={setSearchQuery}
                  onEnter={() => {
                    setSearch(true);
                  }}
                />
                <SearchUsers
                  searchQuery={searchQuery}
                  search={search}
                  setSearch={setSearch}
                  onClick={(userInfo) => {
                    router.replace(`/dashboard/user/${userInfo.user_id}`);
                  }}
                />
              </div>
              <div className={styles.smallBox}>
                <div className={styles.title}>
                  <h3>Friend Requests</h3>
                  <i></i>
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
