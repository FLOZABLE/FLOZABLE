import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import styles from "./RankedTheme.module.css";
import { faHeart, faPeopleGroup } from "@fortawesome/free-solid-svg-icons";
import GroupLikesCounter from "../GroupLikesCounter/GroupLikesCounter";
import ThemeUsageCounter from "../ThemeUsageCounter/ThemeUsageCounter";
import parse from "html-react-parser";
import ThemeCategoryBtn from "../ThemeCategoryBtn/ThemeCategoryBtn";
import GroupUrlBtn from "../GroupUrlBtn/GroupUrlBtn";
import LikeBtn from "../LikeBtn/LikeBtn";
import React from 'react';

const serverOrigin = process.env.REACT_APP_ORIGIN;

function RankedTheme({ theme, setResponse, liked, rank, setIsActive, themeCategory }) {

  return (
    <div className={styles.RankedTheme}
      style={{
        backgroundImage: `url("https://i.ytimg.com/vi/${theme?.video_id}/maxresdefault.jpg`, backgroundSize: 'cover',
        backgroundPosition: 'center center',
        backgroundRepeat: 'no-repeat',
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
        <div className={styles.buttons}>
          <GroupUrlBtn text={`${serverOrigin}/dashboard/themes?id=${theme?.id}`} />
          <div>
            <ThemeCategoryBtn
              themeId={theme?.id}
              setResponse={setResponse}
              themeCategory={parseInt(themeCategory)}
            />
          </div>
          <div>
            <LikeBtn liked={liked} id={theme?.id}
              url={`${serverOrigin}/themes/like/${theme?.id}`}
            />
          </div>
        </div>
      </div>
    </div>
  )
};

export default RankedTheme;