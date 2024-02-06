import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import styles from "./ThemeContainer.module.css";
import { faHeart, faPeopleGroup } from "@fortawesome/free-solid-svg-icons";
import LikeBtn from "../LikeBtn/LikeBtn";
import GroupUrlBtn from "../GroupUrlBtn/GroupUrlBtn";
import { useEffect, useState } from "react";
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
    >
      <div className={styles.name}>{theme?.name}</div>
      <div
        className={styles.img}
        onClick={() => {
          setIsActive((prev) => (!prev ? theme : !prev));
        }}
        style={{
          backgroundImage: `url("https://i.ytimg.com/vi/${theme?.video_id}/maxresdefault.jpg`,
          backgroundSize: "cover",
          backgroundPosition: "center center",
          backgroundRepeat: "no-repeat",
        }}
      ></div>
      <div className={`${styles.description} ${isSaved ? styles.saved : ""}`}>
        <ul className={styles.info}>
          <li>
            <i>
              <FontAwesomeIcon icon={faHeart} />
            </i>
            <GroupLikesCounter
              initialMembers={theme?.likes}
              groupId={theme?.id}
            />
          </li>
          <li>
            <i>
              <FontAwesomeIcon icon={faPeopleGroup} />
            </i>
            <ThemeUsageCounter
              initialVal={theme?.weekUsage}
              themeId={theme?.id}
            />
          </li>
        </ul>
        <div className={`${styles.content} hiddenScroll`}>
          {parse(theme?.description)}
        </div>
      </div>
      <div className={`${styles.tags} hiddenScroll`}>
        {(theme?.tags ? theme.tags.split(",") : []).map((tag, i) => (
          <p className={styles.tag} key={i}>
            #{tag}
          </p>
        ))}
      </div>
      <div className={styles.bottom}>
        <div className={styles.likeBtnWrapper}>
          <LikeBtn
            liked={liked}
            id={theme?.id}
            url={`${serverOrigin}/themes/like/${theme?.id}`}
          />
        </div>
        <div>
          <ThemeCategoryBtn
            themeId={theme.id}
            setResponse={setResponse}
            themeCategory={parseInt(themeCategory)}
          />
        </div>
        <GroupUrlBtn
          text={`${serverOrigin}/dashboard/themes?id=${theme?.id}`}
        />
      </div>
    </div>
  );
}

export default ThemeContainer;
