import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import styles from "./TutorialBtn.module.css";
import { faMap } from "@fortawesome/free-solid-svg-icons";
import { useContext } from "react";
import { TutorialsContext } from "@/app/utils/Contexts";

export default function TutorialBtn() {
  const {setTutorial} = useContext(TutorialsContext);
  
  return (
    <div onClick={() => {
      setTutorial(1);
    }}
      className={styles.TutorialBtn}
    >
      <i>
      <FontAwesomeIcon icon={faMap} />
      </i>
      <div className={styles.hoverEl}>
        Start Tutorial!
      </div>
    </div>
  )
}