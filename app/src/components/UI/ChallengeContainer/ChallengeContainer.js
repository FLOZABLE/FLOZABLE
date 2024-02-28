import styles from "./ChallengeContainer.module.css";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck } from "@fortawesome/free-solid-svg-icons";
import React, { useEffect, useState } from "react";
import parse from 'html-react-parser';
import { DateTime } from 'luxon'

const serverOrigin = process.env.REACT_APP_ORIGIN;

function ChallengeContainer({
  challenge,
  setChallenges,
  challenges,
  setResponse,
  userInfo,
  setUserInfo,
  showRecord = false,
}) {

  const [challengeDescription, setChallengeDescription] = useState(<div></div>);
  const [challengeTitle, setChallengeTitle] = useState("");
  const [challengeTime, setChallengeTime] = useState("");
  const [challengeHostId, setChallengeHostId] = useState("");
  const [matchRecord, setMatchRecord] = useState(<div></div>);

  function joinChallenge() {
    const { id } = challenge;
    setChallenges(challenges.filter((challenge) => challenge.id !== id));
    fetch(`${serverOrigin}/challenges/join-challenge`, {
      method: "post",
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ joinId: id }),
    })
      .then((response) => response.json())
      .then((data) => {
        setResponse(data);
        if (data.success){
          setUserInfo({...userInfo});
          //setUserInfo to trigger the fetch inside challengeHistory.js
        }
      })
  }

  useEffect(() => {
    if (!challenge) return;
    setChallengeDescription(parse(challenge.description));
    setChallengeTitle(challenge.name);
    setChallengeTime(`${DateTime.fromSeconds(challenge.startDate).toFormat("DD")} at ${DateTime.fromSeconds(challenge.startDate).toFormat("h:mm a")}`);
    setChallengeHostId(challenge.hostId);
  }, [challenge]);

  useEffect(() => {
    if (!!showRecord) {
      setMatchRecord(
        <div className={styles.stat}>
          <p>3</p>/
          <p>0</p>/
          <p>2</p>
        </div>
      );
    }
  }, [showRecord])


  return (
    <div className={styles.ChallengeContainer}>
      <div className={styles.imgWrapper}
      >
        <Link
          to={`/dashboard/user/${challengeHostId}`}
          className={styles.profileImg}
          style={{
            backgroundImage: `url("${serverOrigin}/profile-images/{data.data.first_user_id}.jpeg")`, backgroundSize: 'cover',
            backgroundPosition: 'center center',
            backgroundRepeat: 'no-repeat',
          }}
        >
        </Link>
      </div>
      <div className={styles.info}>
        <h1>{challengeTitle}</h1>
        <p className={styles.name}>Jason</p>
        {matchRecord}
        <div className={styles.description}>
          {challengeDescription}
        </div>
        <div className={styles.start}>
          Starts on: {challengeTime}
        </div>
      </div>
      <div className={styles.button} onClick={() => { joinChallenge() }}>
        <i>
          <FontAwesomeIcon icon={faCheck} />
        </i>
      </div>
    </div>
  )
};

export default ChallengeContainer;