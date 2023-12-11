import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import styles from "./ChallengeCompare.module.css";
import { Duration } from "luxon";

function ChallengeCompare({ value1, value2, user1Pfp, user2Pfp, userInfo1, userInfo2 }) {
    const morePercentage = Math.round((Math.max(value1, value2) / Math.min(value1, value2)) * 1000) / 10 - 100; //round to 1 place
    let percentageEl1 = <div></div>;
    let percentageEl2 = <div></div>;
    if (value1 > value2) {
        percentageEl1 = <div><p>+ {morePercentage}%</p></div>
    }
    else if (value2 > value1) {
        percentageEl2 = <div><p>+ {morePercentage}%</p></div>
    }
    return(
        <div>
            <div className={styles.firstHalf}>
                {user1Pfp}
                <h2>{userInfo1.name}</h2>
                <div className={styles.statContainer}>
                    {Duration.fromObject({ seconds: value1 }).toFormat("h'H 'mm'M 'ss'S'")}
                    {percentageEl1}
                </div>
            </div>
            <div className={styles.secondHalf}>
                {user2Pfp}
                <h2>{userInfo2.name}</h2>
                <div className={styles.statContainer}>
                    {Duration.fromObject({ seconds: value2 }).toFormat("h'H 'mm'M 'ss'S'")}
                    {percentageEl2}
                </div>
            </div>
        </div>
    );
}

export default ChallengeCompare;