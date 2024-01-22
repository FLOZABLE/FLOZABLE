import React from "react";
import styles from "./ChallengeRoom.module.css";
import { useEffect, useState } from "react";
import parse from "html-react-parser";
import { DateTime } from "luxon";

const serverOrigin = process.env.REACT_APP_ORIGIN;

function ChallengeRoom({ challengeInfo, setResponse, setChallenges, challenges }) {

  function joinChallenge(challengeId) {
    setChallenges(challenges.filter((c) => c.id !== challengeId));
    fetch(`${serverOrigin}/challenges/join-challenge`, {
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
      <h3>{parse(challengeInfo.description)}</h3>
      <p>By: {challengeInfo.userInfo.name}</p>
      <p>Starts: {DateTime.fromSeconds(challengeInfo.start_date).toFormat("DD")} at {DateTime.fromSeconds(challengeInfo.start_date).toFormat("h:mm a")}</p>
      <button onClick={() => { joinChallenge(challengeInfo.id) }}>Join!</button>
    </div>
  );
}

export default ChallengeRoom;