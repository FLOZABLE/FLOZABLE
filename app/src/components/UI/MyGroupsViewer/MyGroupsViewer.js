import React, { useRef, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { StudyPerson } from "../../../utils/svgs";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";
import styles from "./MyGroupsViewer.module.css";
import {
  faBullhorn,
  faComments,
  faGear,
  faRankingStar,
} from "@fortawesome/free-solid-svg-icons";
import MemberEl from "../MemberEl/MemberEl";
import MyEl from "../MyEl/MyEl";
import { mediaSocket } from "../../../mediaSocket";
import { Device } from "mediasoup-client";
import MyGroupContainer from "../MyGroupContainer/MyGroupContainer";

let device;
let rtpCapabilities;
let producerTransport;
let consumerTransports = [];

// https://mediasoup.org/documentation/v3/mediasoup-client/api/#ProducerOptions
// https://mediasoup.org/documentation/v3/mediasoup-client/api/#transport-produce
let params = {
  // mediasoup params
  encodings: [
    {
      rid: "r0",
      maxBitrate: 100000,
      scalabilityMode: "S1T3",
    },
    {
      rid: "r1",
      maxBitrate: 300000,
      scalabilityMode: "S1T3",
    },
    {
      rid: "r2",
      maxBitrate: 900000,
      scalabilityMode: "S1T3",
    },
  ],
  // https://mediasoup.org/documentation/v3/mediasoup-client/api/#ProducerCodecOptions
  codecOptions: {
    videoGoogleStartBitrate: 1000,
  },
};

let audioParams;
let videoParams = { params };
let consumingTransports = [];

function MyGroupsViewer({
  myGroups,
  socket,
  userInfo,
  myTimerTotal,
  isCam,
  isMic,
  mode,
}) {
  const [toggleTimer, setToggleTimer] = useState({ id: 0, status: 0 });
  const [groupStudying, setGroupStudying] = useState({});
  const [selectedGroupIndex, setSelectedGroupIndex] = useState(0);
  const [swiperEl, setSwiperEl] = useState([]);

  useEffect(() => {
    mediaSocket.connect();
    socket.on("studying", onStudying);
    socket.on("stopStudying", onStopStudying);
    return () => {
      socket.off("studying", onStudying);
      socket.off("stopStudying", onStopStudying);
    };
  }, []);

  /*   useEffect(() => {
      setGroupStudying(
        Object.fromEntries(
          myGroups.map((group) => {
            const members = [];
            group.members.map((member) => {
              if (member.study.study) {
                members.push(member.user_id);
              }
            });
            return [group.group_id, { members: members }];
          }),
        ),
      );
    }, [myGroups]); */

  const onStudying = (userId, groups) => {
    setToggleTimer({ id: userId, status: 1 });

    groups.forEach((group) => {
      setGroupStudying((prevGroupStudying) => {
        const updatedGroupStudying = { ...prevGroupStudying };

        if (
          updatedGroupStudying[group] &&
          !updatedGroupStudying[group].members.includes(userId)
        ) {
          updatedGroupStudying[group].members.push(userId);
        }
        return updatedGroupStudying;
      });
    });
  };

  const onStopStudying = (userId, groups) => {
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

  useEffect(() => {
    if (!myGroups.length) return;
    let selectedGroup;
    if (isNaN(selectedGroupIndex)) {
      selectedGroup = myGroups[0] ? myGroups[0] : false;
    } else if (myGroups[selectedGroupIndex]) {
      selectedGroup = myGroups[selectedGroupIndex];
    }

    setSwiperEl(myGroups.map((group, i) => {
      return (
        <SwiperSlide key={i}>
          <MyGroupContainer
            group={group}
            isFocus={i === selectedGroupIndex}
            studyingUsers={[]}
          />
        </SwiperSlide>
      )
    }))
  }, [selectedGroupIndex, myGroups]);

  return (
    <div
      className={`${styles.MyGroupsViewer} ${mode === "study" ? styles.study : ""
        }`}
    >
      {!myGroups.length ? (
        <div className={styles.noGroup}>You haven't join any groups yet!</div>
      ) : null}
      <Swiper
        slidesPerView={1}
        loop={true}
        pagination={{
          clickable: true,
        }}
        navigation={true}
        modules={[Pagination, Navigation]}
        className={styles.Swiper}
        initialSlide={0}
        onSlideChange={(swiperCore) => {
          const { realIndex } = swiperCore;
          setSelectedGroupIndex(realIndex);
        }}
      >
        {swiperEl}
      </Swiper>
    </div>
  );
}

export default MyGroupsViewer;