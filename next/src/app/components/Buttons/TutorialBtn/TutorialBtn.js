import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import styles from "./TutorialBtn.module.css";
import { faMap } from "@fortawesome/free-solid-svg-icons";
import { useContext } from "react";
import { TutorialsContext } from "@/app/utils/Contexts";
import { useRouter } from "next/navigation";

export default function TutorialBtn() {
  const {setTutorial} = useContext(TutorialsContext);
  const router = useRouter();

  return (
    <div onClick={() => {
      router.push("/dashboard");
      setTimeout(() => {
        setTutorial(1);
      }, 500);
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