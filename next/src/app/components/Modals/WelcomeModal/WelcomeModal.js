"use client";

import React, { useState, useEffect, useContext, useCallback } from "react";
import styles from "./WelcomeModal.module.css";
import BlobBtn from "../../Buttons/BlobBtn/BlobBtn";
import Confetti from "react-confetti";
import { TutorialsContext, UserInfoContext } from "@/app/utils/Contexts";
import { useWindowSize } from "@/Hooks/otherHooks";
import { useRouter, useSearchParams } from "next/navigation";

function WelcomeModal({}) {
  const { width, height } = useWindowSize();
  const searchParams = useSearchParams();
  const router = useRouter();

  const { userInfo } = useContext(UserInfoContext);
  const { setTutorial } = useContext(TutorialsContext);

  const [isModal, setIsModal] = useState(false);
  const [isConfetti, setIsConfetti] = useState(false);

  useEffect(() => {
    const isNew = new URLSearchParams(window.location.search);
    if (isNew.get("welcome") === "true") {
      setIsModal(true);
      setIsConfetti(true);
    } else {
      setIsModal(false);
    }
  }, [userInfo]);

  const skipTutorial = useCallback(() => {
    setIsModal(false);
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.delete("welcome");
    router.replace(`/dashboard?${newSearchParams.toString()}`, {
      scroll: false,
    });
  }, [searchParams]);

  return (
    <div
      to="/dashboard?tutorial=1"
      className={`${styles.WelcomeModal} ${isModal ? styles.open : ""}`}
    >
      {!isConfetti ? null : (
        <Confetti
          width={width}
          height={height}
          recycle={false}
          numberOfPieces={500}
          confettiSource={{ x: 0, y: -10, w: width, h: 0 }}
        />
      )}
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
            >
              Begin!
            </BlobBtn>
          </div>
          <button className={styles.skipBtn} onClick={skipTutorial}>
            or Skip Tutorial
          </button>
        </div>
      </div>
    </div>
  );
}

export default WelcomeModal;
