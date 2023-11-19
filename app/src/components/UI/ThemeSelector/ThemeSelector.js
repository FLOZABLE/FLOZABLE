import styles from "./ThemeSelector.module.css";
import { AllThemes } from "../../../utils/Themes";
import CustomInput from "../CustomInput/CustomInput";
import { faLink } from "@fortawesome/free-solid-svg-icons";

function ThemeSelector({link, handleLinkInput, submit, setVideoId}) {
  return (
    <div className={styles.ThemeSelector}>
      <div className={styles.themeContainer}>
      {AllThemes.map((Theme, i) => {
        return (
          <div className={styles.video} key={i} onClick={() => { setVideoId(Theme.id) }}
          style={{
            backgroundImage: `url(img/Themes/${Theme.img})`, backgroundSize: 'cover',
            backgroundPosition: 'center center',
            backgroundRepeat: 'no-repeat',
          }}
          >
           {/*  <img src={Theme.img} alt={Theme.id} /> */}
          </div>
        );
      })}
      </div>
      <CustomInput input={link} handleInput={handleLinkInput} handleEnter={submit} icon={faLink} placeHolder={"Paste a Youtube Link"} type={"text"} />
    </div>
  );
};

export default ThemeSelector;