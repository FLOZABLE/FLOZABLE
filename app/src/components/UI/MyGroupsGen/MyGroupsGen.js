import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBullseye,
  faHeart,
  faPeopleGroup,
  faStopwatch,
  faLock,
  faLink,
} from "@fortawesome/free-solid-svg-icons";
import LikeBtn from "../LikeBtn/LikeBtn";
import styles from "./MyGroupsGen.module.css";

const serverOrigin = process.env.REACT_APP_ORIGIN;

function MyGroupsGen({
  setJoinTarget,
  setJoinGroupResponse,
  joinGroupResponse,
  setOpenGroupPwModal,
  groups,
}) {
  const [copied, setCopied] = useState(null);

  const joinGroup = (group) => {
    setJoinTarget(group);
    if (group.visibility) {
      fetch(`${serverOrigin}/groups/join/${group.group_id}`, {
        method: "post",
      })
        .then((response) => response.json())
        .then((data) => {
          setJoinGroupResponse(data);
        })
        .catch((error) => console.error(error));
    } else {
      setOpenGroupPwModal(true);
    }
  };

  const handleCopyClick = (id) => {
    navigator.clipboard.writeText(`https://flozable.com/groups/join/${id}`);
    setCopied(id);
    setTimeout(() => {
      setCopied(null);
    }, 2000);
  };

  const otherGroupsEl = groups.map((group, i) => {
    return (
      <div className={styles.myGroupContainer} key={i}>
        <div className={styles.group}>
          <div
            className={styles.groupColor}
            style={{ backgroundColor: group.color }}
          ></div>
          <div className={styles.name}>
            {!group.visibility ? (
              <i>
                <FontAwesomeIcon icon={faLock} />
              </i>
            ) : (
              ""
            )}
            {group.name}
          </div>
          <div className={styles.explanation}>
            <ul className={styles.info}>
              <li>
                <p>dd</p>
                <FontAwesomeIcon icon={faPeopleGroup} />
              </li>
              <li>
                <p>9hr</p>
                <FontAwesomeIcon icon={faBullseye} />
              </li>
              <li>
                <p>dd</p>
                <FontAwesomeIcon icon={faStopwatch} />
              </li>
              <li>
                <p>dd</p>
                <FontAwesomeIcon icon={faHeart} />
              </li>
            </ul>
            {group.explanation}
          </div>
          <div className={styles.bottom}>
            {/* <ul className={styles.tags}>
              {tagsEl}
            </ul> */}
            <div className={styles.buttons}>
              <LikeBtn />
              <button
                onClick={() => {
                  joinGroup(group, joinGroupResponse);
                }}
              >
                View Group
              </button>
              <button
                onClick={() => {
                  handleCopyClick(group.group_id);
                }}
              >
                <FontAwesomeIcon icon={faLink} />
              </button>
            </div>
          </div>
        </div>
        <div
          className={`${styles.copyModal} ${
            copied == group.group_id ? styles.copied : ""
          }`}
        >
          Copied!
        </div>
      </div>
    );
  });
  return otherGroupsEl;
}

export default MyGroupsGen;