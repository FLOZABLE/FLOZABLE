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
  const [selectionEl, setSelectionEl] = useState(<p></p>)

  useEffect(() => {
    console.log(themeCategory);
    if (themeCategory === "") {
      setSelectionEl(
        <div className={`${styles.themeContainer} customScroll`}>
          {AllThemes.map((Theme, i) => {
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
                  <p>{Theme.category}</p>
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
          <button onClick={() => {setThemeCategory("")}}>&lt;Back</button>
          <button>Load More</button>
        </div>
      )
    }
  }, [themeChoices, themeCategory]);

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
