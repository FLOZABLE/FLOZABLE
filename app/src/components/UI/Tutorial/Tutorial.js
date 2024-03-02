import { useEffect, useRef, useState } from "react";
import styles from "./Tutorial.module.css";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";
import BlobBtn from "../BlobBtn/BlobBtn";

function Tutorial({ setResponse, tutorialBoxRef, tutorialTextRef, }) {
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
    console.log(parseInt(btnTutorial), tutorial)
    if (parseInt(btnTutorial) !== tutorial) {
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
    };

    if (tutorial >= 12) {
      /* searchParams.delete("tutorial");
      setSearchParams(searchParams);
      navigate("/dashboard/groups")
      setResponse({success: true, msg: "You are done with tutorial!"});
      setTimeout(() => {
        setResponse({success: true, msg: "Join groups you want to!"});
      }, 4000); */
    }

    setTutorial(parseInt(tutorial));
  }, [searchParams]);

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
          </>
        )
      }
    </div>
  )
}

export default Tutorial;