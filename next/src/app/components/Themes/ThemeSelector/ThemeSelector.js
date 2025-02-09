import styles from "./ThemeSelector.module.css";
import { faLink, faXmark } from "@fortawesome/free-solid-svg-icons";
import React, { useState, useEffect, useContext } from "react";
import config from "@/app/utils/config";
import CustomInput from "../../Inputs/CustomInput/CustomInput";
import { THEMES_CATEGORIES } from "@/app/utils/Themes";
import { ThemesContext } from "@/app/utils/Contexts";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { BackArrow } from "@/app/utils/Svg";
import Link from "next/link";

function ThemeSelector({ link, handleLinkInput, setVideoId }) {
  const { userThemes } = useContext(ThemesContext);

  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState({
    id: null,
    name: "",
    themes: [],
  });

  useEffect(() => {
    if (!userThemes) return;

    const categories = [];
    userThemes.map((theme) => {
      const categoryIndex = categories.findIndex(
        (category) => category.id === theme.category_id
      );

      if (categoryIndex === -1) {
        const category = THEMES_CATEGORIES.find(
          (category) => category.id === theme.category_id
        );

        if (category) {
          categories.push({
            ...category,
            themes: [theme],
          });
        }
      } else {
        categories[categoryIndex].themes.push(theme);
      }
    });

    setCategories(categories);
  }, [userThemes]);

  return (
    <div className={styles.ThemeSelector}>
      <div className={styles.categoriesPage}>
        {categories.length ? (
          <div className={`customScroll ${styles.categories}`}>
            {categories.map((category, i) => {
              const videoId = category.themes[0].video_id;
              return (
                <div
                  className={styles.category}
                  key={i}
                  style={{
                    backgroundImage: `url("https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`,
                    backgroundSize: "cover",
                    backgroundPosition: "center center",
                    backgroundRepeat: "no-repeat",
                  }}
                  onClick={() => {
                    setSelectedCategory(category);
                  }}
                >
                  <p className={styles.name}>{category.name}</p>
                </div>
              );
            })}
          </div>
        ) : (
          <Link className={styles.toTheme} href={"/dashboard/themes"}>
            Explore more themes!
          </Link>
        )}
        <CustomInput
          input={link}
          handleInput={handleLinkInput}
          placeHolder={"Paste a Youtube Link!"}
        >
          <FontAwesomeIcon icon={faLink} />
        </CustomInput>
      </div>
      <div
        className={`${styles.themesPage} ${
          selectedCategory.id !== null ? styles.opened : null
        }`}
      >
        <div className={styles.header}>
          <i
            onClick={() => {
              setSelectedCategory({
                id: null,
                name: "",
                themes: [],
              });
            }}
          >
            <BackArrow />
          </i>
          <i>{/* <FontAwesomeIcon icon={faXmark} /> */}</i>
        </div>
        <div className={`customScroll ${styles.themes}`}>
          {selectedCategory.themes.map((theme, i) => {
            return (
              <div
                className={styles.theme}
                key={i}
                style={{
                  backgroundImage: `url("https://i.ytimg.com/vi/${theme.video_id}/maxresdefault.jpg`,
                  backgroundSize: "cover",
                  backgroundPosition: "center center",
                  backgroundRepeat: "no-repeat",
                }}
                onClick={() => {
                  setVideoId(theme.video_id);
                }}
              >
                <p className={styles.name}>{theme.name}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default ThemeSelector;
