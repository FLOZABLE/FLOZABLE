import { faLink, faLock } from "@fortawesome/free-solid-svg-icons";
import styles from "./FriendGroupViewer.module.css";
import { useEffect, useState } from "react";

function FriendGroupViewer({groupInfo}) {
  const [groupEl, setGroupEl] = useState(null);

  useEffect(() => {
    if (!groupInfo) return null;

    const {color, group_id, likes, goal_hr, explanation, visibility, name} = groupInfo;
    const members = groupInfo.members === "" ? [] : members.split(",");

    setGroupEl(
      <div className={styles.group}>
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
              <p>{members.length}</p>
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
              <p>{likes.length}</p>
            </li>
          </ul>
          {explanation}
        </div>
        {/* <div className={styles.bottom}>
          <ul className={styles.tags}>{tagsEl}</ul>
          <div className={styles.buttons}>
            <LikeBtn liked={liked} id={group.group_id} />
            <button
              onClick={() => {
                joinGroup(group, joinGroupResponse);
              }}
            >
              Join
            </button>
            <button
              onClick={() => {
                handleCopyClick(group.group_id);
              }}
            >
              <FontAwesomeIcon icon={faLink} />
            </button>
          </div>
        </div> */}
      </div>
    );
  }, [groupInfo]);

  return (
    <div
      className={styles.FriendGroupViewer}
    >
      {groupEl}
    </div>
  );
};

export default FriendGroupViewer;