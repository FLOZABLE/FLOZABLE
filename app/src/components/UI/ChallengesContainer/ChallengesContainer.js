import ChallengeContainer from "../ChallengeContainer/ChallengeContainer";
import styles from "./ChallengesContainer.module.css";

function ChallengesContainer({challenges, setResponse}) {
  return (
    <div className={styles.ChallengesContainer}>
      <ChallengeContainer setResponse={setResponse}/>
      <ChallengeContainer />
    </div>
  )
};

export default ChallengesContainer;