import styles from "./UserGroupViewer.module.css";
import React from "react";
import GroupContainer from "@/app/components/Groups/GroupContainer/GroupContainer";

function UserGroupViewer({ userInfo }) {
  return (
    <div
      className={`${styles.UserGroupViewer} ${
        userInfo.activeGroup ? styles.visible : null
      }`}
    >
      <p className={"overflowDot"}>
        inside <strong>{userInfo.activeGroup?.name}</strong>
      </p>
      <div className={styles.hoverEl}>
        {userInfo.activeGroup ? (
          <GroupContainer
            groupInfo={userInfo.activeGroup}
            style={{ height: "15rem" }}
          />
        ) : null}
      </div>
    </div>
  );
}

export default UserGroupViewer;
