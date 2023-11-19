import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBullseye,
  faHeart,
  faPeopleGroup,
  faStopwatch,
  faLock,
  faLink,
} from "@fortawesome/free-solid-svg-icons";
import LikeBtn from "../LikeBtn/LikeBtn";
import styles from "./GroupsGen.module.css";

const serverOrigin = process.env.REACT_APP_ORIGIN;

function GroupsGen({
  searchQuery,
  setMyGroups,
  setOtherGroups,
  setJoinGroupResponse,
  joinGroupResponse,
  setIsGroupPwModal,
  setJoinTarget,
  groups,
  userInfo,
  queryTags,
}) {
  const [copied, setCopied] = useState(null);
  const [otherGroupsEl, setOtherGroupsEl] = useState(null);
  const [maxGroups, setMaxGroups] = useState(-1);

  const joinGroup = (targetGroup) => {
    setJoinTarget(targetGroup);
    if (targetGroup.visibility) {
      fetch(`${serverOrigin}/api/groups/join/${targetGroup.group_id}`, {
        method: "post",
      })
        .then((response) => response.json())
        .then((data) => {
          setJoinGroupResponse(data);
          setOtherGroups(
            groups.filter((group) => {
              return group.group_id != targetGroup.group_id;
            }),
          );
          setMyGroups((myGroups) => [...myGroups, targetGroup]);
        })
        .catch((error) => console.error(error));
    } else {
      setIsGroupPwModal(true);
    }
  };

  const handleCopyClick = (id) => {
    navigator.clipboard.writeText(`https://flozable.com/groups/join/${id}`);
    setCopied(id);
    setTimeout(() => {
      setCopied(null);
    }, 2000);
  };

  useEffect(() => {
    if (!userInfo) return;
    setOtherGroupsEl(
      Array.from(groups).map((group, i) => {
        if (maxGroups !== -1 && i > maxGroups) {
          return;
        }
        const tags = JSON.parse(group.tags);
        const likes = group.likes.split(",");
        const liked = likes.includes(userInfo.user_id);
        const tagsEl = tags.map((tag, i) => {
          return (
            <li className={styles.tag} key={i}>
              {tag}
            </li>
          );
        });

        /* ${(group.name.toLowerCase().includes(searchQuery) || group.tags.includes(searchQuery) || tags.some(element => queryTags.includes(element))) || (searchQuery === '' && !queryTags.length) ? '' : styles.hidden} */
        let isSearched = false;
        if (
          !queryTags.length &&
          (searchQuery === "" || typeof searchQuery === "undefined")
        ) {
          isSearched = true;
        } else if (queryTags.length && searchQuery === "") {
          if (
            tags.some((element) => queryTags.includes(element.toLowerCase()))
          ) {
            isSearched = true;
          }
        } else if (!queryTags.length && searchQuery !== "") {
          if (
            group.name.toLowerCase().includes(searchQuery) ||
            group.tags.includes(searchQuery)
          ) {
            isSearched = true;
          }
        } else {
          if (
            tags.some((element) => queryTags.includes(element.toLowerCase())) &&
            (group.name.toLowerCase().includes(searchQuery) ||
              group.tags.includes(searchQuery))
          ) {
            isSearched = true;
          }
        }

        return (
          <div
            className={`${styles.groupContainer} ${
              isSearched ? "" : styles.hidden
            }`}
            key={i}
          >
            <div className={styles.group}>
              <div
                className={styles.groupColor}
                style={{ backgroundColor: group.color }}
              ></div>
              <div className={styles.name}>
                {!group.visibility ? (
                  <i>
                    <FontAwesomeIcon icon={faLock} />
                  </i>
                ) : (
                  ""
                )}
                {group.name}
              </div>
              <div className={styles.explanation}>
                <ul className={styles.info}>
                  <li>
                    <FontAwesomeIcon icon={faPeopleGroup} />
                    <p>{group.members.length}</p>
                  </li>
                  <li>
                    <FontAwesomeIcon icon={faBullseye} />
                    <p>{group.goal_hr}hr</p>
                  </li>
                  <li>
                    <FontAwesomeIcon icon={faStopwatch} />
                    <p>dd</p>
                  </li>
                  <li>
                    <FontAwesomeIcon icon={faHeart} />
                    <p>{likes.length}</p>
                  </li>
                </ul>
                {group.explanation}
              </div>
              <div className={styles.bottom}>
                <ul className={styles.tags}>{tagsEl}</ul>
                <div className={styles.buttons}>
                  <LikeBtn liked={liked} id={group.group_id} />
                  <button
                    onClick={() => {
                      joinGroup(group, joinGroupResponse);
                    }}
                  >
                    Join
                  </button>
                  <button
                    onClick={() => {
                      handleCopyClick(group.group_id);
                    }}
                  >
                    <FontAwesomeIcon icon={faLink} />
                  </button>
                </div>
              </div>
            </div>
            <div
              className={`${styles.copyModal} ${
                copied == group.group_id ? styles.copied : ""
              }`}
            >
              Copied!
            </div>
          </div>
        );
      }),
    );
  }, [queryTags, searchQuery, groups, maxGroups, userInfo]);
  return otherGroupsEl;
}

export default GroupsGen;