import styles from "./UserGroupViewer.module.css";
import { socket } from "../../../socket";
import { useEffect, useState } from "react";
import GroupsGen from "../GroupsGen/GroupsGen";

function UserGroupViewer({ userInfo, setResponse }) {
  const [groupName, setGroupName] = useState("");
  const [activeGroup, setActiveGroup] = useState([]);
  const [isGroupPwModal, setIsGroupPwModal] = useState(false);

  useEffect(() => {
    if (!userInfo) return;
    console.log(userInfo);
    const { ActiveGroup } = userInfo;
    setActiveGroup([ActiveGroup]);
  }, [userInfo]);

  return (
    <div className={styles.UserGroupViewer}>
      <p>inside <strong>Math club</strong></p>
      <div className={styles.hoverEl}>
        <GroupsGen
          setJoinGroupResponse={setResponse}
          groups={activeGroup}
          setOpenGroupPwModal={setIsGroupPwModal}
          searchQuery={""}
          userInfo={userInfo}
          queryTags={[]}
        />
      </div>
    </div>
  );
};

export default UserGroupViewer;