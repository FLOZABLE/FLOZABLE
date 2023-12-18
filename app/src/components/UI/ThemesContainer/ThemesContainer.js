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
    console.log(tags, searchQuery, sortOpt, themes)
    const newThemes = JSON.parse(JSON.stringify(themes));
    //sort by like
    if (sortOpt) {
      newThemes.sort((a, b) => b.weekUsage - a.weekUsage)
    } else {
      //by usage
      newThemes.sort((a, b) => b.likes.length - a.likes.length)
    };

    console.log(newThemes)
    setThemesEl(newThemes.map((theme, i) => {
      const {description, name} = theme;
      const tagsArr = theme.tags === "" ? [] : theme.tags.split(","); 
      console.log(tags)
      const isSearched = ((description + name + tags).includes(searchQuery) || searchQuery === "") && (tagsArr.some(element => tags.includes(element)) || !tags.length);
      return (
        <ThemeContainer
          isSearched={isSearched}
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