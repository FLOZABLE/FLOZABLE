import React, { useEffect, useState } from "react";
import styles from "./RecommendChallenges.module.css";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import ChallengeContainer from "../ChallengeContainer/ChallengeContainer";

function RecommendChallenges() {
  const [challenges, setChallenges] = useState([]);

  useEffect(() => {

  }, []);
  return (
    <div className={styles.RecommendChallenges}>
      <Swiper
        modules={[Navigation, Autoplay]}
        navigation={true}
        spaceBetween={30}
        slidesPerView={3}
        autoplay={{ delay: 1300, disableOnInteraction: true, reverseDirection: true }}
        speed={2000}
        loop={true}
        className={styles.Swiper}>
        <SwiperSlide className={styles.Slide}>
          <ChallengeContainer showRecord={true}/>
        </SwiperSlide>
        <SwiperSlide className={styles.Slide}>
          <ChallengeContainer showRecord={true} />
        </SwiperSlide>
        <SwiperSlide className={styles.Slide}>
          <ChallengeContainer showRecord={true} />
        </SwiperSlide>
        <SwiperSlide className={styles.Slide}>
          <ChallengeContainer showRecord={true} />
        </SwiperSlide>
        <SwiperSlide className={styles.Slide}>
          <ChallengeContainer showRecord={true} />
        </SwiperSlide>
      </Swiper>
{/*       {challenges.length ?
        <Swiper
          modules={[Pagination, Navigation, Autoplay]}
          navigation={true}
          spaceBetween={30}
          pagination={{ clickable: true }}
          slidesPerView={3}
          autoplay={{ delay: 1300, disableOnInteraction: false }}
          speed={500}
          loop={true}
          className={styles.Swiper}>
          {challenges.map((theme, i) => {
            return (
              <SwiperSlide className={styles.Slide} key={i}>
              </SwiperSlide>
            )
          })}
        </Swiper>
        : null
      } */}
    </div>
  )
};

export default RecommendChallenges;