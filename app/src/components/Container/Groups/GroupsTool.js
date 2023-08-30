import { Link } from "react-router-dom";
import { useState } from "react";
import styles from "./Group.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBullseye, faHeart, faPeopleGroup, faStopwatch, faLock, faLink } from "@fortawesome/free-solid-svg-icons";
import LikeBtn from "../../UI/LikeBtn/LikeBtn";

const serverOrigin = process.env.REACT_APP_ORIGIN;

function getLikedGroups(userInfo, groups) {
  const userId = userInfo.user_id;
  const likedGroups = [];
  groups.map(group => {
    const likes = group.likes.split(',');
    if (likes.includes(userId)) {
      likedGroups.push(group.group_id);
    };
  });

  return likedGroups;
};

function getMyGroups(userInfo, groups) {
  const userId = userInfo.user_id;
  const myGroups = [];
  const otherGroups = [];
  groups.map(group => {
    const members = group.members.split(',');
    console.log(members.includes(userId))
    if (members.includes(userId)) {
      myGroups.push(group);
    } else {
      otherGroups.push(group);
    };
  });

  return { myGroups: myGroups, otherGroups: otherGroups };
};

function joinGroup(groupId, setNotificationResponse) {
  fetch(`${serverOrigin}/api/groups/join/${groupId}`, { method: 'post' })
    .then((response) => response.json())
    .then((data) => {
      setNotificationResponse(data);
    })
    .catch((error) => console.error(error));
};

function handleCopyClick(content, setCopied) {
  navigator.clipboard.writeText(content);
  setCopied(true);
  setTimeout(() => {
    setCopied(false);
  }, 2000);
};

function otherGroupsGen(otherGroups, setNotificationResponse, setCopied, copied) {
  const otherGroupsEl = otherGroups.map((group, i) => {
    const tags = JSON.parse(group.tags);
    console.log(tags)
    const tagsEl = tags.map((tag, i) => {
      return (
        <li className={styles.tag} key={i}>{tag}</li>
      )
    });


    return (
      <div className={styles.group} key={i}>
        <div className={styles.groupColor} style={{ backgroundColor: group.color }}></div>
        <div className={styles.name}>
          {!group.visibility ? <i>
            <FontAwesomeIcon icon={faLock} />
          </i> : ''}
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
          <ul className={styles.tags}>
            {tagsEl}
          </ul>
          <div className={styles.buttons}>
            <LikeBtn />
            <button onClick={() => { joinGroup(group.group_id, setNotificationResponse) }}>
              Join
            </button>
            <button onClick={() => {handleCopyClick(`https://flozable.com/groups/join/${group.group_id}`, setCopied)}}>
              <FontAwesomeIcon icon={faLink} />
              <div className={`${styles.copyModal} ${copied ? styles.copied : ''}`} >
                Copied!
              </div>
            </button>
          </div>
        </div>
      </div>
    );
  });
  return otherGroupsEl;
}

export { getLikedGroups, getMyGroups, otherGroupsGen };