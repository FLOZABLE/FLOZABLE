import ChallengeContainer from "../ChallengeContainer/ChallengeContainer";
import styles from "./ChallengesContainer.module.css";
import React, { useEffect, useState } from "react";

function ChallengesContainer({ challenges, setChallenges, setResponse, userInfo, setUserInfo }) {

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