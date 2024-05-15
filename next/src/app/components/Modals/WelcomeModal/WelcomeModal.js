'use client'

import React, { useState, useEffect, useContext } from 'react';
import styles from "./WelcomeModal.module.css";
import BlobBtn from '../../Buttons/BlobBtn/BlobBtn';
import Confetti from 'react-confetti';
import { UserInfoContext } from '@/app/utils/Contexts';

function WelcomeModal({ }) {
  const [isModal, setIsModal] = useState(false);
  const { userInfo } = useContext(UserInfoContext);
  const [confettiEl, setConfettiEl] = useState(null)

  const [windowConfiguration, setWindowConfiguration] = useState({ width: 0, height: 0 });

  useEffect(() => {
    setWindowConfiguration({ width: window.screen.width, height: window.screen.height });
  }, []);

  useEffect(() => {
    const isNew = new URLSearchParams(window.location.search);
    console.log(isNew.get("welcome"), isNew.toString());
    if (isNew.get("welcome") === "true") {
      console.log('new', isNew);
      setIsModal(true);
      setConfettiEl(
        <Confetti
          width={windowConfiguration.width}
          height={windowConfiguration.height}
          recycle={false}
          numberOfPieces={500}
          confettiSource={{ x: 0, y: -10, w: windowConfiguration.width, h: 0 }}
        />
      );
    } else {
      setIsModal(false);
    }
  }, [userInfo]);

  return (
    <div
      to="/dashboard?tutorial=1"
      className={`${styles.WelcomeModal} ${isModal ? styles.open : ''}`}
    >
      {confettiEl}
      <div className={styles.modal}>
        <p>
          Welcome to FLOZABLE!
        </p>
        <p className={styles.description}>
          Hey {userInfo?.name}, let&apos;s get you all set up with this tutorial
          <br />
          We hope your journey in studying is successful
        </p>
        <div className={styles.buttons}>
          <div className={styles.blobWrapper}>
            <BlobBtn
              name={"Begin!"}
              setClicked={() => {
                setIsModal(false);
                navigate("/dashboard?tutorial=1")
              }}
              color1={"#fff"}
              color2={"var(--purple2)"}
            />
          </div>
          <button className={styles.skipBtn} onClick={() => {
            setIsModal(false);
          }}>
            or Skip Tutorial
          </button>
        </div>
      </div>
    </div>
  )
}

export default WelcomeModal;