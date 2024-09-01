"use client";

import React, { useState } from "react";
import styles from "./page.module.css";
import CreateGroupModal from "@/app/components/Modals/CreateGroupModal/CreateGroupModal";
import TagContainerGen from "@/app/components/Inputs/TagContainerGen/TagContainerGen";
import SearchBar from "@/app/components/Inputs/SearchBar/SearchBar";
import GroupsContainer from "@/app/components/Groups/GroupsContainer/GroupsContainer";
import MemberContextMenu from "@/app/components/Groups/MemberContextMenu/MemberContextMenu";
import BlobBtn from "@/app/components/Buttons/BlobBtn/BlobBtn";
import MyGroupsViewer from "@/app/components/Groups/MyGroupsViewer/MyGroupsViewer";

function Groups({ setResponse }) {
  const [tags, setTags] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateNewGroup, setIsCreateNewGroup] = useState(false);
  const [rightClickedMember, setRightClickedMember] = useState(null);

  return (
    <div className={`Main`}>
      <MemberContextMenu
        MENU_ID="ffffff"
        rightClickedMember={rightClickedMember}
      />
      <CreateGroupModal
        isOpen={isCreateNewGroup}
        setIsOpen={setIsCreateNewGroup}
        setCreateGroupResponse={setResponse}
      />
      <div className={styles.Groups}>
        <div className={styles.layer}>
          <div className={`BoxContainer ${styles.boxContainer}`} style={{"--textColor": "blue"}}>
            <MyGroupsViewer />
          </div>
        </div>
        <div className={styles.layer}>
          <div className={`BoxContainer ${styles.boxContainer}`}>
            <div className={styles.header}>
              <div className={styles.headerItem} id={styles.SearchBar}>
                <SearchBar
                  searchQuery={searchQuery}
                  setSearchQuery={setSearchQuery}
                />
              </div>
              <div className={styles.headerItem} id={styles.Tags}>
                <TagContainerGen
                  maxTags={10}
                  handleCreatedTagsChange={setTags}
                />
              </div>
              <div className={styles.headerItem} id={styles.CreateGroup}>
                <BlobBtn
                  onClick={() => {
                    setIsCreateNewGroup(!isCreateNewGroup);
                  }}
                >
                  + Create new group
                </BlobBtn>
              </div>
            </div>
            <GroupsContainer searchQuery={searchQuery} tags={tags} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Groups;
