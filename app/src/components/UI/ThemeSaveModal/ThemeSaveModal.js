import { useEffect, useState } from "react";
import styles from "./ThemesContainer.module.css";
import ThemeContainer from "../ThemeContainer/ThemeContainer";

function ThemesContainer({
  themes,
  userInfo,
  setResponse,
  tags,
  searchQuery,
  sortOpt,
  userThemes,
  setIsActive
}) {
  const [ThemesEl, setThemesEl] = useState([]);

  useEffect(() => {
    if (!themes || userInfo === null || userInfo === undefined) return;
    const newThemes = JSON.parse(JSON.stringify(themes));
    //sort by like
    if (sortOpt) {
      newThemes.sort((a, b) => b.weekUsage - a.weekUsage)
    } else {
      //by usage
      newThemes.sort((a, b) => b.likes.length - a.likes.length)
    };

    const userThemeIds = userThemes.map((theme) => {
      return theme.split(":")[1];
    });
    const userThemeCategories = userThemes.map((theme) => {
      return theme.split(":")[0];
    })

    setThemesEl(newThemes.map((theme, i) => {
      const { description, name } = theme;
      const tagsArr = theme.tags === "" ? [] : theme.tags.split(",");
      const isSearched = ((description + name + tags).includes(searchQuery) || searchQuery === "") && (tagsArr.some(element => tags.includes(element)) || !tags.length);
      const savedIndex = userThemeIds.indexOf(theme.id);
      const themeCategory = userThemeCategories[savedIndex];
      return (
        <ThemeContainer
          isSearched={isSearched}
          theme={theme}
          key={i}
          userInfo={userInfo}
          setResponse={setResponse}
          isSaved={savedIndex >= 0}
          themeCategory={themeCategory}
          setIsActive={setIsActive}
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