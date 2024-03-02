import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import styles from "./ThemeContainer.module.css";
import { faHeart, faPeopleGroup } from "@fortawesome/free-solid-svg-icons";
import LikeBtn from "../LikeBtn/LikeBtn";
import GroupUrlBtn from "../GroupUrlBtn/GroupUrlBtn";
import React, { useEffect, useState } from "react";
import parse from "html-react-parser";
import GroupLikesCounter from "../GroupLikesCounter/GroupLikesCounter";
import ThemeUsageCounter from "../ThemeUsageCounter/ThemeUsageCounter";
import ThemeCategoryBtn from "../ThemeCategoryBtn/ThemeCategoryBtn";

const serverOrigin = process.env.REACT_APP_ORIGIN;

function ThemeContainer({
  theme,
  userInfo,
  setResponse,
  isSearched,
  isSaved,
  themeCategory,
  setIsActive,
}) {
  const [liked, setLiked] = useState(false);

  useEffect(() => {
    if (!theme || !userInfo) return;
    if (theme.likes.includes(userInfo.user_id)) {
      setLiked(true);
    }
  }, [theme, userInfo]);

  return (
    <div
      className={`${styles.ThemeContainer} ${isSearched ? "" : styles.hidden}`}
      style={{
        backgroundImage: `url("https://i.ytimg.com/vi/${theme?.video_id}/maxresdefault.jpg`, backgroundSize: 'cover',
        backgroundPosition: 'center center',
        backgroundRepeat: 'no-repeat',
      }}
      onClick={() => {
        setIsActive((prev) => (!prev ? theme : !prev));
      }}
    >
      <div className={styles.contents}>
        <h4>{theme?.name}</h4>
        <div className={styles.counts}>
          <div>
            <i>
              <FontAwesomeIcon icon={faHeart} />
            </i>
            <GroupLikesCounter
              initialMembers={(theme?.likes)}
              groupId={theme?.id}
            />
          </div>
          <div>
            <i>
              <FontAwesomeIcon icon={faPeopleGroup} />
            </i>
            <ThemeUsageCounter
              initialVal={theme?.weekUsage}
              themeId={theme?.id}
            />
          </div>
        </div>
        <div className={`${styles.description} hiddenScroll`}>
          {parse(theme?.description)}
        </div>
        <div className={`${styles.tags} hiddenScroll`}>
          {(theme?.tags ? theme.tags.split(',') : []).map((tag, i) => (
            <div className={styles.tag} key={i}>#{tag}</div>
          ))}
        </div>
        <div className={styles.buttons} onClick={(e) => {e.stopPropagation()}}>
          <GroupUrlBtn text={`${serverOrigin}/dashboard/themes?id=${theme?.id}`} />
          <div>
            <ThemeCategoryBtn
              themeId={theme.id}
              setResponse={setResponse}
              themeCategory={parseInt(themeCategory)}
            />
          </div>
          <div>
            <LikeBtn liked={liked} id={theme?.id} setResponse={setResponse}
              url={`${serverOrigin}/themes/like/${theme?.id}`}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default ThemeContainer;
