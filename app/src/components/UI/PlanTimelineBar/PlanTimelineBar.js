import React, { useEffect, useState } from "react";
import styles from "./PlanTimelineBar.module.css";
import { Swiper, SwiperSlide } from 'swiper/react';
import { FreeMode, Pagination, Autoplay } from 'swiper/modules';

import 'swiper/css';
import 'swiper/css/free-mode';
import 'swiper/css/pagination';

function PlanTimelineBar(props) {
  const { events, subjects } = props;

  const [swiperIndex, setSwiperIndex] = useState(0);
  const [slide0, setSlide0] = useState([]);
  const [slide1, setSlide1] = useState([]);
  const [slide2, setSlide2] = useState([]);
  const [slide3, setSlide3] = useState([]);
  const [slides, setSlides] = useState([]);
  const [dispTime, setDispTime] = useState(null);
  const [now, setNow] = useState(new Date());
  const [defaultMin, setDefaultMint] = useState(new Date().getMinutes());


  const [slide0Events, setSlide0Events] = useState([]);
  const [slide1Events, setSlide1Events] = useState([]);
  const [slide2Events, setSlide2Events] = useState([]);
  const [slide3Events, setSlide3Events] = useState([]);


  //set default
  useEffect(() => {
    const now = new Date();
    const todayStart = new Date().setHours(0, 0, 0, 0);
    const todayEnd = new Date().setHours(23, 59, 59, 999);
    setDispTime(`${now.getHours() % 12 ? now.getHours() % 12 : 12}:${now.getMinutes().toString().padStart(2, '0')}`);
    const hr = now.getHours();
    const slidesEl = [];
    const todayEvents = events.filter(event => {
      return (todayStart <= event.start.getTime() && todayEnd >= event.start.getTime())
    });
    console.log('today',todayEvents)
    for (let i = 0; i < 24; i++) {
      const hour = hr + i - 1;

      slidesEl.push(
        <SwiperSlide key={i}>
          <div className={styles.inner}>
            <p className={styles.hour}>{hour % 12 ? hour % 12 : 12}</p>
            <div className={styles.events}>
              {
                todayEvents.map((event) => {
                  if (event.start.getHours() === hour % 24) {
                    let subject = subjects.find(subject => {return subject.id === event.subject});
                    if (!subject) {
                      subject = {
                        color: '#fff'
                      };
                    };
                    const width = (event.end.getTime() - event.start.getTime()) / 36000;
                    const left = event.start.getMinutes() / 6 * 10 + '%';
                    const startHr = event.start.getHours() % 12 ? event.start.getHours() % 12 : 12;
                    const endHr = event.end.getHours() % 12 ? event.end.getHours() % 12 : 12;
                    const startDisp = `${startHr}:${event.start.getMinutes().toString().padStart(2, '0')} - ${endHr}:${event.end.getMinutes().toString().padStart(2, '0')}`
                    
                    if (width > 5) {
                      return (
                        <div className={styles.eventWrapper} key={i * Math.random()} style={{backgroundColor: subject.color, width: width + '%', left: left}} >
                          <p>{event.title}</p>
                          <p>{startDisp}</p>
                        </div>
                      )
                    } else {
                      return (
                        <div className={styles.eventWrapper} key={i * Math.random()} style={{backgroundColor: subject.color, width: '1%', left: left}} >
                        </div>
                      )
                    }
                  }
                })
              }
            </div>
          </div>
          <div className={styles.border}></div>
        </SwiperSlide>
      );
    };

    setSlides(slidesEl);
    const intervalId = setInterval(() => {
      setNow(new Date());
    }, 1000 * 10);

    return (() => {
      clearInterval(intervalId);
    });
  }, [events]);

  useEffect(() => {
    const now = new Date();
    setDispTime(`${now.getHours() % 12 ? now.getHours() % 12 : 12}:${now.getMinutes().toString().padStart(2, '0')}`);
  }, [now.getMinutes()]);

  /* useEffect(() => {
    const now = new Date();
    const hr = now.getHours() % 12;
    const updateIndex = (swiperIndex + 1) % 4;
    if (updateIndex == 0) {
      setSlide0(
        <p className={styles.hour}>{hr}</p>
      )
    };
    console.log(swiperIndex);
    const startIndex = swiperIndex % 4;

  }, [swiperIndex, events]); */

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
        {/* <SwiperSlide>
          {slide0}
        </SwiperSlide>
        <SwiperSlide>
          {slide1}
        </SwiperSlide>
        <SwiperSlide>
          {slide2}
        </SwiperSlide>
        <SwiperSlide>
          {slide3}
        </SwiperSlide> */}
        {slides}
      </Swiper>
      <div className={styles.now}></div>
      <div className={styles.timeDisp}>
        {dispTime}
      </div>
    </div>
  );
};

export default PlanTimelineBar;
