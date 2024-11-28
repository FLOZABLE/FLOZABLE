import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import styles from "./TutorialBtn.module.css";
import { faMap } from "@fortawesome/free-solid-svg-icons";
import { useRouter } from "next/navigation";
import { useTour } from "@reactour/tour";

export default function TutorialBtn() {
  const { setCurrentStep, setIsOpen } = useTour();

  const router = useRouter();

  return (
    <div
      onClick={() => {
        router.push("/dashboard");
        setTimeout(() => {
          setCurrentStep(0);
          setIsOpen(true);
        }, 500);
      }}
      className={styles.TutorialBtn}
    >
      <i>
        <FontAwesomeIcon icon={faMap} />
      </i>
      <div className={`${styles.hoverText} HoverText`}>Start Tutorial!</div>
    </div>
  );
}
