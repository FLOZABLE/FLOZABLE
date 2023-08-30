import { Link } from "react-router-dom";
import styles from "./Group.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBullseye, faHeart, faPeopleGroup, faStopwatch } from "@fortawesome/free-solid-svg-icons";
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

function joinGroup(groupId) {
  console.log(groupId, 'sds')
  fetch(`${serverOrigin}/api/groups/bring-groups`, { method: 'post' })
  .then((response) => response.json())
  .then((data) => {
    if (data.success) {
      console.log(data)
    }
  })
  .catch((error) => console.error(error));
}

function otherGroupsGen(otherGroups) {
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
        <div className={styles.groupColor} style={{backgroundColor: group.color}}></div>
        <div className={styles.name}>
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
            <button onClick={() => {joinGroup(group.group_id)}}>
              Join
            </button>
          </div>
        </div>
      </div>
    );
  });
  return otherGroupsEl;
}

export { getLikedGroups, getMyGroups, otherGroupsGen };