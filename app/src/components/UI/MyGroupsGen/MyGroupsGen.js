import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBullseye, faHeart, faPeopleGroup, faStopwatch, faLock, faLink } from "@fortawesome/free-solid-svg-icons";
import LikeBtn from "../LikeBtn/LikeBtn";
import styles from "./MyGroupsGen.module.css";

const serverOrigin = process.env.REACT_APP_ORIGIN;

function MyGroupsGen(props) {
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

  const viewGroup = (group) => {
    
  }

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
  /* if (props.groups) {
    return (
      <div></div>
    );
  } */

  const allMembers = props.allMembers;
  const otherGroupsEl = props.groups.map((group, i) => {
    console.log(i);
    const tags = JSON.parse(group.tags);
    const tagsEl = tags.map((tag, i) => {
      return (
        <li className={styles.tag} key={i}>{tag}</li>
      )
    });

    const members = group.members.split(',');

    const membersInfo = members.map((member) => {
      const memberInfo = allMembers.find((memberInfo) => {return member == memberInfo.user_id});
      return memberInfo;
    });
    const membersEl = membersInfo.map((memberInfo, i) => {
      return (
        <div className={styles.member} key={i} >
          <div className={styles.name}>{memberInfo.name}</div>
        </div>
      )
    });

    return (
      <div className={styles.myGroupContainer} key={i}>
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
              <button onClick={() => { joinGroup(group, props.joinGroupResponse) }}>
                View Group
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

export default MyGroupsGen;