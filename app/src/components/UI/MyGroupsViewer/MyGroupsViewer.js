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
import SimplePeer from 'simple-peer';
import { faBullhorn, faBullseye, faComments, faGear, faHeart, faPeopleGroup, faRankingStar, faStopwatch } from "@fortawesome/free-solid-svg-icons";
import MemberEl from "../MemberEl/MemberEl";

function MyGroupsViewer(props) {

  const { myGroups, socket, userInfo, myTimerTotal, isCam, isMic, mode } = props;

  const [toggleTimer, setToggleTimer] = useState({ id: 0, status: 0 });
  const [groupStudying, setGroupStudying] = useState({});

  const [stream, setStream] = useState(null);

  useEffect(() => {
    if (isCam || isMic) {
      navigator.mediaDevices
        .getUserMedia({
          audio: isMic,
          video: isCam,
        })
        .then((stream) => {
          setStream(stream);
        });
    };
  }, [isCam, isMic]);

/*   useEffect(() => {
    const onNewPeer = (data) => {
      console.log("data:", data);
    };

    socket.on("newPeer", onNewPeer);

    return () => {
      socket.off("joinPeerGroup", onNewPeer);
    };
  }, []); */

  /* useEffect(() => {
    socket.emit("joinPeerGroup");
  }, []); */

  useEffect(() => {
    setGroupStudying(
      Object.fromEntries(myGroups.map((group) => {
        const members = [];
        group.members.map(member => {
          if (member.study.study) {
            members.push(member.user_id);
          };
        });
        return [group.group_id, { members: members }]
      }))
    );
  }, [myGroups]);

  useEffect(() => {
    console.log(socket)
    const handleStudying = (userId, groups) => {
      console.log(userId, groups)
      setToggleTimer({ id: userId, status: 1 });
      groups.forEach((group) => {
        setGroupStudying((prevGroupStudying) => {
          const updatedGroupStudying = { ...prevGroupStudying };
          if (updatedGroupStudying[group] && !updatedGroupStudying[group].members.includes(userId)) {
            updatedGroupStudying[group].members.push(userId);
          };
          return updatedGroupStudying;
        });
      });
    };

    const handleStopStudying = (userId, groups) => {
      setToggleTimer({ id: userId, status: 0 });
      groups.forEach((group) => {
        setGroupStudying((prevGroupStudying) => {
          const updatedGroupStudying = { ...prevGroupStudying };
          if (updatedGroupStudying[group]) {
            const index = updatedGroupStudying[group].members.indexOf(userId);
            if (index !== -1) {
              updatedGroupStudying[group].members.splice(index, 1);
            }
          }
          return updatedGroupStudying;
        });
      });
    };

    // Add event listeners
    socket.on("studying", handleStudying);
    socket.on("stopStudying", handleStopStudying);

    // Clean up the event listeners when the component unmounts
    return () => {
      socket.off("studying", handleStudying);
      socket.off("stopStudying", handleStopStudying);
    };
  }, [socket]);

  return (
    <div className={`${styles.MyGroupsViewer} ${mode === 'study' ? styles.study : ''}`}>
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
                        <p>{groupStudying[group.group_id] ? groupStudying[group.group_id].members.length : 0}/{group.members.length}</p>
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
                        return (<MemberEl memberInfo={memberInfo} key={j} k={j} toggleTimer={toggleTimer} myTimerTotal={myTimerTotal} me={memberInfo.user_id === userInfo.user_id} stream={stream} socket={socket} />)
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