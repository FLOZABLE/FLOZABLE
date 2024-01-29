import React, { useState, useEffect, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faTags } from "@fortawesome/free-solid-svg-icons";
import StuckModal from "../../UI/StuckModal/StuckModal";
import Search from "../../UI/Search/Search";
import TagContainerGen from "../../UI/TagContainerGen/TagContainerGen";
import styles from "./Groups.module.css";
import GroupsGen from "../../UI/GroupsGen/GroupsGen";
import GroupPwModal from "../../UI/GroupPwModal/GroupPwModal";
import MyGroupsViewer from "../../UI/MyGroupsViewer/MyGroupsViewer";
import CreateGroupModal from "../../UI/CreateGroupModal/CreateGroupModal";
import EditGroupModal from "../../UI/EditGroupModal/EditGroupModal";

function Groups({
  userInfo,
  subjects,
  otherGroups,
  setOtherGroups,
  myGroups,
  setMyGroups,
  setResponse,
  isSidebarOpen,
  isSidebarHovered,
  bringGroups,
  setIsChatModal
}) {

  const [tags, setTags] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isGroupPwModal, setIsGroupPwModal] = useState(false);
  const [joinTarget, setJoinTarget] = useState(null);
  const [myTimerTotal, setMyTimerTotal] = useState(0);
  const [isCreateNewGroup, setIsCreateNewGroup] = useState(false);
  const [joinByLink, setJoinByLink] = useState(false);
  const [isEditGroupModal, setIsEditGroupModal] = useState(false);

  const groupsViewerRef = useRef(null);

  const handleCreatedTagsChange = (tags) => {
    setTags(tags);
  };

  useEffect(() => {
    if (
      subjects.daily &&
      subjects.daily.groupedTotal[subjects.daily.groupedTotal.length - 1]
    ) {
      setMyTimerTotal(
        subjects.daily.groupedTotal[subjects.daily.groupedTotal.length - 1],
      );
    }
  }, [subjects]);

  useEffect(() => {
    if (userInfo === null || userInfo === undefined) return;
    bringGroups();
  }, [userInfo]);


  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const selectedGroupId = searchParams.get("joinId");

    if(!selectedGroupId) return;

    otherGroups.map((group) => {
      if (group.group_id === selectedGroupId) {
        setJoinTarget({ ...group });
        setIsGroupPwModal(true);
        setJoinByLink(true);
      }
    });
  }, [otherGroups]);

  return (
    <div className={styles.GroupsContainer}>
      <StuckModal />
      <CreateGroupModal
        isOpen={isCreateNewGroup}
        setIsOpen={setIsCreateNewGroup}
        setCreateGroupResponse={setResponse}
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
        joinByLink={joinByLink}
        setJoinByLink={setJoinByLink}
        userInfo={userInfo}
        groupsViewerRef={groupsViewerRef}
      />
      <EditGroupModal 
        setCreateGroupResponse={setResponse}
        setIsOpen={setIsEditGroupModal}
        isOpen={isEditGroupModal}
      />
      <div
        className={`Main ${isSidebarOpen || isSidebarHovered ? "sidebarOpen" : ""
          }`}
      >
        <div className={styles.boxes}>
          <div className={styles.box} id="daily">
            <div className={styles.buttonArea}>
              <p className={styles.title}>Groups</p>
            </div>
            <div className={`${styles.container} ${styles.myGroups}`}>
              <MyGroupsViewer
                myGroups={myGroups}
                userInfo={userInfo}
                myTimerTotal={myTimerTotal}
                setIsChatModal={setIsChatModal}
                groupsViewerRef={groupsViewerRef}
                setIsEditGroupModal={setIsEditGroupModal}
              />
            </div>
            <div className={`${styles.container} ${styles.allGroups}`}>
              <div className={styles.searchZone}>
                <div className={styles.tagContainerWrapper}>
                  <div className={styles.title}>
                    <i>
                      <FontAwesomeIcon icon={faTags} className={styles.faTags} />
                    </i>
                    <h2>Tags</h2>
                  </div>
                  <TagContainerGen
                    maxTags={10}
                    setTags={setTags}
                    handleCreatedTagsChange={handleCreatedTagsChange}
                  />
                </div>
                <Search
                  setSearchQuery={setSearchQuery}
                  searchQuery={searchQuery}
                />
                <button
                  id={styles.CreateGroupBtn}
                  onClick={() => {
                    setIsCreateNewGroup(!isCreateNewGroup);
                  }}
                >
                  <FontAwesomeIcon icon={faPlus} className={styles.plus} />
                  Create new group
                </button>
              </div>
              <div className={styles.groupsWrapper}>
                <GroupsGen
                  myGroups={myGroups}
                  setMyGroups={setMyGroups}
                  groups={otherGroups}
                  setOtherGroups={setOtherGroups}
                  setJoinGroupResponse={setResponse}
                  setIsGroupPwModal={setIsGroupPwModal}
                  setJoinTarget={setJoinTarget}
                  setJoinByLink={setJoinByLink}
                  searchQuery={searchQuery}
                  userInfo={userInfo}
                  queryTags={tags}
                  groupsViewerRef={groupsViewerRef}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Groups;