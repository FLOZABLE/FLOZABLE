import React, { useState, useEffect } from 'react';
import styles from "./WelcomeModal.module.css";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import BlobBtn from '../BlobBtn/BlobBtn';
import Confetti from 'react-confetti';

function WelcomeModal({ }) {
  const navigate = useNavigate();
  const [isModal, setIsModal] = useState(true);

  return (
    <div
      to="/dashboard?tutorial=1"
      className={`${styles.WelcomeModal} ${isModal ? styles.open : ''}`}
    >
      <Confetti
        width={window.innerWidth}
        height={window.innerHeight}
        recycle={false}
        numberOfPieces={500}
        confettiSource={{x: 0, y: -10, w: window.innerWidth, h: 0}}
      />
      <div className={styles.modal}>
        <p>
          Welcome to FLOZABLE!
        </p>
        <div className={styles.blobWrapper}>
          <BlobBtn
            name={"Begin Tutorial"}
            setClicked={() => {
              setIsModal(false);
              navigate("/dashboard?tutorial=1")
            }}
            color1={"#fff"}
            color2={"var(--purple2)"}
          />
        </div>
      </div>
    </div>
  )
}

export default WelcomeModal;