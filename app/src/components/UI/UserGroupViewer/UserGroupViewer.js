import styles from "./UserGroupViewer.module.css";
import { socket } from "../../../socket";
import { useEffect, useState } from "react";
import GroupsGen from "../GroupsGen/GroupsGen";

function UserGroupViewer({ userInfo, setResponse, myInfo }) {
  const [groupName, setGroupName] = useState("");
  const [activeGroup, setActiveGroup] = useState([]);
  const [isGroupPwModal, setIsGroupPwModal] = useState(false);

  useEffect(() => {
    if (!userInfo) return;
    console.log(userInfo);
    const { ActiveGroup } = userInfo;
    if (ActiveGroup) {
      console.log(ActiveGroup)
      setActiveGroup([ActiveGroup]);
      setGroupName(<p>inside <strong>{ActiveGroup.name}</strong></p>);
    };
  }, [userInfo]);

  return (
    <div className={styles.UserGroupViewer}>
      {groupName}
      <div className={styles.hoverEl}>
        <GroupsGen
          setJoinGroupResponse={setResponse}
          groups={activeGroup}
          setOpenGroupPwModal={setIsGroupPwModal}
          searchQuery={""}
          userInfo={myInfo}
          queryTags={[]}
        />
      </div>
    </div>
  );
};

export default UserGroupViewer;