import { useState } from "react";
import styles from "./ThemesContainer.module.css";
import LikeBtn from "../LikeBtn/LikeBtn";
import GroupUrlBtn from "../GroupUrlBtn/GroupUrlBtn";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHeart, faPeopleGroup } from "@fortawesome/free-solid-svg-icons";

function ThemesContainer({
  searchQuery,
  setMyGroups,
  setOtherGroups,
  setJoinGroupResponse,
  joinGroupResponse,
  setIsGroupPwModal,
  setJoinTarget,
  themes,
  userInfo,
  queryTags,
}) {
  const [ThemesEl, setThemesEl] = useState([]);

  return (
    <div className={styles.ThemesContainer}>
      {ThemesEl}
      <div className={styles.Theme}>
        <div className={styles.img}>

        </div>
        <div className={styles.description}>
        <ul className={styles.info}>
          <li>
            <i>
            <FontAwesomeIcon icon={faHeart} />
            </i>
            <p>5</p>
          </li>
          <li>
            <i>
            <FontAwesomeIcon icon={faPeopleGroup} />
            </i>
            <p>5</p>
          </li>
        </ul>
        <div className={styles.content}>
          sdfsdfs sdfklsdkfskl sdflksdfklsdfklsfd
        </div>
        </div>
        <div className={styles.tags}>
          <div className={styles.tag}>ff</div>
          <div className={styles.tag}>ff</div>
        </div>
        <div className={styles.bottom}>
          <div className={styles.likeBtnWrapper}>
            <LikeBtn liked={true} id={'group_id'} />
          </div>
          <button
            onClick={() => {
              /* joinGroup('groupInfo'); */
            }}
          >
            Save
          </button>
          <GroupUrlBtn text={`https://flozable.com/groups/join/${'group_id'}`} />
        </div>
      </div>
      <div className={styles.Theme}>
        <div className={styles.img}>

        </div>
        <div className={styles.description}>

        </div>
        <div className={styles.tags}>

        </div>
        <div className={styles.bottom}>
          <div className={styles.likeBtnWrapper}>
            <LikeBtn liked={true} id={'group_id'} />
          </div>
          <button
            onClick={() => {
              /* joinGroup('groupInfo'); */
            }}
          >
            Bookmark
          </button>
          <GroupUrlBtn text={`https://flozable.com/groups/join/${'group_id'}`} />
        </div>
      </div>
    </div>
  );
};

export default ThemesContainer;