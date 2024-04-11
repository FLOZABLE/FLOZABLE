import React, { useContext, useEffect, useRef, useState } from "react";
import styles from "./MembersContainer.module.css";
import { UserInfoContext } from "@/app/utils/Contexts";
import MyEl from "../MyEl/MyEl";
import MemberEl from "../MemberEl/MemberEl";
import { useContextMenu } from "react-contexify";

//window.localStorage.setItem('debug', 'mediasoup-client:WARN* mediasoup-client:ERROR*');

function MembersContainer({
  setStudyingMembers,
  members,
  recvTransport,
  device,
  videoStream,
  group,
  setRightClickedMember
}) {
  const {userInfo} = useContext(UserInfoContext);

  const { show } = useContextMenu({
    id: "ffffff",
  });

  function handleContextMenu(event, memberInfo) {
    if (group.leader !== userInfo.user_id) return;
    setRightClickedMember({ ...memberInfo, groupId: group.group_id });
    show({
      event
    });
  }

  return (
    <div className={styles.MembersContainer}>
      {members.map((member, i) => {
        if (userInfo.user_id === member.user_id) {
          return (
            <MyEl
              key={i}
              setStudyingMembers={setStudyingMembers}
              videoStream={videoStream}
            />
          );
        } else {
          return (
            <div onContextMenu={(event) => { handleContextMenu(event, member) }} key={i}>
              <MemberEl
                memberInfo={member}
                setStudyingMembers={setStudyingMembers}
                device={device}
                recvTransport={recvTransport}
              />
            </div>
          );
        }
      })}
    </div>
  );
}

export default MembersContainer;
