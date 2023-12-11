import React from "react";
import styles from "./ChallengeRoom.module.css";
import { useEffect, useState } from "react";

const serverOrigin = process.env.REACT_APP_ORIGIN;

function ChallengeRoom({ challengeInfo, setResponse, setChallenges, challenges }) {

    function joinChallenge(challengeId) {
        console.log(challenges);
        console.log(challenges.filter((c) => c.id != challengeId));
        setChallenges(challenges.filter((c) => c.id !== challengeId));
        fetch(`${serverOrigin}/api/challenges/join-challenge`, {
            method: "post",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ joinId: challengeId }),
        })
            .then((response) => response.json())
            .then((data) => {
                setResponse(data);
            })
    }

    return (
        <div className={styles.ChallengeRoom}>
            <h2>{challengeInfo.name}</h2>
            <h3>{challengeInfo.description}</h3>
            <p>By: {challengeInfo.userInfo.name}</p>
            <p>Starts: {challengeInfo.start_date}</p>
            <button onClick = {() => {joinChallenge(challengeInfo.id)}}>Join!</button>
        </div>
    );
}

export default ChallengeRoom;