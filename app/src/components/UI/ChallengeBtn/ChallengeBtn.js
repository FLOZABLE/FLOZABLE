import { Punch } from "../../../utils/svgs";
import BlobBtn from "../BlobBtn/BlobBtn";
import styles from "./ChallengeBtn.module.css";
import React from 'react';

const serverOrigin = process.env.REACT_APP_ORIGIN;

function ChallengeBtn({ userInfo, setResponse }) {

  const requestChallenge = () => {
    fetch(`${serverOrigin}/challenges/challenge-request`, {
      method: "post",
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ targetId: userInfo.user_id }), //userInfo = user of the page you're viewing
    })
      .then((response) => response.json())
      .then((data) => {
        setResponse(data);
        if (data.success) {

        }
      })
      .catch((error) => console.error(error));
  }

  return (
    <div className={styles.ChallengeBtn}>
      <div className={styles.blobWrapper}>
        <BlobBtn delay={-1} name={<Punch width={'1.125rem'} height={'1.125rem'} fill={'red'} />} setClicked={() => { requestChallenge() }} color1={'#fff'} color2={"var(--pink)"} opt={2} />
      </div>

      <div className={styles.hoverEl}>
        <p>Compete with {userInfo ? userInfo.name : ''}!</p>
      </div>
    </div>
  )
};

export default ChallengeBtn;