import styles from "./MyGroupContainer.module.css";
import { useEffect, useState } from "react";
import { StudyPerson } from "../../../utils/svgs";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBullhorn, faCommentDots, faComments, faGear, faPen, faRankingStar } from "@fortawesome/free-solid-svg-icons";
import { Link } from "react-router-dom";
import MembersContainer from "../MembersContainer/MembersContainer";
import { socket } from "../../../socket";
import { mediaSocket } from "../../../mediaSocket";
import GroupUrlBtn from "../GroupUrlBtn/GroupUrlBtn";

const serverOrigin = process.env.REACT_APP_ORIGIN;

function MyGroupContainer({ group, isFocus, userInfo, isMic, isCam, setIsChatModal, setIsGroupRankingModal, setIsEditGroupModal, mode, isHeadphone }) {
  const [name, setName] = useState("");
  const [studyingMembers, setStudyingMembers] = useState([]);
  const [members, setMembers] = useState([]);
  const [isLeader, setIsLeader] = useState(false);
  const [groupTotal, setGroupTotal] = useState(0);

  useEffect(() => {
    if (!group || !isFocus) return;
    //group_id, average_hr, color, date, explanation, font, goal_hr, leader, max_member, name, visibility, tags, members, likes
    const { name } = group;
    setName(name);
    socket.emit('changeGroup', group.group_id);
    mediaSocket.emit('changeGroup', group.group_id);
    setIsGroupRankingModal(false);
  }, [group, isFocus]);

  useEffect(() => {
    if (!userInfo || !group) return;
    const { leader } = group;
    if (leader === userInfo.user_id) {
      setIsLeader(true);
    };
  }, [userInfo, group]);

  useEffect(() => {
    if (group.length <= 0) return;
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    fetch(`${serverOrigin}/ranking/today?timezone=${timezone}`, {
      method: "get",
      headers: {
        'Content-Type': 'application/json'
      },
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          let groupTotalTime = 0;
          const groupMembers = group.members.split(",");

          data.rankings.map((ranking) => {
            if (groupMembers.includes(ranking.user.user_id)) {
              groupTotalTime += parseInt(ranking.total);
            }
          });

          setGroupTotal(groupTotalTime);
        }
      });

  }, [group]);

  return (
    <div className={`${styles.MyGroupContainer} ${mode === "study" ? styles.study : ''}`}>
      <div className={styles.name}>
        <Link to={`/dashboard/study?group=${group.group_id}`}>{name}</Link>
        {userInfo?.user_id === group?.leader ? <i onClick={() => {
          setIsEditGroupModal(group);
        }}> <FontAwesomeIcon icon={faPen} /></i> : null}
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
          <li onClick={() => {
            setIsChatModal(prev => !prev ? group : '');
          }}>
            <FontAwesomeIcon icon={faCommentDots} />
          </li>
          <li className={styles.showRankingModalListElement}>
            <FontAwesomeIcon icon={faRankingStar} onClick={() => { setIsGroupRankingModal(prev => !prev ? members : false) }} />
          </li>
          <li>
            <div className={styles.groupTotal}>
              {Math.round(groupTotal * 100 / 3600) / 100}hr
            </div>
          </li>
        </ul>
        {/* <div className={styles.right}>
              <FontAwesomeIcon icon={faGear} />
            </div> */}
      </div>
      <div className={`${styles.membersWrapper} customScroll`}>
        <MembersContainer
          isFocus={isFocus}
          userInfo={userInfo}
          groupInfo={group}
          setStudyingMembers={setStudyingMembers}
          members={members}
          setMembers={setMembers}
          isMic={isMic}
          isCam={isCam}
          isHeadphone={isHeadphone}
        />
      </div>
      <div className={styles.buttons}>
        <Link to={`/dashboard/study?group=${group.group_id}`}>
          <button>Go to Group</button>
        </Link>
        <GroupUrlBtn text = {`${serverOrigin}/dashboard/groups?joinId=${group.group_id}`} copyText="Share"/>
      </div>
    </div>
  )
};

export default MyGroupContainer;