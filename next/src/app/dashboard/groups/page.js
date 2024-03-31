"use client";

import React, { useState, useEffect, useRef } from "react";
import styles from "./page.module.css";
import MyGroupsViewer from "@/Components/Groups/MyGroupsViewer/MyGroupsViewer";
import CreateGroupModal from "@/Components/Modals/CreateGroupModal/CreateGroupModal";
import TagContainerGen from "@/Components/Inputs/TagContainerGen/TagContainerGen";
import SearchBar from "@/Components/Inputs/SearchBar/SearchBar";
import BlobBtn from "@/Components/Buttons/BlobBtn/BlobBtn";
import GroupsContainer from "@/Components/Groups/GroupsContainer/GroupsContainer";

function Groups({
  setResponse,
}) {

  const [tags, setTags] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateNewGroup, setIsCreateNewGroup] = useState(false);
  const [isEditGroupModal, setIsEditGroupModal] = useState(false);

  const groupsViewerRef = useRef(null);

  const handleCreatedTagsChange = (tags) => {
    setTags(tags);
  };

  return (
    <div>
      <CreateGroupModal
        isOpen={isCreateNewGroup}
        setIsOpen={setIsCreateNewGroup}
        setCreateGroupResponse={setResponse}
      />
      {/* <EditGroupModal
        setCreateGroupResponse={setResponse}
        setIsOpen={setIsEditGroupModal}
        isOpen={isEditGroupModal}
        setMyGroups={setMyGroups}
        myGroups={myGroups}
      /> */}
      <div
        className={`Main`}
      >
        <div className="title">
          Groups
        </div>
        <div className={styles.Groups}>
          <div className={styles.box}>
            <MyGroupsViewer
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
              <GroupsContainer
                queryTags={tags}
                searchQuery={searchQuery}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Groups;