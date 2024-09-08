import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import styles from "./RankedTheme.module.css";
import { faHeart, faPeopleGroup } from "@fortawesome/free-solid-svg-icons";
import parse from "html-react-parser";
import React, { useCallback, useContext, useEffect, useState } from "react";
import ThemeUsageCounter from "../ThemeUsageCounter/ThemeUsageCounter";
import ThemeCategoryBtn from "@/app/components/Buttons/ThemeCategoryBtn/ThemeCategoryBtn";
import LikeBtn from "@/app/components/Buttons/LikeBtn/LikeBtn";
import config from "@/app/utils/config";
import GroupUrlBtn from "@/app/components/Buttons/GroupUrlBtn/GroupUrlBtn";
import { UserInfoContext } from "@/app/utils/Contexts";
import { postThemeLike } from "@/Api/themesApi";
import SocketCounter from "../../Others/SocketCounter/SocketCounter";

function RankedTheme({ theme, setIsThemePreview }) {
  const { userInfo } = useContext(UserInfoContext);

  const [likes, setLikes] = useState([]);

  const onLike = useCallback(async () => {
    if (!userInfo?.user_id) return;

    const like = !likes.includes(userInfo?.user_id);
    const themeId = theme.theme_id;
    const data = await postThemeLike({ themeId, like });
    if (!data.success) return;
    if (like) {
      setLikes([...new Set([...likes, userInfo.user_id])]);
    } else {
      setLikes(likes.filter((like) => like !== userInfo.user_id));
    }
  }, [likes, theme, userInfo]);

  useEffect(() => {
    if (!theme) return;
    setLikes(theme.likes);
  }, [theme]);

  return (
    <div
      className={styles.RankedTheme}
      style={{
        backgroundImage: `url("https://i.ytimg.com/vi/${theme.video_id}/maxresdefault.jpg`,
        backgroundSize: "cover",
        backgroundPosition: "center center",
        backgroundRepeat: "no-repeat",
      }}
      onClick={() => {
        setIsThemePreview((prev) => (!prev ? theme : !prev));
      }}
    >
      <div className={styles.contents}>
        <h4>{theme.name}</h4>
        <div className={styles.counts}>
          <div>
            <i>
              <FontAwesomeIcon icon={faHeart} />
            </i>
            <SocketCounter
              id={theme.theme_id}
              events={{ add: "like:theme", remove: "unlike:theme" }}
              members={likes}
              setMembers={setLikes}
            />
          </div>
          <div>
            <i>
              <FontAwesomeIcon icon={faPeopleGroup} />
            </i>
            <ThemeUsageCounter
              initialVal={theme.weekUsage}
              themeId={theme.theme_id}
            />
          </div>
        </div>
        <div className={`${styles.description} hiddenScroll`}>
          {parse(theme.description)}
        </div>
        <div className={`${styles.tags} hiddenScroll`}>
          {theme.tags.map((tag, i) => (
            <div className={styles.tag} key={i}>
              #{tag}
            </div>
          ))}
        </div>
        <div className={styles.buttons}>
          <GroupUrlBtn
            text={`${config.server}/dashboard/themes?id=${theme.id}`}
          />
          <div>
            <ThemeCategoryBtn theme={theme} />
          </div>
          <div>
            <LikeBtn
              liked={likes.includes(userInfo?.user_id)}
              onClick={onLike}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default RankedTheme;
