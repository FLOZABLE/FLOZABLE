import ChallengeContainer from "../ChallengeContainer/ChallengeContainer";
import styles from "./ChallengesContainer.module.css";
import ChallengeRoom from "../ChallengeRoom/ChallengeRoom";
import { useEffect, useState } from "react";

function ChallengesContainer({ challenges, setChallenges, setResponse, userInfo, setUserInfo }) {

  const [challengesEl, setChallengesEl] = useState(<div></div>);

  useEffect(() => {
    const tempEl = [];
    challenges.map((challenge, i) => {
      tempEl.push(
        <ChallengeRoom key={i} challengeInfo={challenge} challenges={challenges} setChallenges={setChallenges} setResponse={setResponse} />
      )
    });
    setChallengesEl(tempEl);
  }, [challenges]);


  return (
    <div className={styles.ChallengesContainer}>
      {
        challenges.map((challenge, i) => {
          return (
            <ChallengeContainer
              key={i}
              challenge={challenge}
              challenges={challenges}
              setChallenges={setChallenges}
              setResponse={setResponse}
              userInfo={userInfo}
              setUserInfo={setUserInfo}
            />
          );
        })
      }
    </div>
  )
};

export default ChallengesContainer;