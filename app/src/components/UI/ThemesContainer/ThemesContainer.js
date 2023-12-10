import { useEffect, useState } from "react";
import styles from "./ThemesContainer.module.css";
import LikeBtn from "../LikeBtn/LikeBtn";
import GroupUrlBtn from "../GroupUrlBtn/GroupUrlBtn";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHeart, faPeopleGroup } from "@fortawesome/free-solid-svg-icons";
import ThemeContainer from "../ThemeContainer/ThemeContainer";

function ThemesContainer({
  themes,
  userInfo
}) {
  const [ThemesEl, setThemesEl] = useState([]);

  useEffect(() => {
    if (!themes || !userInfo) return;
    setThemesEl(themes.map((theme, i) => {
      return (
        <ThemeContainer
        theme={theme}
        key={i}
        userInfo={userInfo}
        />
      )
    }));
  }, [themes, userInfo]);

  return (
    <div className={styles.ThemesContainer}>
      {ThemesEl}
    </div>
  );
};

export default ThemesContainer;