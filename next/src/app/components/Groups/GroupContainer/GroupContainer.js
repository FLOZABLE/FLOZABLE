import React, { useContext, useEffect, useState } from "react";
import styles from "./GroupContainer.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBullseye,
  faHeart,
  faLock,
  faPeopleGroup,
  faStopwatch,
} from "@fortawesome/free-solid-svg-icons";
import parse from "html-react-parser";
import { ModalsContext, UserInfoContext } from "@/app/utils/Contexts";
import config from "@/app/utils/config";
import GroupMemCounter from "../GroupMemCounter/GroupMemCounter";
import GroupLikesCounter from "../GroupLikesCounter/GroupLikesCounter";
import Link from "next/link";
import LikeBtn from "@/app/components/Buttons/LikeBtn/LikeBtn";
import GroupUrlBtn from "@/app/components/Buttons/GroupUrlBtn/GroupUrlBtn";

function GroupContainer({ groupInfo, rankings = [], isSearched = true }) {
  const { userInfo } = useContext(UserInfoContext);
  const { setJoinGroupModal } = useContext(ModalsContext);

  const [members, setMembers] = useState([]);
  const [likes, setLikes] = useState([]);

  let groupTotalTime = 0;

  useEffect(() => {
    if (!groupInfo) return;
    setMembers(groupInfo.members);
    setLikes(groupInfo.likes);
  }, [groupInfo]);

  return (
    <div
      className={`${styles.GroupContainer} ${!isSearched ? styles.hidden : ""}`}
    >
      {/* <div className={styles.groupImage}></div>
      <div className={styles.info}>
        <div className={styles.name}></div>
        <div className={`${styles.tags} hiddenScroll`}>
          {groupInfo?.tags.map((tag, i) => {
            return (
              <div key={i} style={{ backgroundColor: groupInfo.color }}>
                #{tag}
              </div>
            );
          })}
        </div>
        <div className={styles.description}>{parse(groupInfo.description)}</div>
      </div> */}
      <div className={styles.contents}>
        <div
          className={`${styles.name} overflowDot`}
          style={{
            background: `linear-gradient(to left, ${groupInfo?.color}, 70%, ${groupInfo?.color}00)`,
          }}
        >
          {!groupInfo?.visibility ? (
            <i className={styles.lock}>
              <FontAwesomeIcon icon={faLock} />
            </i>
          ) : null}
          <div className={`overflowDot`}>{groupInfo?.name}</div>
        </div>
        <div className={`${styles.description} hiddenScroll`}>
          {groupInfo ? parse(groupInfo.description) : null}
        </div>
        <div className={styles.info}>
          <div>
            <i>
              <FontAwesomeIcon icon={faPeopleGroup} />
            </i>
            <GroupMemCounter
              initialMembers={members}
              groupId={groupInfo?.group_id}
            />
          </div>
          <div>
            <i>
              <FontAwesomeIcon icon={faBullseye} />
            </i>
            <p>{groupInfo?.goal_hr}hr</p>
          </div>
          <div>
            <i>
              <FontAwesomeIcon icon={faStopwatch} />
            </i>
            {rankings.map((ranking) => {
              if (members.includes(ranking.user_id)) {
                groupTotalTime += parseInt(ranking.t);
              }
            })}
          </div>
          <div>
            <i>
              <FontAwesomeIcon icon={faHeart} />
            </i>
            <GroupLikesCounter
              initialMembers={likes}
              groupId={groupInfo?.group_id}
            />
          </div>
        </div>
        <div className={`${styles.tags} hiddenScroll`}>
          {groupInfo?.tags.map((tag, i) => {
            return (
              <div key={i} style={{ backgroundColor: groupInfo.color }}>
                #{tag}
              </div>
            );
          })}
        </div>
      </div>
      <div className={styles.buttons}>
        <GroupUrlBtn
          text={`${config.server}/dashboard/groups?groupId=${groupInfo?.group_id}`}
        />
        {members.includes(userInfo?.user_id) ? (
          <Link
            href={`/dashboard/study?group=${groupInfo?.group_id}`}
            className={styles.joinBtn}
          >
            Join the session
          </Link>
        ) : (
          <div
            onClick={() => {
              setJoinGroupModal({
                open: true,
                group: groupInfo,
              });
            }}
            className={styles.joinBtn}
          >
            Join
          </div>
        )}
        <div className={styles.likeBtnWrapper}>
          <LikeBtn
            liked={likes.includes(userInfo?.user_id)}
            id={groupInfo?.group_id}
          />
        </div>
      </div>
    </div>
  );
}

export default GroupContainer;
