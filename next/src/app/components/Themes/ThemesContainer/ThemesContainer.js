import React, { useContext, useEffect, useState } from "react";
import styles from "./ThemesContainer.module.css";
import { ThemesContext } from "@/app/utils/Contexts";
import ThemeContainer from "../ThemeContainer/ThemeContainer";

function ThemesContainer({ tags, searchQuery, sortOpt, setIsThemePreview }) {
  const { themes } = useContext(ThemesContext);

  const [sortedThemes, setSortedThemes] = useState([]);

  useEffect(() => {
    if (!themes) return;
    const newThemes = JSON.parse(JSON.stringify(themes));
    //sort by like
    if (sortOpt) {
      newThemes.sort((a, b) => b.weekUsage - a.weekUsage);
    } else {
      //by usage
      newThemes.sort((a, b) => b.likes.length - a.likes.length);
    }

    setSortedThemes(newThemes);
  }, [themes, sortOpt]);

  return (
    <div className={styles.ThemesContainer}>
      {sortedThemes.map((theme, i) => {
        let isSearched = false;

        const lowecaseTags = theme.tags.map((tag) => tag.toLowerCase());

        const searchQueryRegex = new RegExp(`${searchQuery}`, "i");

        if (!tags.length && searchQuery === "") {
          isSearched = true;
        } else if (searchQuery === "") {
          isSearched = lowecaseTags.some((tag) =>
            tags.includes(tag.toLowerCase())
          );
        } else if (!tags.length) {
          isSearched = theme.name.toLowerCase().includes(searchQuery);
        } else {
          isSearched =
            lowecaseTags.some((tag) => tags.includes(tag.toLowerCase())) &&
            searchQueryRegex.test(theme.name + theme.description);
        }

        return (
          <ThemeContainer
            key={i}
            theme={theme}
            isSearched={isSearched}
            setIsThemePreview={setIsThemePreview}
          />
        );
      })}
    </div>
  );
}

export default ThemesContainer;
