"use client";

import { useCallback, useContext, useEffect } from "react";
import styles from "./Tutorial.module.css";
import BlobBtn from "../../Buttons/BlobBtn/BlobBtn";
import { ModalsContext, TutorialsContext } from "@/app/utils/Contexts";
import { useRouter } from "next/navigation";

function Tutorial() {
  const { tutorialBoxRef, tutorialTextRef, tutorial, setTutorial } =
    useContext(TutorialsContext);

  const router = useRouter();

  function handler(e) {
    const button = e.target.id;
    if (!button) {
      e.stopPropagation();
      e.preventDefault();
      return;
    }

    const btnTutorial = button.split("-")[1];
    if (parseInt(btnTutorial) !== tutorial && button !== "skipTutorialButton") {
      e.stopPropagation();
      e.preventDefault();
    }
  }

  useEffect(() => {
    if (!tutorial) return;
    document.addEventListener("click", handler, true);

    return () => {
      document.removeEventListener("click", handler, true);
    };
  }, [tutorial]);

  const skipTutorial = useCallback(() => {
    setTutorial(false);
  }, []);

  return (
    <div className={`${styles.Tutorial} ${tutorial ? styles.open : ""}`}>
      {tutorial >= 13 ? (
        <div to="/dashboard/groups" className={styles.end}>
          <p>All done!</p>
          <div className={styles.blobWrapper}>
            <BlobBtn
              onClick={() => {
                router.push("/dashboard/groups");
                setTutorial(false);
              }}
              id="tutorial-13"
            >
              View Rooms for Group-Studying
            </BlobBtn>
          </div>
        </div>
      ) : (
        <>
          <div
            className={styles.hole}
            id="tutorialHole"
            ref={tutorialBoxRef}
          ></div>
          <div
            className={styles.text}
            id="tutorialText"
            ref={tutorialTextRef}
          ></div>
          <div className={styles.skipOption}>
            <BlobBtn
              onClick={() => {
                skipTutorial();
              }}
              id="skipTutorialButton"
            >
              Skip Tutorial
            </BlobBtn>
          </div>
        </>
      )}
    </div>
  );
}

export default Tutorial;
