import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBullseye, faHeart, faPeopleGroup, faStopwatch, faLock, faLink } from "@fortawesome/free-solid-svg-icons";
import LikeBtn from "../LikeBtn/LikeBtn";
import styles from "./GroupsGen.module.css";

const serverOrigin = process.env.REACT_APP_ORIGIN;

function GroupsGen(props) {
  const [copied, setCopied] = useState(null);

  const joinGroup = (group) => {
    props.setJoinTarget(group);
    if (group.visibility) {
      fetch(`${serverOrigin}/api/groups/join/${group.group_id}`, { method: 'post' })
      .then((response) => response.json())
      .then((data) => {
        props.setJoinGroupResponse(data);
      })
      .catch((error) => console.error(error));
    } else {
      props.setOpenGroupPwModal(true);
    }
  };

  const handleCopyClick = (id) => {
    navigator.clipboard.writeText(`https://flozable.com/groups/join/${id}`);
    setCopied(id);
    setTimeout(() => {
      setCopied(null);
    }, 2000);
  };

  useEffect(() => {
    const query = props.searchQuery;

  }, [props.searchQuery]);

  //`https://flozable.com/groups/join/${group.group_id}`, i
  //otherGroups, setNotificationResponse, setCopied, copied
  const otherGroupsEl = props.groups.map((group, i) => {
    const tags = JSON.parse(group.tags);
    const tagsEl = tags.map((tag, i) => {
      return (
        <li className={styles.tag} key={i}>{tag}</li>
      )
    });


    return (
      <div className={styles.groupContainer} key={i}>
        <div className={styles.group}>
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
              <FontAwesomeIcon icon={faPeopleGroup} />
                <p>dd</p>
              </li>
              <li>
              <FontAwesomeIcon icon={faBullseye} />
                <p>9hr</p>
              </li>
              <li>
              <FontAwesomeIcon icon={faStopwatch} />
                <p>dd</p>
              </li>
              <li>
              <FontAwesomeIcon icon={faHeart} />
                <p>dd</p>
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
              <button onClick={() => { joinGroup(group, props.joinGroupResponse) }}>
                Join
              </button>
              <button onClick={() => { handleCopyClick(group.group_id) }}>
                <FontAwesomeIcon icon={faLink} />
              </button>
            </div>
          </div>
        </div>
        <div className={`${styles.copyModal} ${copied == group.group_id ? styles.copied : ''}`} >
          Copied!
        </div>
      </div>
    );
  });
  return otherGroupsEl;
};

export default GroupsGen;