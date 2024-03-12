import React, { useEffect, useState } from "react";
import styles from "./ThemeCategoryBtn.module.css";
import { AllCategories } from "../../../utils/Themes";

const serverOrigin = process.env.REACT_APP_ORIGIN;

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

function ThemeCategoryBtn({ themeId, setResponse, themeCategory, bgColor = '#ffffffC0', color = '#000' }) {
  const [category, setCategory] = useState(-2);
  const [disp, setDisp] = useState("Save");
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (category === -2 || !themeId) return;
    fetch(`${serverOrigin}/themes/save`, {
      method: "post",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        themeId,
        category,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        setResponse(data);
        if (data.success) {
          setDisp(`Saved to ${allCategoriesParsed[category].split(":")[0]}`);
        }
      })
      .catch((error) => console.error(error));
  }, [category, themeId]);

  useEffect(() => {
    if (themeCategory != -1 && !isNaN(themeCategory)) {
      setDisp(`Saved to ${allCategoriesParsed[parseInt(themeCategory)]}`);
    }
  }, []);

  return (
    <button
      className={`${styles.ThemeCategoryBtn} ${isOpen ? styles.open : ""}`}
      onFocus={() => {
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
