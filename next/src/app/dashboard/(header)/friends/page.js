"use client";

import React, { useState } from "react";
import styles from "./page.module.css";
import FriendLinkModal from "@/app/components/Modals/FriendLinkModal/FriendLinkModal";
import FriendEmailModal from "@/app/components/Modals/FriendEmailModal/FriendEmailModal";
import { IconEmailOutline, IconUser } from "@/app/utils/Svg";
import FriendsRankingViewer from "@/app/components/Friends/FriendsRankingViewer/FriendsRankingViewer";
import FriendsActivityViewer from "@/app/components/Friends/FriendsActivityViewer/FriendsActivityViewer";
import SearchBar from "@/app/components/Inputs/SearchBar/SearchBar";
import SearchUsers from "@/app/components/Users/SearchUsers/SearchUsers";
import FriendRequestsViewer from "@/app/components/Friends/FriendRequestsViewer/FriendRequestsViewer";
import { useRouter } from "next/navigation";
import FriendsTrendChart from "@/app/components/Charts/FriendsTrendChart";

function Friends({}) {
  const [isFriendLinkModal, setIsFriendLinkModal] = useState(false);
  const [isFriendEmailModal, setIsFriendEmailModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const router = useRouter();

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
        {/* <div className="title" id={styles.friend}>
          Friends
        </div> */}
        <div className={styles.Friends}>
          <div className={styles.container}>
            <div className={styles.layer}>
              <div className={`${styles.box} BoxContainer`}>
                <FriendsRankingViewer />
              </div>
            </div>
            <div className={styles.layer}>
              <div className={`${styles.box} BoxContainer`}>
                <FriendsActivityViewer />
              </div>
              <div className={`${styles.box} BoxContainer`}>
                <FriendsTrendChart />
              </div>
            </div>
            <div className={styles.layer}>
              <div className={`${styles.box} BoxContainer`}>
                <div className="Box">
                  <div className="header">
                    <h3>Email Invitation</h3>
                    <i>
                      <IconEmailOutline />
                    </i>
                  </div>
                </div>
              </div>
              <div className={`${styles.box} BoxContainer`}>
                <div className="Box">
                  <div className="header">
                    <h3>Friend Link</h3>
                    <i>
                      <IconUser />
                    </i>
                  </div>
                </div>
              </div>
              <div className={`${styles.box} BoxContainer`}>
                <div className="Box">
                  <div className="header">
                    <h3>Search for Friends</h3>
                  </div>
                  <SearchBar
                    searchQuery={searchQuery}
                    setSearchQuery={setSearchQuery}
                  />
                  <SearchUsers
                    searchQuery={searchQuery}
                    onClick={(userInfo) => {
                      router.push(`/dashboard/user/${userInfo.user_id}`);
                    }}
                  />
                </div>
              </div>
              <div className={`${styles.box} BoxContainer`}>
                <div className="Box">
                  <div className="header">
                    <h3>Friend Requests</h3>
                  </div>
                  <FriendRequestsViewer />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Friends;
