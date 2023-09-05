import React, { useEffect, useState } from "react";
import styles from "./PlanTimelineBar.module.css";
import { Swiper, SwiperSlide } from 'swiper/react';
import { FreeMode, Pagination, Autoplay } from 'swiper/modules';

import 'swiper/css';
import 'swiper/css/free-mode';
import 'swiper/css/pagination';

function PlanTimelineBar(props) {
  const [swiperIndex, setSwiperIndex] = useState(0);
  const [slide0, setSlide0] = useState([]);
  const [slide1, setSlide1] = useState([]);
  const [slide2, setSlide2] = useState([]);
  const [slide3, setSlide3] = useState([]);
  const [dispTime, setDispTime] = useState(null);
  const [now, setNow] = useState(new Date());
  const [defaultMin, setDefaultMint] = useState(new Date().getMinutes());
  const [plans, setPlans] = useState([]);

  //set default
  useEffect(() => {
    const now = new Date();
    setDispTime(`${now.getHours()}:${now.getMinutes().toString().padStart(2, '0')}`);
    const hr = now.getHours() % 12;
    setSlide0(
      <p className={styles.hour}>{hr - 1}</p>
    );
    setSlide1(
      <p className={styles.hour}>{hr}</p>
    );
    setSlide2(
      <p className={styles.hour}>{hr + 1}</p>
    );
    setSlide3(
      <p className={styles.hour}>{hr + 2}</p>
    );
    const intervalId = setInterval(() => {
      setNow(new Date());
    }, 1000 * 10);

    return (() => {
      clearInterval(intervalId);
    });
  }, []);

  useEffect(() => {
    const now  = new Date();
    console.log(now)
    setDispTime(`${now.getHours() % 12}:${now.getMinutes().toString().padStart(2, '0')}`);
  }, [now.getMinutes()]);

  useEffect(() => {
    console.log(swiperIndex);
    const now = new Date();
    const hr = now.getHours() % 12;
    const updateIndex = (swiperIndex + 1) % 4;
    if (updateIndex == 0) {
      setSlide0(
        <p className={styles.hour}>{hr}</p>
      )
    }
  }, [swiperIndex]);

  const rootStyle = {
    /* '--percentage': `${(props.volume * 100) / 100}%`, // Update '--percentage' variable
    '--mouse-x': `${mousePosition.x}px`, */
    '--left': `-${defaultMin / 60 * 100 / 2}%`,
  };

  return (
    <div className={styles.PlanTimelineBar} style={rootStyle}>
      <Swiper
        onRealIndexChange={(swiper) => setSwiperIndex(swiper.realIndex)}
        slidesPerView={2}
        freeMode={true}
        simulateTouch={false}
        /* pagination={{
          clickable: true,
        }} */
        loop={true}
        speed={1000 * 60 * 60}
        autoplay={{
          delay: 0,
          disableOnInteraction: false,

        }}
        modules={[FreeMode, Autoplay]}
        className={styles.timelineWrapper}
      >
        <SwiperSlide>
          <div className={styles.inner}>
            {slide0}
          </div>
        </SwiperSlide>
        <SwiperSlide>
          <div className={styles.inner}>
          {slide1}
          </div>
        </SwiperSlide>
        <SwiperSlide>
          <div className={styles.inner}>
          {slide2}
          </div>
        </SwiperSlide>
        <SwiperSlide>
          <div className={styles.inner}>
          {slide3}
          </div>
        </SwiperSlide>
      </Swiper>
      <div className={styles.now}></div>
      <div className={styles.timeDisp}>
      {dispTime}
      </div>
    </div>
  );
};

export default PlanTimelineBar;
