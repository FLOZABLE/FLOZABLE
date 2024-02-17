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

  return (
    <div className={styles.Friends}>
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
        className={`Main ${styles.Main}`}
      >
        <div>
          <div className={styles.box} id={styles.activeFriends}>
            <h3>Current Active Friends</h3>
            <div className={styles.userContainer}>
              <Link
                className={styles.profile}
              >
                <div className={styles.profileImg}
                  style={{
                    backgroundImage: `url("${serverOrigin}/profile-images/{user_id}.jpeg")`, backgroundSize: 'cover',
                    backgroundPosition: 'center center',
                    backgroundRepeat: 'no-repeat',
                  }}
                >
                </div>
                <p>name</p>
              </Link>
              <i>
                <FontAwesomeIcon icon={faCaretRight} />
              </i>
              <div className={styles.activeInfo}>
                <div>
                  Studying <strong>sdfsdf</strong> for 0:00:00
                </div>
                <div>
                  since 12:00 am
                </div>
              </div>
            </div>
            <div className={styles.userContainer}>
              <Link
                className={styles.profile}
              >
                <div className={styles.profileImg}
                  style={{
                    backgroundImage: `url("${serverOrigin}/profile-images/{user_id}.jpeg")`, backgroundSize: 'cover',
                    backgroundPosition: 'center center',
                    backgroundRepeat: 'no-repeat',
                  }}
                >
                </div>
                <p>name</p>
              </Link>
              <i>
                <FontAwesomeIcon icon={faCaretRight} />
              </i>
              <div className={styles.activeInfo}>
                <div>
                  Studying <strong>sdfsdf</strong> for 0:00:00
                </div>
                <div>
                  since 12:00 am
                </div>
              </div>
            </div>
          </div>
        </div>
        <div>
          <div className={styles.smallBox}>
            <p>Email Invitation</p>
            <i>
              <IconEmailOutline />
            </i>
          </div>
          <div className={styles.smallBox}>
            <p>Friend Link</p>
            <i>
              <IconUser />
            </i>
          </div>
          <div className={styles.smallBox}>
            <p>Challenge URL</p>
            <i>
              <IconFire />
            </i>
          </div>
          <div className={styles.smallBox} id={styles.friendRank}>
            <h3>Friend's Rank</h3>
            <i>
              <IconStatsChart />
            </i>
            {/* <FriendsRankingViewer userInfo={userInfo}/> */}
          </div>
        </div>
        <div>
          <div className={styles.smallBox}>
            <h3>Search for Friends</h3>
            
          </div>
        </div>
        {/* <div className={styles.fixedBoxContainer}>
          <div className={styles.box}>
            <FriendRequestsViewer
              notifications={notifications}
              setNotifications={setNotifications}
              setResponse={setResponse}
              userInfo={userInfo}
            />
          </div>
          <div className={styles.box}>
            <FriendsRankingViewer userInfo={userInfo} />
          </div>
          <div className={styles.box}>
            <RecommendedFriendsViewer
              setResponse={setResponse}
            />
          </div>
        </div>
        <div className={styles.boxesWrapper}>
          <div className={styles.box} id={styles.links}>
            <div className={styles.buttonsWrapper}>
              <div className={styles.buttonContainer}>
                <button
                  onClick={() => {
                    setIsFriendLinkModal(true);
                  }}
                >
                  <i>
                    <FriendLink />
                  </i>
                  <p>Friend Link</p>
                  <i>
                    <FontAwesomeIcon icon={faAngleRight} />
                  </i>
                </button>
              </div>
              <div className={styles.buttonContainer}>
                <button
                  onClick={() => {
                    setIsFriendEmailModal(true);
                  }}
                >
                  <i>
                    <EmailInvitation width={"50px"} height={"50px"} />
                  </i>
                  <p>Email Invitation</p>
                  <i>
                    <FontAwesomeIcon icon={faAngleRight} />
                  </i>
                </button>
              </div>
              <div className={styles.buttonContainer}>
                <button>
                  <i>
                    <Fight1 />
                  </i>
                  <p>Create Challenge URL</p>
                  <i>
                    <FontAwesomeIcon icon={faAngleRight} />
                  </i>
                </button>
              </div>
              <div className={styles.buttonContainer}>
              </div>
            </div>
          </div>
          <div className={styles.box}>
            <div className={styles.friendSearchWrapper}>
              <Search
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
              />
            </div>
            <div className={styles.title}>
              <h3>Friends</h3>
              <div className={styles.count}>
                {friendCount}
              </div>
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
            {suggestionsCount ? <div className={styles.title}>
              <h3>Suggestions</h3>
              <div className={styles.count}>
                {suggestionsCount}
              </div>
            </div> : null}
            <SearchUsers
              searchQuery={searchQuery}
              setCount={setSuggestionsCount}
              setResponse={setResponse}
            />
          </div>
        </div> */}
      </div>
    </div>
  );
}

export default Friends;