import React from "react";
import { Link } from "react-router-dom";
import styles from "./ChallengeRooms.module.css";
import { useEffect, useState } from "react";
import ChallengeRoom from "../../UI/ChallengeRoom/ChallengeRoom.js"
import CreateChallengeModal from "../../UI/CreateChallengeModal/CreateChallengeModal.js";
import RecommendChallenges from "../../UI/RecommendChallenges/RecommendChallenges.js";
import ChallengesContainer from "../../UI/ChallengesContainer/ChallengesContainer.js";
import ChallengeHistory from "../../UI/ChallengeHistory/ChallengeHistory.js";

const serverOrigin = process.env.REACT_APP_ORIGIN;

function ChallengeRooms({ isSidebarOpen, isSidebarHovered, setResponse, userInfo, setUserInfo }) {
  const [challenges, setChallenges] = useState([]);
  const [challengesEl, setChallengesEl] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [start, setStart] = useState(new Date());
  const [end, setEnd] = useState(new Date());

  useEffect(() => {
    fetch(`${serverOrigin}/challenges/rooms`, {
      method: "get",
      headers: {
        'Content-Type': 'application/json'
      },
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          const tempChallenges = [...data.data];
          setChallenges(tempChallenges);
        }
      });
  }, []);

  return (
    <div className={styles.ChallengeRooms}>
      <CreateChallengeModal
        isModalOpen={isModalOpen}
        setIsModalOpen={setIsModalOpen}
        title={title}
        setTitle={setTitle}
        description={description}
        setDescription={setDescription}
        start={start}
        setStart={setStart}
        end={end}
        setEnd={setEnd}
        setResponse={setResponse}
        challenges={challenges}
        setChallenges={setChallenges}
        userInfo={userInfo}
      />
      <div className={` Main ${isSidebarOpen || isSidebarHovered ? 'sidebarOpen' : ''}`}>
        <button onClick={() => { setIsModalOpen(true) }}>Create A Challenge</button>
        {
          challengesEl.map((el) => {
            return el;
          })
        }
        <div className={styles.challengeIntro}>
          <div className={styles.recommendedChallenges}>
            <div className={styles.title}>
              Continue The Rivalry
            </div>
            <RecommendChallenges />
          </div>
          <div className={styles.challengeHistory}>
            Your Challenges
            <ChallengeHistory userInfo={userInfo} />
          </div>
        </div>
        <div className={styles.box}>
          <h1>
            Browse Challenges
          </h1>
          <ChallengesContainer
            challenges={challenges}
            setChallenges={setChallenges}
            setResponse={setResponse}
            userInfo={userInfo}
            setUserInfo={setUserInfo}
          />
        </div>
      </div>
    </div>
  );
}

export default ChallengeRooms;