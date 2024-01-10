import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import styles from "./ThemeContainer.module.css";
import { faHeart, faPeopleGroup } from "@fortawesome/free-solid-svg-icons";
import LikeBtn from "../LikeBtn/LikeBtn";
import GroupUrlBtn from "../GroupUrlBtn/GroupUrlBtn";
import { useEffect, useState } from "react";
import parse from "html-react-parser";
import GroupLikesCounter from "../GroupLikesCounter/GroupLikesCounter";
import ThemeUsageCounter from "../ThemeUsageCounter/ThemeUsageCounter";

const serverOrigin = process.env.REACT_APP_ORIGIN;

function ThemeContainer({ theme, userInfo }) {
  const [liked, setLiked] = useState(false);
  
  useEffect(() => {
    if (!theme || !userInfo) return;
    const likes = theme.likes === "" ? [] : theme.likes.split(",");
    if (likes.includes(userInfo.user_id)) {
      setLiked(true);
    };
    
  }, [theme, userInfo]);

  return (
    <div className={styles.ThemeContainer}>
      <div className={styles.name}>
        {theme?.name}
      </div>
      <div className={styles.img}
        style={{
          backgroundImage: `url("https://i.ytimg.com/vi/${theme?.video_id}/maxresdefault.jpg`, backgroundSize: 'cover',
          backgroundPosition: 'center center',
          backgroundRepeat: 'no-repeat',
        }}
      >
      </div>
      <div className={styles.description}>
        <ul className={styles.info}>
          <li>
            <i>
              <FontAwesomeIcon icon={faHeart} />
            </i>
            <GroupLikesCounter 
              initialMembers={(theme?.likes ? theme.likes.split(',') : [])}
              groupId={theme?.id}
            />
          </li>
          <li>
            <i>
              <FontAwesomeIcon icon={faPeopleGroup} />
            </i>
            <ThemeUsageCounter 
              initialVal={0}
            />
          </li>
        </ul>
        <div className={styles.content}>
          {parse(theme?.description)}
        </div>
      </div>
      <div className={styles.tags}>
        {(theme?.tags ? theme.tags.split(',') : []).map((tag, i) => (
          <div className={styles.tag} key={i}>#{tag}</div>
        ))}
      </div>
      <div className={styles.bottom}>
        <div className={styles.likeBtnWrapper}>
          <LikeBtn liked={liked} id={theme?.id}
          url={`${serverOrigin}/themes/like/${theme?.id}`}
          />
        </div>
        <button
          onClick={() => {
            /* joinGroup('groupInfo'); */
          }}
        >
          Save
        </button>
        <GroupUrlBtn text={`${serverOrigin}/dashboard/themes?id=${theme?.id}`} />
      </div>
    </div>
  );
};

export default ThemeContainer;