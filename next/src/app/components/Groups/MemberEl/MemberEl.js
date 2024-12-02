import React, { useEffect, useState } from "react";
import styles from "./MemberEl.module.css";
import { DateTime } from "luxon";
import { RestPerson, StudyPerson } from "@/app/utils/Svg";
import MemberCamDisp from "../MemberCamDisp.js/MemberCamDisp";
import Link from "next/link";
import MemberTimer from "../MemberTimer/MemberTimer";
import ProfileImage from "../../Users/ProfileImage/ProfileImage";

function MemberEl({ memberInfo, device, recvTransport }) {
  const [run, setRun] = useState(false);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    if (!memberInfo) return;

    const { study_time, activeSubject } = memberInfo;
    console.log("member", memberInfo);
    if (activeSubject && activeSubject.subject_id !== "0") {
      setRun(true);
      const liveTotal =
        study_time + DateTime.now().toSeconds() - activeSubject.time;
      setTotal(liveTotal);
    } else {
      setTotal(study_time);
      setRun(false);
    }
  }, [memberInfo]);

  return (
    <div className={styles.Member}>
      <MemberCamDisp
        memberInfo={memberInfo}
        device={device}
        recvTransport={recvTransport}
      />
      <div className={styles.inner}>
        <Link
          href={`/dashboard/user/${memberInfo.user_id}`}
          className={styles.userInfo}
        >
          <div className={styles.userName}>{memberInfo.name}</div>
        </Link>
        <i className={styles.icon}>{run ? <StudyPerson /> : <RestPerson />}</i>
        <div className={styles.timer}>
          <MemberTimer initialSec={total} run={run} />
        </div>
        <div className={styles.ProfileImage}>
          <ProfileImage userId={memberInfo.user_id} />
        </div>
      </div>
    </div>
  );
}

export default MemberEl;
