import { useEffect, useState } from "react";
import styles from "./GroupContainer.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBullseye, faHeart, faLock, faPeopleGroup, faStopwatch } from "@fortawesome/free-solid-svg-icons";
import LikeBtn from "../LikeBtn/LikeBtn";
import GroupUrlBtn from "../GroupUrlBtn/GroupUrlBtn";
import GroupMemCounter from "../GroupMemCounter/GroupMemCounter";
import GroupLikesCounter from "../GroupLikesCounter/GroupLikesCounter";
import { Link } from "react-router-dom";

const serverOrigin = process.env.REACT_APP_ORIGIN;

function GroupContainer({ isSearched, groupInfo, joinGroup, userInfo, type = 0, myGroups, viewOnly = false }) {
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
      if (myGroups && type && (myGroups.find(group => group.group_id === group_id) || userInfo.groups.includes(group_id))) {
        joined = true;
      }
    }

    setGroupEl(
      <div
        className={`${styles.GroupContainer} ${isSearched ? "" : styles.hidden
          }`}
      >
        <div
          className={styles.groupColor}
          style={{ backgroundColor: color }}
        ></div>
        <div className={styles.name}>
          {!visibility ? (
            <i>
              <FontAwesomeIcon icon={faLock} />
            </i>
          ) : (
            ""
          )}
          {name}
        </div>
        <div className={styles.explanation}>
          <ul className={styles.info}>
            <li>
              <i>
                <FontAwesomeIcon icon={faPeopleGroup} />
              </i>
              <GroupMemCounter initialMembers={members} groupId={group_id} />
            </li>
            <li>
              <i>
                <FontAwesomeIcon icon={faBullseye} />
              </i>
              <p>{goal_hr}hr</p>
            </li>
            <li>
              <i>
                <FontAwesomeIcon icon={faStopwatch} />
              </i>
              <p>0</p>
            </li>
            <li>
              <i>
                <FontAwesomeIcon icon={faHeart} />
              </i>
              <GroupLikesCounter initialMembers={likes} groupId={group_id} />
            </li>
          </ul>
          <div className={`${styles.content} hiddenScroll`}>
            {explanation}
          </div>
        </div>
        <ul className={`${styles.tags} hiddenScroll`}>
          {tags.map((tag, i) => {
            return (
              <li className={styles.tag} key={i}>
                #{tag}
              </li>
            );
          })}
        </ul>
        <div className={styles.bottom}>
          <div className={styles.buttons}>
            <div className={styles.likeBtnWrapper}>
              <LikeBtn liked={liked} id={group_id} />
            </div>
            {/* <button
              onClick={() => {
                if (joined)
                joinGroup(groupInfo);
              }}
            >
              {joined ? <Link to={"/dashboard/study"}>
                Go study session
              </Link> : 'Join'}
            </button> */}
            {!joined && !viewOnly ? <button
              onClick={() => {
                joinGroup(groupInfo);
              }}
            >
              Join
            </button> : null}
            <GroupUrlBtn text={`${serverOrigin}/dashboard/groups?joinId=${group_id}`} />
          </div>
        </div>
      </div>
    );
  }, [groupInfo, isSearched, userInfo, type, myGroups]);

  return groupEl;
};

export default GroupContainer;