import React, { useRef, useState, useEffect, useCallback } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";
import styles from "./MyGroupsViewer.module.css";
import { mediaSocket } from "../../../mediaSocket";
import MyGroupContainer from "../MyGroupContainer/MyGroupContainer";
import GroupRankingModal from "../GroupRankingModal/GroupRankingModal";

function MyGroupsViewer({
  myGroups,
  userInfo,
  isCam,
  isMic,
  mode,
  setIsChatModal
}) {
  const [selectedGroupIndex, setSelectedGroupIndex] = useState(0);
  const [swiperEl, setSwiperEl] = useState([]);
  const [localStream, setLocalStream] = useState(null);
  const [isGroupRankingModal, setIsGroupRankingModal] = useState(false);

  useEffect(() => {
    /* mediaSocket.connect(); */
  }, []);

  useEffect(() => {
    setSwiperEl(myGroups.map((group, i) => {
      return (
        <SwiperSlide key={i} className={styles.groupsWrapper}>
          <MyGroupContainer
            group={group}
            isFocus={i === selectedGroupIndex}
            studyingUsers={[]}
            userInfo={userInfo}
            localStream={localStream}
            isCam={isCam}
            isMic={isMic}
            setIsChatModal={setIsChatModal}
            setIsGroupRankingModal={setIsGroupRankingModal}
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
      <GroupRankingModal
        isOpen={isGroupRankingModal}
        setIsOpen={setIsGroupRankingModal}
        members={myGroups[selectedGroupIndex]?.members}
      />
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