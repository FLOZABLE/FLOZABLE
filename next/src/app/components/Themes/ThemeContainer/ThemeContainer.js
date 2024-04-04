import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import styles from "./ThemeContainer.module.css";
import { faHeart, faPeopleGroup } from "@fortawesome/free-solid-svg-icons";
import React, { useContext, useEffect, useState } from "react";
import parse from "html-react-parser";
import { UserInfoContext } from "@/app/utils/Contexts";
import GroupLikesCounter from "@/app/components/Groups/GroupLikesCounter/GroupLikesCounter";
import ThemeUsageCounter from "../ThemeUsageCounter/ThemeUsageCounter";
import ThemeCategoryBtn from "@/app/components/Buttons/ThemeCategoryBtn/ThemeCategoryBtn";
import LikeBtn from "@/app/components/Buttons/LikeBtn/LikeBtn";
import config from "@/app/utils/config";
import GroupUrlBtn from "@/app/components/Buttons/GroupUrlBtn/GroupUrlBtn";

function ThemeContainer({
  theme,
  isSearched,
  setIsThemePreview,
}) {
  const { userInfo } = useContext(UserInfoContext);

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
        setIsThemePreview((prev) => (!prev ? theme : !prev));
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
        <div className={styles.buttons} onClick={(e) => { e.stopPropagation() }}>
          <GroupUrlBtn text={`${config.server}/dashboard/themes?id=${theme?.id}`} />
          <div>
            <ThemeCategoryBtn
              themeId={theme.id}
            />
          </div>
          <div>
            <LikeBtn liked={liked} id={theme?.id}
              url={`${config.server}/themes/like/${theme?.id}`}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default ThemeContainer;
