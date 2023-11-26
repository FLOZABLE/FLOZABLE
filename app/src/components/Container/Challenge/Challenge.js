import styles from "./Challenge.module.css";
import React, { useState, useEffect, useRef } from 'react';

const serverOrigin = process.env.REACT_APP_ORIGIN;

function Challenge({ challenges, allMembers, userInfo }) { //challenge data, allMembers (for link of challenger), userInfo

  return (
    <div className={styles.ChallengeContainer}>
        <div className={styles.CurrentChallenge}>
            <h1>This is a header</h1>
        </div>
    </div>
  )
}

export default Challenge;