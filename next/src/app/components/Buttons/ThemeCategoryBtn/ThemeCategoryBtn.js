import React, { useCallback, useContext, useEffect, useState } from "react";
import styles from "./ThemeCategoryBtn.module.css";
import { AllCategories } from "../../../utils/Themes";
import config from "@/app/utils/config";
import { ResponseContext, ThemesContext } from "@/app/utils/Contexts";
import { useRouter } from "next/navigation";

const options = AllCategories;
const allCategoriesParsed = {};
AllCategories.map((string) => {
  const index = string.split(":")[1];
  const name = string.split(":")[0];
  allCategoriesParsed[index] = name;
  /*
  Format:
  {
    "0": name,
    "1": name,
    "[id]" : [category name]
  }
  */
});

function ThemeCategoryBtn({ themeId, bgColor = '#ffffffC0', color = '#000' }) {
  const { setResponse } = useContext(ResponseContext);
  const { userThemes, setUserThemes } = useContext(ThemesContext);

  const router = useRouter();

  const [category, setCategory] = useState(-2);
  const [disp, setDisp] = useState("Save");
  const [isOpen, setIsOpen] = useState(false);

  const save = useCallback((category) => {
    if (category === -2 || !themeId) return;
    if (allCategoriesParsed[category] === "Unsave") {
      unSaveTheme(themeId);
      return;
    }
    fetch(`${config.server}/themes/save`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        themeId,
        category,
      }),
      credentials: "include"
    })
      .then((response) => response.json())
      .then((data) => {
        setResponse(data);
        if (data.success) {
          setDisp(`Saved to ${allCategoriesParsed[category].split(":")[0]}`);

          setUserThemes((prev) => {
            const foundIndex = prev.findIndex((val) => val.id === themeId);
            if (foundIndex !== -1) {
              return [
                ...prev.slice(0, foundIndex),
                {
                  id: themeId,
                  category: category
                },
                ...prev.slice(foundIndex + 1),
              ];
            } else {
              return [...prev.slice(), {
                id: themeId,
                category: category
              }];
            };
          });

          setIsOpen(false);

          router.replace(window.location.pathname, { scroll: false });
        }
      })
      .catch((error) => console.error(error));
  }, [themeId]);

  const unSaveTheme = function (themeId) {
    fetch(`${config.server}/themes/unsave`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        themeId,
      }),
      credentials: "include"
    })
      .then((response) => response.json())
      .then((data) => {
        setResponse(data);
        setDisp("Save");
        setIsOpen(false);
      })
  }

  useEffect(() => {
    const themeInfo = userThemes.find(theme => theme.id === themeId);
    if (themeInfo) {
      setDisp(`Saved to ${allCategoriesParsed[parseInt(themeInfo.category)]}`);
    };
  }, [userThemes, themeId]);

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
      <p className={styles.categoryDisp} style={{ color }}>{disp}</p>
      <ul className={styles.options}>
        {options.map((option, i) => {
          const optionArr = option.split(":");
          const optionName = optionArr[0];
          const optionIndex = parseInt(optionArr[1]);
          return (
            <div
              className={styles.option}
              key={i}
              onClick={() => {
                setCategory(optionIndex);
                setIsOpen(false);
                save(optionIndex);
              }}
            >
              <p>{optionName}</p>
            </div>
          );
        })}
      </ul>
    </button>
  );
}

export default ThemeCategoryBtn;
