import styles from "./MyGroupContainer.module.css";
import React, { useEffect, useState } from "react";
import { IconMessage, IconTimerOutline, StudyPerson } from "../../../utils/svgs";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBullhorn, faCommentDots, faComments, faGear, faPen, faRankingStar } from "@fortawesome/free-solid-svg-icons";
import { Link } from "react-router-dom";
import MembersContainer from "../MembersContainer/MembersContainer";
import { socket } from "../../../socket";
import { mediaSocket } from "../../../mediaSocket";
import GroupUrlBtn from "../GroupUrlBtn/GroupUrlBtn";
import { DateTime } from "luxon";

const serverOrigin = process.env.REACT_APP_ORIGIN;

function MyGroupContainer({ group, isFocus, userInfo, isMic, isCam, setIsChatModal, setIsGroupRankingModal, setIsEditGroupModal, mode, isHeadphone }) {
  const [name, setName] = useState("");
  const [studyingMembers, setStudyingMembers] = useState([]);
  const [members, setMembers] = useState([]);
  const [groupTotal, setGroupTotal] = useState(0);

  useEffect(() => {
    if (!group || !isFocus) return;
    //group_id, average_hr, color, date, explanation, font, goal_hr, leader, max_member, name, visibility, tags, members, likes
    const { name } = group;
    setName(name);
    setTimeout(() => {
      socket.emit('changeGroup', group.group_id);
      mediaSocket.emit('changeGroup', group.group_id);
    }, 500)
    setIsGroupRankingModal(false);
  }, [group, isFocus]);


  /* useEffect(() => {
    if (group.length <= 0) return;
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    fetch(`${serverOrigin}/ranking/sort?mode=Daily&date=${DateTime.now().toISODate()}&timezone=${timezone}`, {
      method: 'get',
      headers: {
        'Content-Type': 'application/json'
      },
    })
      .then((response) => response.json())
      .then((response) => {
        if (response.success) {
          let groupTotalTime = 0;
          const groupMembers = group.members.split(",");

          response.data.map((ranking) => {
            if (groupMembers.includes(ranking.user_id)) {
              groupTotalTime += parseInt(ranking.t);
            }
          });

          setGroupTotal(groupTotalTime);
        }
      });

  }, [group]); */

  return (
    <div className={`${styles.MyGroupContainer} ${mode === "study" ? styles.study : ''}`}>
      <div className={styles.header}>
        <div>
          <div className={`${styles.name} overflowDot`}>
            {name}
          </div>
          <div className={styles.info}>
            <div>
              <i>
              <StudyPerson />
              </i>
              <p>
                {studyingMembers.length}/
                {members.length}
              </p>
            </div>
            <div>
              <i>
                <IconTimerOutline />
              </i>
              <p>
                {Math.round(groupTotal * 100 / 3600) / 100}hr
              </p>
            </div>
            <div onClick={() => {
              setIsChatModal(prev => !prev ? group : '');
            }}>
              <i>
                <IconMessage />
              </i>
            </div>
          </div>
        </div>
        <div className={styles.buttons}>
          <div>
            <Link to={`/dashboard/study?group=${group.group_id}`}>
              <button>
              Go to Group
              </button>
            </Link>
          </div>
          <div className={styles.urlBtnWrapper}>
          <GroupUrlBtn text={`${serverOrigin}/dashboard/groups?joinId=${group.group_id}`} copyText="Share" bgColor="var(--dark-gray)"/>
          </div>
        </div>
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
    </div>
  )
};

export default MyGroupContainer;