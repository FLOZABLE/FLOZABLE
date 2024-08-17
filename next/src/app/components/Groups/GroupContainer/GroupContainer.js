import React, { useContext, useEffect, useState } from "react";
import styles from "./GroupContainer.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBullseye,
  faHeart,
  faLock,
  faPeopleGroup,
  faStopwatch,
} from "@fortawesome/free-solid-svg-icons";
import parse from "html-react-parser";
import config from "@/app/utils/config";
import GroupMemCounter from "../GroupMemCounter/GroupMemCounter";
import GroupLikesCounter from "../GroupLikesCounter/GroupLikesCounter";
import LikeBtn from "@/app/components/Buttons/LikeBtn/LikeBtn";
import GroupUrlBtn from "@/app/components/Buttons/GroupUrlBtn/GroupUrlBtn";
import GroupJoinBtn from "../../Buttons/GroupJoinBtn/GroupJoinBtn";
import { secondConverter } from "@/app/utils/Tool";
import { UserInfoContext } from "@/app/utils/Contexts";

function GroupContainer({ groupInfo, isSearched = true, rankings }) {
  const { userInfo } = useContext(UserInfoContext);

  const [members, setMembers] = useState([]);
  const [likes, setLikes] = useState([]);
  const [totalTime, setTotalTime] = useState("0 h");

  useEffect(() => {
    if (!groupInfo) return;
    setMembers(groupInfo.members);
    setLikes(groupInfo.likes);
  }, [groupInfo]);

  useEffect(() => {
    if (!rankings || !members.length) return;
    const groupMembers = rankings.filter((user) =>
      members.includes(user.user_id)
    );
    const totalTime = groupMembers.reduce(
      (partialTime, a) => partialTime + a.study_time,
      0
    );
    const { value, type } = secondConverter(totalTime / members.length);
    setTotalTime(`${value} ${type}`);
  }, [members, rankings]);

  return (
    <div
      className={`${styles.GroupContainer} ${!isSearched ? styles.hidden : ""}`}
    >
      <div
        className={styles.layer}
        id={styles.name}
        style={{
          background: `linear-gradient(to left, ${groupInfo?.color}, 70%, ${groupInfo?.color}00)`,
        }}
      >
        {!groupInfo.visibility ? (
          <i className={styles.lock}>
            <FontAwesomeIcon icon={faLock} />
          </i>
        ) : null}
        <p className={`overflowDot`}>{groupInfo?.name}</p>
      </div>
      <div className={`hiddenScroll ${styles.layer}`} id={styles.description}>
        {parse(groupInfo.description)}
      </div>
      <div className={styles.layer} id={styles.info}>
        <div>
          <i>
            <FontAwesomeIcon icon={faPeopleGroup} />
          </i>
          <GroupMemCounter
            initialMembers={members}
            groupId={groupInfo.group_id}
          />
        </div>
        <div>
          <i>
            <FontAwesomeIcon icon={faBullseye} />
          </i>
          <p>{groupInfo.goal_hr}hr</p>
        </div>
        <div>
          <i>
            <FontAwesomeIcon icon={faStopwatch} />
          </i>
          <p>{totalTime}</p>
        </div>
        <div>
          <i>
            <FontAwesomeIcon icon={faHeart} />
          </i>
          <GroupLikesCounter
            initialMembers={likes}
            groupId={groupInfo.group_id}
          />
        </div>
      </div>
      <div className={`hiddenScroll ${styles.layer}`} id={styles.tags}>
        {groupInfo.tags.map((tag, i) => {
          return (
            <div
              className={styles.tag}
              key={i}
              style={{ backgroundColor: groupInfo.color }}
            >
              #{tag}
            </div>
          );
        })}
      </div>
      <div className={styles.layer} id={styles.buttons}>
        <GroupUrlBtn
          text={`${config.server}/dashboard/groups?groupId=${groupInfo?.group_id}`}
        />
        <GroupJoinBtn groupInfo={groupInfo} />
        <LikeBtn
          liked={likes.includes(userInfo?.user_id)}
          id={groupInfo.group_id}
        />
      </div>
    </div>
  );
}

export default GroupContainer;
