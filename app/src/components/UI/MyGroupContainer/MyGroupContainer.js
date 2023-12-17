import styles from "./MyGroupContainer.module.css";
import { useEffect, useState } from "react";
import { StudyPerson } from "../../../utils/svgs";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBullhorn, faComments, faGear, faRankingStar } from "@fortawesome/free-solid-svg-icons";
import { Link } from "react-router-dom";
import MembersContainer from "../MembersContainer/MembersContainer";
import { socket } from "../../../socket";
import { mediaSocket } from "../../../mediaSocket";

function MyGroupContainer({ group, isFocus, userInfo, isMic, isCam }) {
  const [name, setName] = useState("");
  const [studyingMembers, setStudyingMembers] = useState([]);
  const [members, setMembers] = useState([]);

  useEffect(() => {
    if (!group || !isFocus) return;
    //group_id, average_hr, color, date, explanation, font, goal_hr, leader, max_member, name, visibility, tags, members, likes
    const { name } = group;
    setName(name);
    socket.emit('changeGroup', group.group_id);
    mediaSocket.emit('changeGroup', group.group_id);
  }, [group, isFocus]);

  return (
    <div className={styles.MyGroupContainer}>
      <div className={styles.inner}>
        <div className={styles.name}>
          <Link to="/dashboard/study">{name}</Link>
        </div>
        <div className={styles.header}>
            <ul className={styles.status}>
              <li>
                <StudyPerson
                  opt1={"#fff"}
                  opt2={"#fff"}
                  width={"40px"}
                  height={"40px"}
                />
                <p>
                  {/* {stud}
                  /{membersInfo.length} */}
                  {studyingMembers.length}/
                  {members.length}
                </p>
              </li>
              <li>
                <FontAwesomeIcon icon={faBullhorn} />
              </li>
              <li>
                <FontAwesomeIcon icon={faRankingStar} />
              </li>
            </ul>
            <div className={styles.right}>
              <FontAwesomeIcon icon={faGear} />
            </div>
          </div>
        <div className={`${styles.information} customScroll`}>
          <div className={styles.membersWrapper}>
          <MembersContainer
            isFocus={isFocus}
            userInfo={userInfo}
            groupInfo={group}
            setStudyingMembers={setStudyingMembers}
            members={members}
            setMembers={setMembers}
            isMic={isMic}
            isCam={isCam}
          />
          </div>
        </div>
        <div className={styles.buttons}>
          <Link to="/dashboard/study">
            <button>Go to Group</button>
          </Link>
          <button>
            <FontAwesomeIcon icon={faComments} />
          </button>
        </div>
      </div>
    </div>
  )
};

export default MyGroupContainer;