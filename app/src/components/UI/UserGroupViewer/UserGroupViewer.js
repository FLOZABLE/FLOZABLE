import styles from "./UserGroupViewer.module.css";
import { socket } from "../../../socket";
import { useEffect, useState } from "react";
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
        <p>
          inside <strong>{ActiveGroup.name}</strong>
        </p>,
      );
    }
  }, [userInfo]);

  useEffect(() => {
    if (!userInfo) return;

    const onDeActiveGroup = () => {
      setActiveGroup([]);
      setGroupName("");
    };

    socket.on(`deActiveGroup:${userInfo.user_id}`, onDeActiveGroup);

    return () => {
      socket.off(`deActiveGroup:${userInfo.user_id}`, onDeActiveGroup);
    };
  }, [userInfo]);

  return (
    <div className={styles.UserGroupViewer}>
      {groupName}
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
