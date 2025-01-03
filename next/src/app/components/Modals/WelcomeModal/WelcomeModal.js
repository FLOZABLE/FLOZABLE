"use client";

import React, { useState, useEffect, useCallback, useContext } from "react";
import styles from "./WelcomeModal.module.css";
import BlobBtn from "../../Buttons/BlobBtn/BlobBtn";
import Confetti from "react-confetti";
import { useWindowSize } from "@/Hooks/otherHooks";
import { useRouter, useSearchParams } from "next/navigation";
import { useAccount } from "@/Hooks/accountHooks";
import { useTour } from "@reactour/tour";
import { WelcomeModalContext } from "@/app/utils/Contexts";

function WelcomeModal({}) {
  const { isWelcomeModal, setIsWelcomeModal } = useContext(WelcomeModalContext);

  const { width, height } = useWindowSize();
  const searchParams = useSearchParams();

  const router = useRouter();

  const { accountData } = useAccount();
  const { isOpen, setIsOpen, currentStep, setCurrentStep } = useTour();

  const [isConfetti, setIsConfetti] = useState(false);

  useEffect(() => {
    const welcome = searchParams.get("welcome");
    if (welcome === "true") {
      setIsWelcomeModal(true);
      setIsConfetti(true);
    } else {
      setIsWelcomeModal(false);
    }
  }, [searchParams]);

  useEffect(() => {
    if (currentStep === 24) {
      setIsWelcomeModal(true);
      setIsOpen(false);
    }
  }, [currentStep]);

  /* useEffect(() => {
    setCurrentStep(24);
    setIsWelcomeModal(true);
  }, []);

  console.log(currentStep, isWelcomeModal); */
  return (
    <div
      className={`${styles.WelcomeModal} ${isWelcomeModal ? styles.open : ""}`}
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
      {currentStep !== 24 ? (
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
                  router.push("/dashboard");
                  setTimeout(() => {
                    setIsWelcomeModal(false);
                    setIsOpen(true);
                  }, 500);
                }}
              >
                Begin!
              </BlobBtn>
            </div>
          </div>
        </div>
      ) : (
        <div className={styles.modal}>
          <p>You&apos;re all set to start your study journey!</p>
          <div className={styles.buttons}>
            <div className={styles.blobWrapper}>
              <BlobBtn
                onClick={() => {
                  setIsWelcomeModal(false);
                  setIsOpen(false);
                  router.push("/dashboard");
                }}
              >
                Go back to dashboard
              </BlobBtn>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default WelcomeModal;
