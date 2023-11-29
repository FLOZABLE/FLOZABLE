import { useCallback, useEffect, useState } from "react";
import styles from "./MembersContainer.module.css";
import MemberEl from "../MemberEl/MemberEl";
import MyEl from "../MyEl/MyEl";

const serverOrigin = process.env.REACT_APP_ORIGIN;

function MembersContainer({memberIdsArr, isFocus, userInfo, groupInfo}) {
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
            const {membersData} = data;
            setMembersEl(membersData.map((memberInfo, i) => {
              if (userInfo.user_id === memberInfo.user_id) {
                return (
                  <MyEl 
                  memberInfo={memberInfo}
                  key={i}
                  />
                )
              } else {
                return (
                  <MemberEl 
                  memberInfo={memberInfo}
                  key={i}
                  />
                )
              }
            }))
          }
        })
        .catch((error) => console.error(error));
    } else if (memberIdsArr){
      
    }
  }, [memberIdsArr, isFocus, userInfo, groupInfo]);

  return (
    <div className={styles.MembersContainer}>
      {membersEl}
    </div>
  )
};

export default MembersContainer;