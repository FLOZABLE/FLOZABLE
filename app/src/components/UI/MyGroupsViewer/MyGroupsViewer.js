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
import MemberEl from "../MemberEl/MemberEl";

function MyGroupsViewer(props) {

  const { myGroups, setMyGroups, socket, userInfo, subjects, myTimerTotal } = props;

  const [toggleTimer, setToggleTimer] = useState({ id: 0, status: 0 });

  useEffect(() => {
    socket.on("studying", (userId) => {
      setToggleTimer({ id: userId, status: 1 });
      console.log('myGroups',myGroups);
    });

    socket.on("stopStudying", (userId) => {
      setToggleTimer({ id: userId, status: 0 });
    });

    socket.on("groupOnlineMembers", (group, users) => {
    })
  }, []);

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
        {myGroups.map((group, i) => {
          let membersEl = [];
          let studyingMembers = 0;

          if (group.members) {
            membersEl = group.members.map((memberInfo, j) => {
              if (memberInfo.study.study) {
                studyingMembers ++;
              };
              return (
                <MemberEl memberInfo={memberInfo} key={j} k={j} toggleTimer={toggleTimer} />
              );
            });
          };
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
                        <p>{studyingMembers}/{group.members.length}</p>
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
                      {group.members.map((memberInfo, j) => {
                        return (<MemberEl memberInfo={memberInfo} key={j} k={j} toggleTimer={toggleTimer} myTimerTotal={myTimerTotal} me={memberInfo.user_id === userInfo.user_id} />)
                      })}
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
          );
        })}
      </Swiper>
    </div>
  );
};

export default MyGroupsViewer;