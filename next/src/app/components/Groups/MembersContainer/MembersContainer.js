import React, { useContext } from "react";
import styles from "./MembersContainer.module.css";
import MyEl from "../MyEl/MyEl";
import MemberEl from "../MemberEl/MemberEl";
import CircularLoading from "../../LoadingScreen/CircularLoading/CircularLoading";
import { UserInfoContext } from "@/app/utils/Contexts";

//window.localStorage.setItem('debug', 'mediasoup-client:WARN* mediasoup-client:ERROR*');

function MembersContainer({ members, recvTransport, device, videoStream }) {
  const { userInfo } = useContext(UserInfoContext);

  if (!userInfo) return <CircularLoading />;

  return (
    <div className={styles.MembersContainer}>
      {members.map((member, i) => {
        if (userInfo.user_id === member.user_id) {
          return <MyEl key={i} userInfo={member} videoStream={videoStream} />;
        } else {
          return (
            <div key={i}>
              <MemberEl
                memberInfo={member}
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
