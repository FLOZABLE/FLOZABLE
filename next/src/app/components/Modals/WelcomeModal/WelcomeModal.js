"use client";

import React, { useState, useEffect, useContext, useCallback } from "react";
import styles from "./WelcomeModal.module.css";
import BlobBtn from "../../Buttons/BlobBtn/BlobBtn";
import Confetti from "react-confetti";
import { TutorialsContext } from "@/app/utils/Contexts";
import { useWindowSize } from "@/Hooks/otherHooks";
import { useRouter, useSearchParams } from "next/navigation";
import { useAccount } from "@/Hooks/accountHooks";
import { useTour } from "@reactour/tour";

function WelcomeModal({}) {
  const { width, height } = useWindowSize();
  const searchParams = useSearchParams();
  const router = useRouter();

  const { accountData } = useAccount();
  const { setTutorial } = useContext(TutorialsContext);
  const { setIsOpen } = useTour();

  const [isModal, setIsModal] = useState(false);
  const [isConfetti, setIsConfetti] = useState(false);

  useEffect(() => {
    const welcome = searchParams.get("welcome");
    if (welcome === "true") {
      setIsModal(true);
      setIsConfetti(true);
    } else {
      setIsModal(false);
    }
  }, [searchParams]);

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
          Hey {accountData?.name}, let&apos;s get you all set up with this
          tutorial
          <br />
          We hope your journey in studying is successful
        </p>
        <div className={styles.buttons}>
          <div className={styles.blobWrapper}>
            <BlobBtn
              onClick={() => {
                setIsModal(false);
                setIsOpen(true);
                //setTutorial(1);
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
