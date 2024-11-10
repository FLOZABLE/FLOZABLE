import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import styles from "./ThemeContainer.module.css";
import { faHeart, faPeopleGroup } from "@fortawesome/free-solid-svg-icons";
import React, { useCallback, useEffect, useState } from "react";
import parse from "html-react-parser";
import ThemeUsageCounter from "../ThemeUsageCounter/ThemeUsageCounter";
import ThemeCategoryBtn from "@/app/components/Buttons/ThemeCategoryBtn/ThemeCategoryBtn";
import LikeBtn from "@/app/components/Buttons/LikeBtn/LikeBtn";
import config from "@/app/utils/config";
import GroupUrlBtn from "@/app/components/Buttons/GroupUrlBtn/GroupUrlBtn";
import SocketCounter from "../../Others/SocketCounter/SocketCounter";
import { postThemeLike } from "@/Api/themesApi";
import { useAccount } from "@/Hooks/accountHooks";

function ThemeContainer({ theme, isSearched, setIsThemePreview }) {
  const { accountData } = useAccount();

  const [likes, setLikes] = useState([]);

  const onLike = useCallback(async () => {
    try {
      if (!accountData?.user_id) return;

      const like = !likes.includes(accountData?.user_id);
      const themeId = theme.theme_id;
      const response = await postThemeLike({ themeId, like });
      if (!response.success) return;

      if (like) {
        setLikes([...new Set([...likes, accountData.user_id])]);
      } else {
        setLikes(likes.filter((like) => like !== accountData.user_id));
      }
    } catch (err) {
      console.log(err);
    }
  }, [likes, theme, accountData]);

  useEffect(() => {
    if (!theme) return;
    setLikes(theme.likes);
  }, [theme]);

  return (
    <div
      className={`${styles.ThemeContainer} ${isSearched ? "" : styles.hidden}`}
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
        <div
          className={styles.buttons}
          onClick={(e) => {
            e.stopPropagation();
          }}
        >
          <GroupUrlBtn
            text={`${config.server}/dashboard/themes?id=${theme.theme_id}`}
          />
          <div>
            <ThemeCategoryBtn theme={theme} />
          </div>
          <div>
            <LikeBtn
              liked={likes.includes(accountData?.user_id)}
              onClick={onLike}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default ThemeContainer;
