import styles from "./UserGroupViewer.module.css";
import React, { useEffect, useState } from "react";
import { socket } from "@/app/utils/socket";
import GroupContainer from "@/app/components/Groups/GroupContainer/GroupContainer";

function UserGroupViewer({
  userInfo,
}) {

  const [groupName, setGroupName] = useState("");
  const [activeGroup, setActiveGroup] = useState(null);

  useEffect(() => {
    if (!userInfo) return;
    const { ActiveGroup } = userInfo;
    if (ActiveGroup) {
      setActiveGroup(ActiveGroup);
      setGroupName(
        ActiveGroup.name
      );
    }
  }, [userInfo]);

  useEffect(() => {
    if (!userInfo) return;

    const onDeActiveGroup = () => {
      setActiveGroup(null);
      setGroupName("");
    };

    const onActiveGroup = ({ groupInfo, time }) => {
      setActiveGroup(groupInfo);
      setGroupName(groupInfo.name);
    };

    socket.on(`deActiveGroup:${userInfo.user_id}`, onDeActiveGroup);
    socket.on(`activeGroup:${userInfo.user_id}`, onActiveGroup);

    return () => {
      socket.off(`deActiveGroup:${userInfo.user_id}`, onDeActiveGroup);
      socket.off(`activeGroup:${userInfo.user_id}`, onActiveGroup);
    };
  }, [userInfo]);

  return (
    <div className={`${styles.UserGroupViewer} ${activeGroup ? styles.visible : ''}`}>
      <p>
        inside <strong>{groupName}</strong>
      </p>
      <div className={styles.hoverEl}>
        {activeGroup ?
          <GroupContainer
            groupInfo={activeGroup}
          />
          :
          null
        }
      </div>
    </div>
  );
}

export default UserGroupViewer;
