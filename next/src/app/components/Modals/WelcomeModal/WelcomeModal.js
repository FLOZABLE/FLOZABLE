"use client";

import React, { useState, useEffect, useContext } from "react";
import styles from "./WelcomeModal.module.css";
import BlobBtn from "../../Buttons/BlobBtn/BlobBtn";
import Confetti from "react-confetti";
import { TutorialsContext } from "@/app/utils/Contexts";
import { useAccount } from "@/Hooks/accountHooks";

function WelcomeModal({ }) {
  const [isModal, setIsModal] = useState(false);
  const { userInfo } = useAccount();
  const [confettiEl, setConfettiEl] = useState(null);
  const { setTutorial } = useContext(TutorialsContext);

  const [windowConfiguration, setWindowConfiguration] = useState({
    width: 0,
    height: 0,
  });

  useEffect(() => {
    setWindowConfiguration({
      width: window.screen.width,
      height: window.screen.height,
    });
  }, []);

  useEffect(() => {
    const isNew = new URLSearchParams(window.location.search);
    if (isNew.get("welcome") === "true") {
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
      className={`${styles.WelcomeModal} ${isModal ? styles.open : ""}`}
    >
      {confettiEl}
      <div className={styles.modal}>
        <p>Welcome to FLOZABLE!</p>
        <p className={styles.description}>
          Hey {userInfo?.name}, let&apos;s get you all set up with this tutorial
          <br />
          We hope your journey in studying is successful
        </p>
        <div className={styles.buttons}>
          <div className={styles.blobWrapper}>
            <BlobBtn
              onClick={() => {
                setIsModal(false);
                setTutorial(1);
                //navigate("/dashboard?tutorial=1");
              }}
              color1={"#fff"}
              color2={"var(--purple2)"}
            >
              Begin!
            </BlobBtn>
          </div>
          <button
            className={styles.skipBtn}
            onClick={() => {
              setIsModal(false);
            }}
          >
            or Skip Tutorial
          </button>
        </div>
      </div>
    </div>
  );
}

export default WelcomeModal;
