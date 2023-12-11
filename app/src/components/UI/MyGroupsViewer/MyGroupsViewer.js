import React, { useRef, useState, useEffect, useCallback } from "react";
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
  isCam,
  isMic,
  mode,
}) {
  const [selectedGroupIndex, setSelectedGroupIndex] = useState(0);
  const [swiperEl, setSwiperEl] = useState([]);
  const [localStream, setLocalStream] = useState(null);

  useEffect(() => {
    setSwiperEl(myGroups.map((group, i) => {
      return (
        <SwiperSlide key={i} className={styles.groupsWrapper}>
          <MyGroupContainer
            group={group}
            isFocus={i === selectedGroupIndex}
            studyingUsers={[]}
            userInfo={userInfo}
            socket={socket}
            localStream={localStream}
            isCam={isCam}
            isMic={isMic}
          />
        </SwiperSlide>
      )
    }));
  }, [myGroups, selectedGroupIndex, localStream, isMic, isCam]);

  return (
    <div
      className={`${styles.MyGroupsViewer} ${mode === "study" ? styles.study : ""
        }`}
    >
      {swiperEl.length ?
        <Swiper
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
            setSelectedGroupIndex(realIndex);
          }}
        >
          {swiperEl}
        </Swiper>
        :
        <div className={styles.noGroup}>You haven't join any groups yet!</div>
      }
    </div>
  );
}

export default MyGroupsViewer;