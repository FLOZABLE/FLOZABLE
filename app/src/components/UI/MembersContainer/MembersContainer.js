import { useCallback, useEffect, useState } from "react";
import styles from "./MembersContainer.module.css";
import MemberEl from "../MemberEl/MemberEl";
import MyEl from "../MyEl/MyEl";

const serverOrigin = process.env.REACT_APP_ORIGIN;

function MembersContainer({memberIdsArr, isFocus, userInfo, groupInfo, socket, myTimerTotal, setStudyingMembers, members, setMembers}) {
  const [membersEl, setMembersEl] = useState([]);

  useEffect(() => {
    if (!userInfo || !groupInfo) return;
    if (isFocus) {
      fetch(`${serverOrigin}/api/groups/members?groupId=${groupInfo.group_id}`, {
        method: "get", 
        headers: {
          "Content-Type": "application/json",
        },
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.success) {
            setMembers(data.membersData);
          };
        })
        .catch((error) => console.error(error));
    } else if (memberIdsArr){
      
    };
  }, [memberIdsArr, isFocus, userInfo, groupInfo]);

  useEffect(() => {
    setMembersEl(members.map((memberInfo, i) => {
      if (userInfo.user_id === memberInfo.user_id) {
        return (
          <MyEl 
          memberInfo={memberInfo}
          key={i}
          socket={socket}
          setStudyingMembers={setStudyingMembers}
          myTimerTotal={myTimerTotal}
          />
        )
      } else {
        return (
          <MemberEl 
          memberInfo={memberInfo}
          key={i}
          socket={socket}
          setStudyingMembers={setStudyingMembers}
          />
        )
      }
    }));
  }, [members]);

  return (
    <div className={styles.MembersContainer}>
      {membersEl}
    </div>
  )
};

export default MembersContainer;