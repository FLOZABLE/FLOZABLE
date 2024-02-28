import styles from "./UserGroupViewer.module.css";
import { socket } from "../../../socket";
import React, { useEffect, useState } from "react";
import GroupsGen from "../GroupsGen/GroupsGen";

function UserGroupViewer({
  userInfo,
  setResponse,
  myInfo,
  setJoinTarget,
  myGroups,
  setMyGroups,
  setOtherGroups,
  setIsGroupPwModal,
}) {
  const [groupName, setGroupName] = useState("");
  const [activeGroup, setActiveGroup] = useState([]);

  useEffect(() => {
    if (!userInfo) return;
    const { ActiveGroup } = userInfo;
    if (ActiveGroup) {
      setActiveGroup([ActiveGroup]);
      setGroupName(
        ActiveGroup.name
      );
    }
  }, [userInfo]);

  useEffect(() => {
    if (!userInfo) return;

    const onDeActiveGroup = () => {
      setActiveGroup([]);
      setGroupName("");
    };

    const onActiveGroup = ({groupInfo, time}) => {
      setActiveGroup([groupInfo]);
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
    <div className={`${styles.UserGroupViewer} ${activeGroup.length ? styles.visible : ''}`}>
      <p>
      inside <strong>{groupName}</strong>
      </p>
      <div className={styles.hoverEl}>
        <GroupsGen
          groups={activeGroup}
          myGroups={myGroups}
          setMyGroups={setMyGroups}
          setOtherGroups={setOtherGroups}
          setJoinGroupResponse={setResponse}
          setIsGroupPwModal={setIsGroupPwModal}
          setJoinTarget={setJoinTarget}
          userInfo={myInfo}
          queryTags={[]}
          type={1}
        />
      </div>
    </div>
  );
}

export default UserGroupViewer;
