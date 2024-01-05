import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import styles from "./RankedTheme.module.css";
import { faHeart, faPeopleGroup } from "@fortawesome/free-solid-svg-icons";
import GroupLikesCounter from "../GroupLikesCounter/GroupLikesCounter";
import ThemeUsageCounter from "../ThemeUsageCounter/ThemeUsageCounter";
import parse from "html-react-parser";
import ThemeCategoryBtn from "../ThemeCategoryBtn/ThemeCategoryBtn";
import GroupUrlBtn from "../GroupUrlBtn/GroupUrlBtn";
import LikeBtn from "../LikeBtn/LikeBtn";

const serverOrigin = process.env.REACT_APP_ORIGIN;

function RankedTheme({ theme, setResponse, liked, rank }) {

  return (
    <div className={styles.RankedTheme}
    >
      <div className={styles.img}
        style={{
          backgroundImage: `url("https://i.ytimg.com/vi/${theme?.video_id}/maxresdefault.jpg`, backgroundSize: 'cover',
          backgroundPosition: 'center center',
          backgroundRepeat: 'no-repeat',
        }}
      >
      </div>
      <div className={styles.name}>
        #{rank + 1} {theme?.name}
      </div>
      <div className={styles.description}>
        <ul className={styles.info}>
          <li>
            <i>
              <FontAwesomeIcon icon={faHeart} />
            </i>
            <GroupLikesCounter
              initialMembers={(theme?.likes)}
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
        <div>
          <ThemeCategoryBtn
            themeId={theme?.id}
            setResponse={setResponse}
          />
        </div>
        <GroupUrlBtn text={`https://flozable.com/groups/join/${theme?.id}`} />
      </div>
    </div>
  )
};

export default RankedTheme;