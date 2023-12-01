import { useCallback, useEffect, useState } from "react";
import styles from "./MembersContainer.module.css";
import MemberEl from "../MemberEl/MemberEl";
import MyEl from "../MyEl/MyEl";
import { mediaSocket } from "../../../mediaSocket";

const serverOrigin = process.env.REACT_APP_ORIGIN;

function MembersContainer({isFocus, userInfo, groupInfo, socket, setStudyingMembers, members, setMembers, localStream}) {
  const [membersEl, setMembersEl] = useState([]);
  const [rtpCapabilities, setRtpCapabilities] = useState(null);
  useEffect(() => {
    if (!userInfo || !groupInfo) return;
    if (isFocus) {
      const {group_id} = groupInfo;
      fetch(`${serverOrigin}/api/groups/members?groupId=${group_id}`, {
        method: "get", 
        headers: {
          "Content-Type": "application/json",
        },
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.success) {
            setMembers(data.membersData);
            mediaSocket.emit('changeGroup', group_id, (data) => {
              console.log(`Router RTP Capabilities...`, data.rtpCapabilities)
              // we assign to local variable and will be used when
              // loading the client Device (see createDevice above)
              /* setRtpCapabilities(data.rtpCapabilities);
          
              // once we have rtpCapabilities from the Router, create Device
              createDevice(data.rtpCapabilities) */
              setRtpCapabilities(data.rtpCapabilities);
              //crea
              //createDevice();
            });
          };
        })
        .catch((error) => console.error(error));
    }
  }, [isFocus, userInfo, groupInfo]);

  useEffect(() => {
    setMembersEl(members.map((memberInfo, i) => {
      if (userInfo.user_id === memberInfo.user_id) {
        return (
          <MyEl 
          memberInfo={memberInfo}
          key={i}
          socket={socket}
          setStudyingMembers={setStudyingMembers}
          localStream={localStream}
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
  }, [members, localStream]);

  return (
    <div className={styles.MembersContainer}>
      {membersEl}
    </div>
  )
};

export default MembersContainer;