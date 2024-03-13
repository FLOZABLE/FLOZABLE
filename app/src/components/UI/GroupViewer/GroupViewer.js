import React, { useEffect, useState } from "react";
import styles from "./GroupViewer.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBullseye, faHeart, faLock, faPeopleGroup, faStopwatch } from "@fortawesome/free-solid-svg-icons";
import LikeBtn from "../LikeBtn/LikeBtn";
import GroupUrlBtn from "../GroupUrlBtn/GroupUrlBtn";
import GroupMemCounter from "../GroupMemCounter/GroupMemCounter";
import GroupLikesCounter from "../GroupLikesCounter/GroupLikesCounter";
import GroupTimeCounter from "../GroupTimeCounter/GroupTimeCounter";
import parse from "html-react-parser";
import { Link } from "react-router-dom";

const serverOrigin = process.env.REACT_APP_ORIGIN;

function GroupViewer({ groupInfo, userInfo }) {
  return (
    <div
      className={styles.GroupViewer}
    >
      <div className={styles.contents}>
        <div className={`${styles.name} overflowDot`} style={{ background: `linear-gradient(to left, ${groupInfo?.color}, 70%, ${groupInfo?.color}00)` }} >
          <div className={`overflowDot`}>
            {groupInfo?.name}
          </div>
        </div>
        <div className={`${styles.description} hiddenScroll`}>
          {groupInfo ? parse(groupInfo.explanation) : null}
        </div>
        <div className={styles.info}>
          <div>
            <i>
              <FontAwesomeIcon icon={faPeopleGroup} />
            </i>
            <GroupMemCounter initialMembers={groupInfo?.members.split(",")} groupId={groupInfo?.group_id} />
          </div>
          <div>
            <i>
              <FontAwesomeIcon icon={faBullseye} />
            </i>
            <p>{groupInfo?.goal_hr}hr</p>
          </div>
          <div>
            <i>
              <FontAwesomeIcon icon={faStopwatch} />
            </i>
            <GroupTimeCounter members={groupInfo?.members.split(",").filter(Boolean)} />
          </div>
          <div>
            <i>
              <FontAwesomeIcon icon={faHeart} />
            </i>
            <GroupLikesCounter initialMembers={groupInfo?.likes.split(",").filter(Boolean)} groupId={groupInfo?.group_id} />
          </div>
        </div>
        <div className={`${styles.tags} hiddenScroll`}>
          {groupInfo ? JSON.parse(groupInfo.tags).map((tag, i) => {
            return (
              <div key={i} style={{ backgroundColor: groupInfo.color }}>
                #{tag}
              </div>
            )
          }) : null}
        </div>
      </div>
      <div className={styles.buttons}>
        <GroupUrlBtn text={`${serverOrigin}/dashboard/groups?joinId=${groupInfo?.group_id}`} />
        {
          groupInfo?.members.split(",").includes(userInfo?.user_id) ?
            <Link 
              to={`/dashboard/study?group=${groupInfo?.group_id}`}
            className={styles.joinBtn}
            >
              Join the session
            </Link>
            :
            <Link 
              to={`/dashboard/groups?joinId=${groupInfo?.group_id}`}
            className={styles.joinBtn}
            >
              Join
            </Link>
        }
        <div className={styles.likeBtnWrapper}>
          <LikeBtn liked={groupInfo?.likes.split(",").includes(userInfo?.user_id)} id={groupInfo?.group_id} />
        </div>
      </div>
    </div>
  );
};

export default GroupViewer;