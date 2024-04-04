"use client";

import React, { useState, useEffect, useRef } from "react";
import styles from "./page.module.css";
import MyGroupsViewer from "@/app/components/Groups/MyGroupsViewer/MyGroupsViewer";
import CreateGroupModal from "@/app/components/Modals/CreateGroupModal/CreateGroupModal";
import TagContainerGen from "@/app/components/Inputs/TagContainerGen/TagContainerGen";
import SearchBar from "@/app/components/Inputs/SearchBar/SearchBar";
import BlobBtn from "@/app/components/Buttons/BlobBtn/BlobBtn";
import GroupsContainer from "@/app/components/Groups/GroupsContainer/GroupsContainer";
import EditGroupModal from "@/app/components/Groups/EditGroupModal/EditGroupModal";

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
      <EditGroupModal
        setIsOpen={setIsEditGroupModal}
        isOpen={isEditGroupModal}
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