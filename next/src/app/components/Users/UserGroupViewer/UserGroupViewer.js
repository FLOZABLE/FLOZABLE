import styles from "./UserGroupViewer.module.css";
import React, { useEffect, useState } from "react";
import { socket } from "@/app/utils/socket";
import GroupContainer from "@/app/components/Groups/GroupContainer/GroupContainer";

function UserGroupViewer({ userInfo }) {
  const [groupName, setGroupName] = useState("");
  const [activeGroup, setActiveGroup] = useState(null);

  useEffect(() => {
    if (!userInfo) return;

    const { activeGroup } = userInfo;
    console.log(activeGroup, "activegroup");
    if (activeGroup) {
      setActiveGroup(activeGroup);
      setGroupName(activeGroup.name);
    }

    const onDeActiveGroup = () => {
      setActiveGroup(null);
      setGroupName("");
    };

    const onActiveGroup = (userId, groupInfo) => {
      if (userId !== userInfo.user_id) return;

      console.log(groupInfo);
      setActiveGroup(groupInfo);
      setGroupName(groupInfo.name);
    };

    socket.on(`deActiveGroup`, onDeActiveGroup);
    socket.on(`activeGroup`, onActiveGroup);

    return () => {
      socket.off(`deActiveGroup`, onDeActiveGroup);
      socket.off(`activeGroup`, onActiveGroup);
    };
  }, [userInfo]);

  return (
    <div
      className={`${styles.UserGroupViewer} ${
        activeGroup ? styles.visible : ""
      }`}
    >
      <p>
        inside <strong>{groupName}</strong>
      </p>
      <div className={styles.hoverEl}>
        {activeGroup ? <GroupContainer groupInfo={activeGroup} /> : null}
      </div>
    </div>
  );
}

export default UserGroupViewer;
