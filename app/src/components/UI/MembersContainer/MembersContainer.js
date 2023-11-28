import { useCallback, useEffect, useState } from "react";
import styles from "./MembersContainer.module.css";
import MemberEl from "../MemberEl/MemberEl";
import MyEl from "../MyEl/MyEl";

const serverOrigin = process.env.REACT_APP_ORIGIN;

function MembersContainer({memberIdsArr, isFocus, userInfo, groupInfo}) {
  const [membersData, setMembersData] = useState([]);
  useEffect(() => {
    console.log('gdddd', userInfo, groupInfo)
    if (!userInfo || !groupInfo) return;
    if (isFocus) {
      console.log('gd', groupInfo.group_id)
      fetch(`${serverOrigin}/api/groups/members?groupId=${groupInfo.group_id}`, {
        method: "get", 
        headers: {
          "Content-Type": "application/json",
        },
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.success) {
            setMembersData(data.membersData);
          }
        })
        .catch((error) => console.error(error));
    } else if (memberIdsArr){
      setMembersData(memberIdsArr.map(id => {return {user_id: id}}));
    }
  }, [memberIdsArr, isFocus, userInfo, groupInfo]);

  return (
    <div className={styles.MembersContainer}>
      {membersData.map((memberData, i) => {
        const {user_id, name, totalTime, activeSubject} = memberData;
        if (userInfo && userInfo.user_id === user_id) {
          return (
            <MyEl />
          )
        } else {
          return (
            <MemberEl />
          )
        }
      })}
    </div>
  )
};

export default MembersContainer;