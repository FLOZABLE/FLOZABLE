import styles from "./Group.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBullseye, faHeart, faPeopleGroup, faStopwatch } from "@fortawesome/free-solid-svg-icons";
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

function otherGroupsGen(otherGroups) {
  const otherGroupsEl = otherGroups.map((group, i) => {
    const tags = JSON.parse(group.tags);
    console.log(tags)
    const tagsEl = tags.map((tag, i) => {
      return (
        <li className={styles.tag} key={i}>{tag}</li>
      )
    })
    return (
      <div className={styles.group}  key={i}>
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
        <ul className={styles.tags}>
        {tagsEl}
        </ul>
      </div>
    );
  });
  return otherGroupsEl;
}

export { getLikedGroups, getMyGroups, otherGroupsGen };