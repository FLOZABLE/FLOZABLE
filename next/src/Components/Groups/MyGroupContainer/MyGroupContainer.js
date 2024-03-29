import styles from "./MyGroupContainer.module.css";
import React, { useContext, useEffect, useState } from "react";
import config from "@/utils/config";
import Link from "next/link";
import { ModalsContext } from "@/utils/Contexts";
import GroupUrlBtn from "@/Components/Buttons/GroupUrlBtn/GroupUrlBtn";
import {
  IconMessage,
  IconTimerOutline,
  StudyPerson,
  IconPen,
} from "@/utils/Svg";
import MembersContainer from "../MembersContainer/MembersContainer";


function MyGroupContainer({
  group,
  mode,
  setIsEditGroupModal,
  isMine
}) {
  const { setIsChatModal } = useContext(ModalsContext);

  const [studyingMembers, setStudyingMembers] = useState([]);
  const [members, setMembers] = useState([]);
  const [groupTotal, setGroupTotal] = useState(0);

  useEffect(() => {
    if (!group) return;

    const { group_id } = group;

    fetch(`${config.server}/groups/members?groupId=${group_id}`, {
      method: "get",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          setMembers(data.membersData);
        };
      })
      .catch((error) => console.error(error));
  }, [group]);

  return (
    <div
      className={`${styles.MyGroupContainer} ${mode === "study" ? styles.study : ""}`}
    >
      <div className={styles.header}>
        <div>
          <div className={`${styles.name} overflowDot`}>{group?.name}</div>
          <div className={styles.info}>
            <div>
              <i>
                <StudyPerson />
              </i>
              <p>
                {studyingMembers.length}/{members.length}
              </p>
            </div>
            <div>
              <i>
                <IconTimerOutline />
              </i>
              <p>{Math.round((groupTotal * 100) / 3600) / 100}hr</p>
            </div>
            <div
              onClick={() => {
                setIsChatModal((prev) => (!prev ? group : ""));
              }}
            >
              <i>
                <IconMessage />
              </i>
            </div>
          </div>
          {isMine ? (
            <div
              className={styles.editIcon}
              onClick={() => {
                setIsEditGroupModal((prev) => {
                  return prev ? false : group;
                });
              }}
            >
              <i>
                <IconPen />
              </i>
            </div>
          ) : (
            <div />
          )}
        </div>
        <div className={styles.buttons}>
          <div>
            <Link href={`/dashboard/study?group=${group.group_id}`}>
              <button>Go to Group</button>
            </Link>
          </div>
          <div className={styles.urlBtnWrapper}>
            <GroupUrlBtn
              text={`${config.server}/dashboard/groups?joinId=${group.group_id}`}
              copyText="Share"
              bgColor="var(--dark-gray)"
            />
          </div>
        </div>
      </div>
      <div className={`${styles.membersWrapper} customScroll`}>
        <MembersContainer
          members={members}
          setStudyingMembers={setStudyingMembers}
        />
      </div>
    </div>
  );
}

export default MyGroupContainer;