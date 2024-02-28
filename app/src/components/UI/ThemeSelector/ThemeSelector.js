import styles from "./ThemeSelector.module.css";
import { AllCategories, AllThemes } from "../../../utils/Themes";
import CustomInput from "../CustomInput/CustomInput";
import { faLink } from "@fortawesome/free-solid-svg-icons";
import React, { useState, useEffect } from "react";

const serverOrigin = process.env.REACT_APP_ORIGIN;

function ThemeSelector({
  link,
  handleLinkInput,
  submit,
  setVideoId,
  setVolume,
}) {
  const [themeCategory, setThemeCategory] = useState("");
  const [themeChoices, setThemeChoices] = useState([]);
  const [selectionEl, setSelectionEl] = useState(<p></p>);
  const [themesList, setThemesList] = useState(null);

  function submitVideoId(e) {
    const url = e.target.value;
    try {
      const videoId = new URLSearchParams(new URL(url).search).get("v");
      setVideoId(videoId);
    } catch (err) {
      //Do nothing
    }
  }

  useEffect(() => {
    let allCategoriesParsed = {};
    AllCategories.map((string) => {
      const index = string.split(":")[1];
      const name = string.split(":")[0];
      allCategoriesParsed[index] = name;
    });

    fetch(`${serverOrigin}/themes/user`, {
      method: "get",
    })
      .then((response) => response.json())
      .then((data) => {
        let userThemes = [];
        const { themes } = data;
        if (!themes) return;

        if (themes.themes !== "") {
          userThemes = themes.themes.split(",");
        }
        const allIds = [];
        const allCategories = {};
        userThemes.map((theme) => {
          //theme is 0:id, 1:id ...
          const categoryAndId = theme.split(":"); // [0] is the index, and [1] is the id
          const categoryName = allCategoriesParsed[parseInt(categoryAndId[0])];
          allIds.push(categoryAndId[1]);
          allCategories[categoryAndId[1]] = categoryName.split(":")[0];
        });

        fetch(`${serverOrigin}/themes/videoIds?searchIds=${allIds}`, {
          method: "get",
        })
          .then((response) => response.json())
          .then((data) => {
            if (!data.success) {
              data.info = [];
            }
            const everyTheme = [...AllThemes]; //AllThemes + userThemes

            data.info.map((currentTheme, i) => {
              everyTheme.push({
                id: currentTheme.video_id,
                img: `https://i.ytimg.com/vi/${currentTheme.video_id}/maxresdefault.jpg`,
                name: currentTheme.name,
                category: [allCategories[currentTheme.id]],
              });
            });

            const tempThemes = [];
            everyTheme.map((theme) => {
              theme.category.map((category) => {
                let newTheme = true;
                tempThemes.map((t) => {
                  if (t.name === category) {
                    t.choices.push(theme);
                    newTheme = false;
                  }
                });

                if (newTheme) {
                  tempThemes.push({
                    name: category,
                    choices: [theme],
                    img: theme.img,
                  });
                }
              });
            });
            setThemesList(tempThemes);
          });
      });
  }, []);

  useEffect(() => {
    if (!!!themesList) return;
    if (themeCategory === "") {
      setSelectionEl(
        <div className={`${styles.themeContainer} customScroll`}>
          {themesList.map((Theme, i) => {
            return (
              <div
                className={styles.video}
                key={i}
                onClick={() => {
                  setThemeCategory(Theme.category);
                  setThemeChoices(Theme.choices);
                }}
                style={{
                  backgroundImage: Theme.img.startsWith("https:")
                    ? `url("${Theme.img}"`
                    : `url("${serverOrigin}/img/Themes/${Theme.img}")`,
                  backgroundSize: "cover",
                  backgroundPosition: "center center",
                  backgroundRepeat: "no-repeat",
                }}
              >
                <div className={styles.categoryLabel}>
                  <p>{Theme.name}</p>
                </div>
              </div>
            );
          })}
        </div>,
      );
    } else {
      setSelectionEl(
        <div className={`${styles.themeContainer} customScroll`}>
          {themeChoices.map((Theme, i) => {
            return (
              <div
                className={styles.video}
                key={i}
                onClick={() => {
                  setVideoId(Theme.id);
                }}
                style={{
                  backgroundImage: Theme.img.startsWith("https:")
                    ? `url("${Theme.img}"`
                    : `url("${serverOrigin}/img/Themes/${Theme.img}")`,
                  backgroundSize: "cover",
                  backgroundPosition: "center center",
                  backgroundRepeat: "no-repeat",
                }}
              >
                <div className={styles.nameLabel}>
                  <p>{Theme.name}</p>
                </div>
              </div>
            );
          })}
          <button
            onClick={() => {
              setThemeCategory("");
            }}
          >
            &lt;Back
          </button>
          <button>Load More</button>
        </div>,
      );
    }
  }, [themeChoices, themeCategory, themesList]);

  return (
    <div className={styles.ThemeSelector}>
      {selectionEl}
      <CustomInput
        input={link}
        handleInput={handleLinkInput}
        handleEnter={submitVideoId}
        icon={faLink}
        placeHolder={"or Paste a Youtube Link!"}
        type={"text"}
      />
    </div>
  );
}

export default ThemeSelector;
