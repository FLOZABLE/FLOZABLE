"use client";

import { useCallback, useContext, useEffect, useState } from "react";
import styles from "./Tutorial.module.css";
import BlobBtn from "../../Buttons/BlobBtn/BlobBtn";
import { ModalsContext, TutorialsContext } from "@/app/utils/Contexts";
import { useRouter, useSearchParams } from "next/navigation";

function Tutorial() {
  const { tutorialBoxRef, tutorialTextRef, tutorial, setTutorial } =
    useContext(TutorialsContext);

  const router = useRouter();
  const searchParams = useSearchParams();

  const [highlight, setHighlight] = useState(false);

  const onClick = (e) => {
    const btnTutorial = parseInt(e.target.dataset.tutorial);
    console.log("btn tutorial", btnTutorial);
    setHighlight(false);
    
    if (!btnTutorial) {
      e.stopPropagation();
      e.preventDefault();
      return;
    }

    if (btnTutorial !== tutorial && btnTutorial !== -2) {
      e.stopPropagation();
      e.preventDefault();
    }

    /* setHighlight(false);
    setTimeout(() => {
      setHighlight(false);
    }, 1500); */
  };

  useEffect(() => {
    if (!tutorial) return;
    document.addEventListener("click", onClick, true);
    setTimeout(() => {
      setHighlight(true);
    }, 500);

    return () => {
      document.removeEventListener("click", onClick, true);
    };
  }, [tutorial]);

  const skipTutorial = useCallback(() => {
    setTutorial(false);
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.delete("welcome");
    router.replace(`/dashboard?${newSearchParams.toString()}`, {
      scroll: false,
    });
  }, [searchParams]);

  return (
    <div className={`${styles.Tutorial} ${tutorial ? styles.open : ""}`}>
      {tutorial >= 10 ? (
        <div to="/dashboard/groups" className={styles.end}>
          <p>All done!</p>
          <div className={styles.viewGroups}>
            <BlobBtn
              onClick={() => {
                router.push("/dashboard/groups");
                setTutorial(false);
              }}
              data-tutorial={-2}
              color1="white"
              color2="black"
            >
              View Rooms for Group-Studying
            </BlobBtn>
          </div>
        </div>
      ) : (
        <>
          <div
            className={`${styles.hole} ${highlight ? styles.active : null}`}
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
                setTutorial(false);
              }}
              data-tutorial={-2}
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
