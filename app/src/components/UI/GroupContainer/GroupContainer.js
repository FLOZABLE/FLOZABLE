import React, { useEffect, useState } from "react";
import styles from "./GroupContainer.module.css";
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

function GroupContainer({ isSearched, groupInfo, joinGroup, userInfo, myGroups, setResponse, viewOnly = false }) {
  const [groupEl, setGroupEl] = useState(null);

  useEffect(() => {
    if (!groupInfo) return;

    const { group_id, name, visibility, color, goal_hr, explanation } = groupInfo;
    const members = groupInfo.members === "" ? [] : groupInfo.members.split(",");
    const likes = groupInfo.likes === "" ? [] : groupInfo.likes.split(",");
    const tags = JSON.parse(groupInfo.tags)

    let liked = false;
    if (userInfo && likes.includes(userInfo.user_id)) {
      liked = true;
    };

    let joined = false;
    if (!viewOnly) {
      if (userInfo && myGroups && (myGroups.find(group => group.group_id === group_id) || userInfo.groups.includes(group_id))) {
        joined = true;
      }
    }

    setGroupEl(
      <div
        className={`${styles.GroupContainer} ${isSearched ? "" : styles.hidden
          }`}
      >
        <div className={styles.contents}>
          <div className={`${styles.name} overflowDot`} style={{ background: `linear-gradient(to left, ${color}, 70%, ${color}00)` }} >
            <div className={`overflowDot`}>
              {name}
            </div>
          </div>
          <div className={`${styles.description} hiddenScroll`}>
            {parse(explanation)}
          </div>
          <div className={styles.info}>
            <div>
              <i>
                <FontAwesomeIcon icon={faPeopleGroup} />
              </i>
              <GroupMemCounter initialMembers={members} groupId={group_id} />
            </div>
            <div>
              <i>
                <FontAwesomeIcon icon={faBullseye} />
              </i>
              <p>{goal_hr}hr</p>
            </div>
            <div>
              <i>
                <FontAwesomeIcon icon={faStopwatch} />
              </i>
              <GroupTimeCounter members={members} />
            </div>
            <div>
              <i>
                <FontAwesomeIcon icon={faHeart} />
              </i>
              <GroupLikesCounter initialMembers={likes} groupId={group_id} />
            </div>
          </div>
          <div className={`${styles.tags} hiddenScroll`}>
            {tags.map((tag, i) => {
              return (
                <div key={i} style={{ backgroundColor: color }}>
                  #{tag}
                </div>
              )
            })}
          </div>
        </div>
        <div className={styles.buttons}>
          <GroupUrlBtn text={`${serverOrigin}/dashboard/groups?joinId=${group_id}`} />
          {!joined && !viewOnly ? <button className={styles.joinBtn}
            onClick={() => {
              joinGroup(groupInfo);
            }}
          >
            Join
          </button> : null}
          <div className={styles.likeBtnWrapper}>
            <LikeBtn liked={groupInfo?.likes .includes(userInfo.user_id)} id={group_id} setResponse={setResponse}/>
          </div>
        </div>
      </div>
    );
  }, [groupInfo, isSearched, userInfo, myGroups]);

  return groupEl;
};

export default GroupContainer;