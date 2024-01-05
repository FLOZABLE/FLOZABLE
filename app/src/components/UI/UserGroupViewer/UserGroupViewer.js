import styles from "./UserGroupViewer.module.css";
import { socket } from "../../../socket";
import { useEffect, useState } from "react";
import GroupsGen from "../GroupsGen/GroupsGen";
import FriendGroupContainer from "../FriendGroupContainer/FriendGroupContainer";

function UserGroupViewer({ userInfo, setResponse, myInfo, setJoinTarget, myGroups, setMyGroups, setOtherGroups }) {
  const [groupName, setGroupName] = useState("");
  const [activeGroup, setActiveGroup] = useState(null);
  const [isGroupPwModal, setIsGroupPwModal] = useState(false);

  useEffect(() => {
    if (!userInfo) return;
    console.log(userInfo);
    const { ActiveGroup } = userInfo;
    if (ActiveGroup) {
      console.log(ActiveGroup)
      setActiveGroup(ActiveGroup);
      setGroupName(<p>inside <strong>{ActiveGroup.name}</strong></p>);
    };
  }, [userInfo]);

  return (
    <div className={styles.UserGroupViewer}>
      {groupName}
      <div className={styles.hoverEl}>
        {/* <FriendGroupContainer
          groupInfo={activeGroup}
          userInfo={userInfo}
          myInfo={myInfo}
          setIsGroupPwModal={setIsGroupPwModal}
          setJoinTarget={setJoinTarget}
        /> */}
        <GroupsGen
          groups={[activeGroup]}
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
};

export default UserGroupViewer;