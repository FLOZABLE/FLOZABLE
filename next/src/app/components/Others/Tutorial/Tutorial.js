"use client";

import { useCallback, useContext, useEffect, useRef, useState } from "react";
import styles from "./Tutorial.module.css";
import BlobBtn from "../../Buttons/BlobBtn/BlobBtn";
import { ModalsContext, TutorialsContext } from "@/app/utils/Contexts";
import { useRouter } from "next/navigation";

function Tutorial() {
  const {tutorialBoxRef, tutorialTextRef, tutorial, setTutorial} = useContext(TutorialsContext);
  const {isAccountModal} = useContext(ModalsContext);

  const router = useRouter();

  function handler(e) {
    const button = e.target.id;
    if (!button) {
      e.stopPropagation();
      e.preventDefault();
      return;
    };

    const btnTutorial = button.split("-")[1];
    console.log(button)
    console.log(parseInt(btnTutorial), tutorial)
    if (parseInt(btnTutorial) !== tutorial && button !== "skipTutorialButton") {
      console.log('locked', button, tutorial)
      e.stopPropagation();
      e.preventDefault();
    };
  }


  /* useEffect(() => {
    if(isAccountModal) {
      skipTutorial();
    }
  }, [isAccountModal]); */

  useEffect(() => {
    if (!tutorial) return;
    document.addEventListener("click", handler, true);

    return () => {
      document.removeEventListener("click", handler, true);
    }
  }, [tutorial]);

  const skipTutorial = useCallback(() => {
    router?.replace({scroll: false});
  }, []);


  return (
    <div className={`${styles.Tutorial} ${tutorial ? styles.open : ''}`}>
      {tutorial >= 13
        ?
        <div
          to="/dashboard/groups"
          className={styles.end}
        >
          <p>
            All done!
          </p>
          <div className={styles.blobWrapper}>
            <BlobBtn
              name={"View Rooms for Group-Studying"}
              setClicked={() => {
                router.push("/dashboard/groups");
                setTutorial(false);
              }}
              color1={"#fff"}
              color2={"var(--purple2)"}
              id="tutorial-13"
            />
          </div>
        </div>
        : (
          <>
            <div className={styles.hole} id="tutorialHole" ref={tutorialBoxRef}>
            </div>
            <div className={styles.text} id="tutorialText" ref={tutorialTextRef}>
            </div>
            <div className={styles.skipOption}>
              <BlobBtn
                name={"Skip Tutorial"}
                setClicked={() => {
                  skipTutorial();
                }}
                color1={"#fff"}
                color2={"var(--purple2)"}
                id="skipTutorialButton"
              />
            </div>
          </>
        )
      }
    </div>
  )
}

export default Tutorial;