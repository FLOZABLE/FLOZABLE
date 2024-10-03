"use client";

import React, { useState } from "react";
import styles from "./page.module.css";
import CreateGroupModal from "@/app/components/Modals/CreateGroupModal/CreateGroupModal";
import SearchBar from "@/app/components/Inputs/SearchBar/SearchBar";
import GroupsContainer from "@/app/components/Groups/GroupsContainer/GroupsContainer";
import BlobBtn from "@/app/components/Buttons/BlobBtn/BlobBtn";
import MyGroupsViewer from "@/app/components/Groups/MyGroupsViewer/MyGroupsViewer";
import TagsGenerator from "@/app/components/Inputs/TagsGenerator/TagsGenerator";

function Groups({ setResponse }) {
  const [tags, setTags] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateNewGroup, setIsCreateNewGroup] = useState(false);

  return (
    <div className={`Main`}>
      <CreateGroupModal
        isOpen={isCreateNewGroup}
        setIsOpen={setIsCreateNewGroup}
        setCreateGroupResponse={setResponse}
      />
      <div className={styles.Groups}>
        <div className={styles.layer}>
          <div
            className={`BoxContainer ${styles.boxContainer}`}
            style={{ "--textColor": "#000000" }}
          >
            <MyGroupsViewer />
          </div>
        </div>
        <div className={styles.layer}>
          <div className={`BoxContainer ${styles.boxContainer}`}>
            <div className={styles.header}>
              <div className={styles.headerItem} id={styles.Tags}>
                <TagsGenerator tags={tags} setTags={setTags} />
              </div>
              <div className={styles.headerItem} id={styles.SearchBar}>
                <SearchBar
                  searchQuery={searchQuery}
                  setSearchQuery={setSearchQuery}
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
