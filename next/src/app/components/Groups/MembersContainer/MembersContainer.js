import React, { useContext, useEffect, useRef, useState } from "react";
import styles from "./MembersContainer.module.css";
import { UserInfoContext } from "@/app/utils/Contexts";
import MyEl from "../MyEl/MyEl";
import MemberEl from "../MemberEl/MemberEl";

//window.localStorage.setItem('debug', 'mediasoup-client:WARN* mediasoup-client:ERROR*');

function MembersContainer({
  setStudyingMembers,
  members,
  recvTransport,
  device,
  videoStream,
}) {
  const {userInfo} = useContext(UserInfoContext);
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
            <MemberEl
              memberInfo={member}
              key={i}
              setStudyingMembers={setStudyingMembers}
              device={device}
              recvTransport={recvTransport}
            />
          );
        }
      })}
    </div>
  );
}

export default MembersContainer;
