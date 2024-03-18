import { useCallback, useEffect, useRef, useState } from "react";
import styles from "./Tutorial.module.css";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";
import BlobBtn from "../BlobBtn/BlobBtn";

function Tutorial({ setResponse, tutorialBoxRef, tutorialTextRef, isAccountModal}) {
  const location = useLocation();
  const [tutorial, setTutorial] = useState(null);
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

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

  useEffect(() => {
    console.log(location);
    const tutorial = searchParams.get("tutorial");

    if (!tutorial) {
      setTutorial(0);

      return;
    };

    setTutorial(parseInt(tutorial));
  }, [searchParams, isAccountModal]);

  useEffect(() => {
    if(isAccountModal) {
      skipTutorial();
    }
  }, [isAccountModal]);

  useEffect(() => {
    if (!tutorial) return;

    if (tutorial >= 12) {
      return;
    }

    document.addEventListener("click", handler, true);

    return () => {
      document.removeEventListener("click", handler, true);
    }
  }, [tutorial]);

  const skipTutorial = useCallback(() => {
    const searchParams = new URLSearchParams(window.location.search);
    searchParams.delete('tutorial');
    setSearchParams(searchParams);
  }, [searchParams]);

  //setTimeout(skipTutorial, 120000); //Testing


  return (
    <div className={`${styles.Tutorial} ${tutorial ? styles.open : ''}`}>
      {tutorial >= 12
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
                navigate("/dashboard/groups")
              }}
              color1={"#fff"}
              color2={"var(--purple2)"}
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