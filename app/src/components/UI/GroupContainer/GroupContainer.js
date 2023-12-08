import { useEffect, useState } from "react";
import styles from "./GroupContainer.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBullseye, faHeart, faLock, faPeopleGroup, faStopwatch } from "@fortawesome/free-solid-svg-icons";
import LikeBtn from "../LikeBtn/LikeBtn";
import GroupUrlBtn from "../GroupUrlBtn/GroupUrlBtn";
import GroupMemCounter from "../GroupMemCounter/GroupMemCounter";
import GroupLikesCounter from "../GroupLikesCounter/GroupLikesCounter";

function GroupContainer({ isSearched, groupInfo, joinGroup, userInfo }) {
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
              <FontAwesomeIcon icon={faPeopleGroup} />
              <GroupMemCounter initialMembers={members} groupId={group_id} />
            </li>
            <li>
              <FontAwesomeIcon icon={faBullseye} />
              <p>{goal_hr}hr</p>
            </li>
            <li>
              <FontAwesomeIcon icon={faStopwatch} />
              <p>0</p>
            </li>
            <li>
              <FontAwesomeIcon icon={faHeart} />
              <GroupLikesCounter initialMembers={likes} groupId={group_id} />
            </li>
          </ul>
          {explanation}
        </div>
        <div className={styles.bottom}>
          <ul className={styles.tags}>
            {tags.map((tag, i) => {
              return (
                <li className={styles.tag} key={i}>
                  {tag}
                </li>
              );
            })}
          </ul>
          <div className={styles.buttons}>
            <div className={styles.likeBtnWrapper}>
              <LikeBtn liked={liked} id={group_id} />
            </div>
            <button
              onClick={() => {
                joinGroup(groupInfo);
              }}
            >
              Join
            </button>
            <GroupUrlBtn text={`https://flozable.com/groups/join/${group_id}`} />
          </div>
        </div>
      </div>
    );
  }, [groupInfo, isSearched, userInfo]);

  return groupEl;
};

export default GroupContainer;