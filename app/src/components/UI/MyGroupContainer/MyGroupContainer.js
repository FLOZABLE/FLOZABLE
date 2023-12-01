import { SwiperSlide } from "swiper/react";
import styles from "./MyGroupContainer.module.css";
import { useCallback, useEffect, useState } from "react";
import { StudyPerson } from "../../../utils/svgs";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBullhorn, faComments, faGear, faRankingStar } from "@fortawesome/free-solid-svg-icons";
import { Link } from "react-router-dom";
import MemberEl from "../MemberEl/MemberEl";
import MembersContainer from "../MembersContainer/MembersContainer";

const serverOrigin = process.env.REACT_APP_ORIGIN;

function MyGroupContainer({ group, isFocus, localStream, socket, userInfo }) {
  const [name, setName] = useState("");
  const [studyingMembers, setStudyingMembers] = useState([]);
  const [members, setMembers] = useState([]);

  useEffect(() => {
    if (!group) return;
    //group_id, average_hr, color, date, explanation, font, goal_hr, leader, max_member, name, visibility, tags, members, likes
    const { name } = group;
    setName(name);
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
            socket={socket}
            isFocus={isFocus}
            userInfo={userInfo}
            groupInfo={group}
            setStudyingMembers={setStudyingMembers}
            members={members}
            setMembers={setMembers}
            localStream={localStream}
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