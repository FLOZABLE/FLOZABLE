import React, { useState, useEffect, useRef } from "react";
import styles from "./page.module.css";
import GroupPwModal from "@/Components/Modals/GroupPwModal/GroupPwModal";

function Groups({
  userInfo,
  subjects,
  otherGroups,
  setOtherGroups,
  myGroups,
  setMyGroups,
  setResponse,
  bringGroups,
  setIsChatModal,
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
    const searchParams = new URLSearchParams(window.location.search);
    const selectedGroupId = searchParams.get("joinId");

    if (!selectedGroupId) return;

    otherGroups.map((group) => {
      if (group.group_id === selectedGroupId) {
        setJoinTarget({ ...group });
        setIsGroupPwModal(true);
        setJoinByLink(true);
      }
    });
  }, [otherGroups]);

  return (
    <div>
      <CreateGroupModal
        isOpen={isCreateNewGroup}
        setIsOpen={setIsCreateNewGroup}
        setCreateGroupResponse={setResponse}
      />
      <GroupPwModal
        isOpen={isGroupPwModal}
        setIsOpen={setIsGroupPwModal}
        groupInfo={joinTarget}
        joinByLink={joinByLink}
        setJoinByLink={setJoinByLink}
        groupsViewerRef={groupsViewerRef}
      />
      <EditGroupModal
        setCreateGroupResponse={setResponse}
        setIsOpen={setIsEditGroupModal}
        isOpen={isEditGroupModal}
        setMyGroups={setMyGroups}
        myGroups={myGroups}
      />
      <div
        className={`Main`}
      >
        <div className="title">
          Groups
        </div>
        <div className={styles.Groups}>
          <div className={styles.box}>
            <MyGroupsViewer
              myGroups={myGroups}
              userInfo={userInfo}
              myTimerTotal={myTimerTotal}
              setIsChatModal={setIsChatModal}
              groupsViewerRef={groupsViewerRef}
              setIsEditGroupModal={setIsEditGroupModal}
            />
          </div>
          <div className={styles.box}>
            <div className={styles.searchOpt}>
              <div>
                <div className={styles.tagContainerWrapper}>
                  <TagContainerGen
                    maxTags={10}
                    setTags={setTags}
                    handleCreatedTagsChange={handleCreatedTagsChange}
                  />
                </div>
              </div>
              <div>
                <div className={styles.searchWrapper}>
                  <SearchBar
                    setSearchQuery={setSearchQuery}
                    searchQuery={searchQuery}
                  />
                </div>
              </div>
              <div>
                <BlobBtn
                  name={"+ Create new group"}
                  setClicked={() => {
                    setIsCreateNewGroup(!isCreateNewGroup);
                  }}
                  color1={"#fff"}
                  color2={"var(--purple2)"}
                />
              </div>
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
                setResponse={setResponse}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Groups;