import React, { useRef, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Scrollbar, A11y } from 'swiper/modules';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { StudyPerson, RestPerson } from "../../../utils/svgs";
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import styles from "./MyGroupsViewer.module.css";
import MemberTimer from "../MemberTimer/MemberTimer";
import { faBullhorn, faBullseye, faComments, faGear, faHeart, faPeopleGroup, faRankingStar, faStopwatch } from "@fortawesome/free-solid-svg-icons";

function MyGroupsViewer(props) {
  const groupsEl = props.myGroups.map((group, i) => {
    const membersEl = group.members.map((memberInfo, i) => {
      const studyInfo = memberInfo.study;
      let sec = 0;
      let run = false;
      let studyIcon = <RestPerson width={'40px'} height={'40px'} opt1={'#000'} />
      if (studyInfo.study) {
        studyIcon = <StudyPerson opt1={'#000'} width={'40px'} height={'40px'} />
        run = true;
        sec = studyInfo.total;
      };
      if (new Date(studyInfo.point * 1000) == new Date()) {
        sec = studyInfo.total;
      };
      return (
        <div className={styles.member} key={i} >
          <div className={styles.userName}>{memberInfo.name}</div>
          <div className={styles.icon}>
            {studyIcon}
          </div>
          <div className={styles.timer}>
            <MemberTimer run={run} sec={sec} />
          </div>
        </div>
      )
    });

    return (
      <SwiperSlide className={styles.slide} key={i}>
        <div className={styles.inner}>
          <div className={styles.name}>
            <Link>
              {group.name}
            </Link>
          </div>
          <div className={styles.information}>
            <div className={styles.header}>
              <ul className={styles.status}>
                <li>
                  <StudyPerson opt1={'#fff'} opt2={'#fff'} width={'40px'} height={'40px'} />
                  <p>5/12</p>
                </li>
                <li>
                  <FontAwesomeIcon icon={faBullhorn} />
                </li>
                <li>
                  <FontAwesomeIcon icon={faRankingStar} />
                </li>
              </ul>
              <div className={styles.right}>
                <FontAwesomeIcon icon={faGear} />
              </div>
            </div>
            <div className={styles.membersContainer}>
              <div className={`${styles.members} customScroll`}>
                {membersEl}
              </div>
            </div>
          </div>
          <div className={styles.buttons}>
            <button>Go to Group</button>
            <button>
              <FontAwesomeIcon icon={faComments} />
            </button>
          </div>
        </div>
      </SwiperSlide>
    )
  })
  return (
    <div className={`${styles.MyGroupsViewer} ${props.mode === 'study' ? styles.study : ''}`}>
      <Swiper
        slidesPerView={1}
        loop={true}
        pagination={{
          clickable: true,
        }}
        navigation={true}
        modules={[Pagination, Navigation]}
        className={styles.Swiper}
      >
        {groupsEl}
      </Swiper>
    </div>
  );
};

export default MyGroupsViewer;