import React, { useContext } from "react";
import styles from "./GroupContainer.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBullseye, faHeart, faPeopleGroup, faStopwatch } from "@fortawesome/free-solid-svg-icons";
import parse from "html-react-parser";
import { UserInfoContext } from "@/utils/Contexts";
import config from "@/utils/config";
import GroupMemCounter from "../GroupMemCounter/GroupMemCounter";
import GroupTimeCounter from "../GroupTimeCounter/GroupTimeCounter";
import GroupLikesCounter from "../GroupLikesCounter/GroupLikesCounter";
import Link from "next/link";
import LikeBtn from "@/Components/Buttons/LikeBtn/LikeBtn";
import GroupUrlBtn from "@/Components/Buttons/GroupUrlBtn/GroupUrlBtn";

function GroupContainer({ groupInfo }) {
  const {userInfo} = useContext(UserInfoContext);
  console.log('gddddd', groupInfo)

  return (
    <div
      className={styles.GroupContainer}
    >
      <div className={styles.contents}>
        <div className={`${styles.name} overflowDot`} style={{ background: `linear-gradient(to left, ${groupInfo?.color}, 70%, ${groupInfo?.color}00)` }} >
          <div className={`overflowDot`}>
            {groupInfo?.name}
          </div>
        </div>
        <div className={`${styles.description} hiddenScroll`}>
          {groupInfo ? parse(groupInfo.explanation) : null}
        </div>
        <div className={styles.info}>
          <div>
            <i>
              <FontAwesomeIcon icon={faPeopleGroup} />
            </i>
            <GroupMemCounter initialMembers={groupInfo?.members.split(",")} groupId={groupInfo?.group_id} />
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
            <GroupTimeCounter members={groupInfo ? groupInfo.members.split(",").filter(Boolean) : []} />
          </div>
          <div>
            <i>
              <FontAwesomeIcon icon={faHeart} />
            </i>
            <GroupLikesCounter initialMembers={groupInfo ? groupInfo.likes.split(",").filter(Boolean) : []} groupId={groupInfo?.group_id} />
          </div>
        </div>
        <div className={`${styles.tags} hiddenScroll`}>
          {groupInfo ? JSON.parse(groupInfo.tags).map((tag, i) => {
            return (
              <div key={i} style={{ backgroundColor: groupInfo.color }}>
                #{tag}
              </div>
            )
          }) : null}
        </div>
      </div>
      <div className={styles.buttons}>
        <GroupUrlBtn text={`${config.server}/dashboard/groups?joinId=${groupInfo?.group_id}`} />
        {
          groupInfo?.members.split(",").includes(userInfo?.user_id) ?
            <Link 
              href={`/dashboard/study?group=${groupInfo?.group_id}`}
            className={styles.joinBtn}
            >
              Join the session
            </Link>
            :
            <Link
              href={`/dashboard/groups?joinId=${groupInfo?.group_id}`}
            className={styles.joinBtn}
            >
              Join
            </Link>
        }
        <div className={styles.likeBtnWrapper}>
          <LikeBtn liked={groupInfo?.likes.split(",").includes(userInfo?.user_id)} id={groupInfo?.group_id} />
        </div>
      </div>
    </div>
  );
};

export default GroupContainer;