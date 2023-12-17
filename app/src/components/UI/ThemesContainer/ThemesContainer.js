import { useEffect, useState } from "react";
import styles from "./ThemesContainer.module.css";
import LikeBtn from "../LikeBtn/LikeBtn";
import GroupUrlBtn from "../GroupUrlBtn/GroupUrlBtn";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHeart, faPeopleGroup } from "@fortawesome/free-solid-svg-icons";
import ThemeContainer from "../ThemeContainer/ThemeContainer";

function ThemesContainer({
  themes,
  userInfo,
  setResponse,
  tags,
  searchQuery,
  sortOpt
}) {
  const [ThemesEl, setThemesEl] = useState([]);

  useEffect(() => {
    if (!themes || !userInfo) return;
    console.log(tags, searchQuery, sortOpt)
    const newThemes = [...themes].map(theme => {
      //theme.likes = theme.likes === "" ? [] : theme.likes.split(","); 
    })
    if (sortOpt) {
      themes.sort((a, b) => a.likes - b.likes)
    }
    setThemesEl(themes.map((theme, i) => {
      return (
        <ThemeContainer
          theme={theme}
          key={i}
          userInfo={userInfo}
          setResponse={setResponse}
        />
      )
    }));
  }, [themes, userInfo, tags, searchQuery, sortOpt]);

  return (
    <div className={styles.ThemesContainer}>
      {ThemesEl}
    </div>
  );
};

export default ThemesContainer;