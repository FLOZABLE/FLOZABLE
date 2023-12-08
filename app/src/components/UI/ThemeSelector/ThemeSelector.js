import styles from "./ThemeSelector.module.css";
import { AllThemes } from "../../../utils/Themes";
import CustomInput from "../CustomInput/CustomInput";
import { faLink } from "@fortawesome/free-solid-svg-icons";
import { useState, useEffect } from "react";

const serverOrigin = process.env.REACT_APP_ORIGIN;

function ThemeSelector({ link, handleLinkInput, submit, setVideoId }) {

  const [themeCategory, setThemeCategory] = useState("");
  const [themeChoices, setThemeChoices] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectionEl, setSelectionEl] = useState(<p></p>);
  const [themesList, setThemesList] = useState(null);

  useEffect(() => {
    const tempThemes = [];
    AllThemes.map((theme) => {
      theme.category.map((category) => {
        let newTheme = true;
        tempThemes.map((t) => {
          if (t.name === category){
            t.choices.push(theme);
            newTheme = false;
          }
        })

        if (newTheme) {
          tempThemes.push({name: category, choices: [theme], img: theme.img});
        }
      });
    });
    setThemesList(tempThemes);
    console.log(tempThemes);
  }, [])

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
                  backgroundImage: `url("${serverOrigin}/img/Themes/${Theme.img}")`,
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
        </div>
      )
    }
    else {
      console.log(themeChoices);
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
                  backgroundImage: `url("${serverOrigin}/img/Themes/${Theme.img}")`,
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
          <button onClick={() => { setThemeCategory("") }}>&lt;Back</button>
          <button>Load More</button>
        </div>
      )
    }
  }, [themeChoices, themeCategory, themesList]);

  return (
    <div className={styles.ThemeSelector}>
      {selectionEl}
      <CustomInput
        input={link}
        handleInput={handleLinkInput}
        handleEnter={submit}
        icon={faLink}
        placeHolder={"or Paste a Youtube Link!"}
        type={"text"}
      />
    </div>
  );
}

export default ThemeSelector;
