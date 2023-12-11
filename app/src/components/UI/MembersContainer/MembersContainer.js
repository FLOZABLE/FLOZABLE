import { useCallback, useEffect, useState } from "react";
import styles from "./MembersContainer.module.css";
import MemberEl from "../MemberEl/MemberEl";
import MyEl from "../MyEl/MyEl";
import { mediaSocket } from "../../../mediaSocket";
import { Device } from "mediasoup-client";

const serverOrigin = process.env.REACT_APP_ORIGIN;

let device;

function MembersContainer({isFocus, userInfo, groupInfo, socket, setStudyingMembers, members, setMembers, isCam, isMic}) {
  const [membersEl, setMembersEl] = useState([]);
  const [rtpCapabilities, setRtpCapabilities] = useState(null);
  const [localStream, setLocalStream] = useState(null);

  useEffect(() => {
    if (!userInfo || !groupInfo || !isFocus) return;
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
        };
      })
      .catch((error) => console.error(error));
  }, [isFocus, userInfo, groupInfo]);

  useEffect(() => {
    if(!isFocus) return;
    try {
      device = new Device();
      console.log(device)
    } catch (err) {
      console.log(err);
    }
  }, [isFocus]);

  useEffect(() => {
    if (isCam || isMic) {
      navigator.mediaDevices
        .getUserMedia({
          audio: false,
          video: {
            width: {
              min: 640,
              max: 1920,
            },
            height: {
              min: 400,
              max: 1080,
            }
          }
        })
        .then(async(stream) => {
          setLocalStream(stream);
          try {
          } catch (err) {
            console.log(err);
          }
        });
    };
  }, [isCam, isMic]);

  useEffect(() => {
    if (!userInfo) return;
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
  }, [members, localStream, userInfo]);

  return (
    <div className={styles.MembersContainer}>
      {membersEl}
    </div>
  )
};

export default MembersContainer;