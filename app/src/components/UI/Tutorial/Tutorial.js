import { useEffect, useRef, useState } from "react";
import styles from "./Tutorial.module.css";
import { useLocation } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";

function Tutorial() {
  const location = useLocation();
  const [tutorial, setTutorial] = useState(null);
  const swiperRef = useRef(null);


  function handler(e) {
    console.log("tutorial",e.target.id, tutorial)
    const button = e.target.id;
    if (button === "addPlan" && tutorial === 1) {
      console.log('correct');
    } if (button === "tutorial-2" && tutorial == 2) {

    } else {
      e.stopPropagation();
      e.preventDefault();
    }
  }

  useEffect(() => {
    console.log(location);
    const searchParams = new URLSearchParams(location.search);

    const tutorial = searchParams.get("tutorial");
    if (tutorial && parseInt(tutorial)) {
      setTutorial(parseInt(tutorial));
    };
  }, [location]);

  useEffect(() => {
    if (!tutorial) return;

    document.addEventListener("click", handler, true);

    return () => {
      document.removeEventListener("click", handler);
    }
  }, [tutorial]);


  return (
    <div className={`${styles.Tutorial} ${tutorial ? styles.open : ''}`}>
      <div className={styles.hole} id="tutorialHole">
      </div>
      <div className={styles.text} id="tutorialText">
        
      </div>
      {/* <Swiper
        slidesPerView={1}
        loop={true}
        pagination={{
          clickable: true,
          dynamicBullets: true
        }}
        navigation={true}
        modules={[Pagination, Navigation]}
        className={styles.Swiper}
        onSnapIndexChange={(swiperCore) => {
          const { realIndex, snapIndex, activeIndex } = swiperCore;
        }}
        ref={swiperRef}
      >
        <SwiperSlide>
          <div className={styles.hole} style={{ right: '10rem', top: '10rem', height: '5rem', width: '15rem' }}>
          </div>
          <div className={styles.text} style={{ right: '2rem', top: '7rem' }}>
            Click this button to add plan!
          </div>
        </SwiperSlide>
        <SwiperSlide>
          <div className={styles.hole} style={{ right: '2rem', top: '1rem', height: '4rem', width: '6rem' }}>
          </div>
          <div className={styles.text} style={{ right: '2rem', top: '7rem' }}>
            Click this button to study!
          </div>
        </SwiperSlide>
      </Swiper> */}
    </div>
  )
}

export default Tutorial;