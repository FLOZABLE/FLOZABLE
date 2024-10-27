import React, { useCallback, useContext, useEffect, useState } from "react";
import styles from "./ThemeCategoryBtn.module.css";
import { ThemesContext } from "@/app/utils/Contexts";
import { useRouter } from "next/navigation";
import { postThemesThemeSave } from "@/Api/themesApi";
import { THEMES_CATEGORIES } from "@/app/utils/Themes";

function ThemeCategoryBtn({ theme, bgColor = "#ffffffC0", color = "#000" }) {
  const { userThemes, setUserThemes } = useContext(ThemesContext);

  const router = useRouter();

  const [disp, setDisp] = useState("Save");
  const [isOpen, setIsOpen] = useState(false);

  const save = useCallback(
    (category) => {
      (async () => {
        const categoryId = category.id;
        const categoryName = category.name;
        const response = await postThemesThemeSave({
          themeId: theme.theme_id,
          categoryId,
          categoryName,
        });
        if (!response.success) return;

        setIsOpen(false);
        const newUserThemes = userThemes.filter(
          (userTheme) => userTheme.theme_id !== theme.theme_id
        );

        if (categoryId !== -1) {
          newUserThemes.push({ ...theme, category_id: categoryId });
        }

        setUserThemes(newUserThemes);

        router.push(window.location.pathname, { scroll: false });
      })();
    },
    [theme, userThemes]
  );

  useEffect(() => {
    const themeInfo = userThemes.find(
      (userTheme) => userTheme.theme_id === theme.theme_id
    );
    if (!themeInfo) {
      return setDisp("Save");
    }
    const category = THEMES_CATEGORIES.find(
      (category) => category.id === themeInfo.category_id
    );
    if (category) {
      setDisp(`Saved to ${category.name}`);
    }
  }, [userThemes, theme]);

  return (
    <button
      className={`${styles.ThemeCategoryBtn} ${isOpen ? styles.open : ""}`}
      onFocus={() => {
        setIsOpen(true);
      }}
      onClick={() => {
        setIsOpen(true);
      }}
      onBlur={() => {
        setIsOpen(false);
      }}
      style={{ backgroundColor: bgColor, color }}
    >
      <p className={styles.categoryDisp} style={{ color }}>
        {disp}
      </p>
      <ul className={styles.options}>
        {THEMES_CATEGORIES.map((category, i) => {
          return (
            <div
              className={styles.option}
              key={i}
              onClick={() => {
                save(category);
              }}
            >
              <p>{category.name}</p>
            </div>
          );
        })}
      </ul>
    </button>
  );
}

export default ThemeCategoryBtn;
