import React, { useRef, useState, useEffect, useCallback, useContext } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";
import styles from "./MyGroupsViewer.module.css";
import MyGroupContainer from "../MyGroupContainer/MyGroupContainer";
import { CallOptionsContext, GroupsContext, UserInfoContext } from "@/utils/Contexts";
import { socket } from "@/utils/socket";
import { mediaSocket } from "@/utils/mediaSocket";

function MyGroupsViewer({
  mode,
  groupsViewerRef,
  setIsEditGroupModal,
}) {
  const {myGroups} = useContext(GroupsContext);
  const {userInfo} = useContext(UserInfoContext);

  const {setIsCam, setIsMic} = useContext(CallOptionsContext);

  const [selectedGroupIndex, setSelectedGroupIndex] = useState(0);

  useEffect(() => {
    mediaSocket.connect();
  }, []);

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const selectedGroupId = searchParams.get("group");
    if (!selectedGroupId) {
      console.log('change')
      if (groupsViewerRef.current) {
        setTimeout(() => {
          console.log('change')
          groupsViewerRef.current.swiper.slideTo(myGroups.length - 1);
        }, 1000);
      };
      return;
    };

    setTimeout(() => {
      const groupIndex = myGroups.findIndex(group => group.group_id === selectedGroupId);
      if (groupsViewerRef.current && groupIndex !== -1) {
        groupsViewerRef.current.swiper.slideTo(groupIndex);
      };
    }, 1000);
  }, [myGroups, groupsViewerRef]);


  return (
    <div
      className={`${styles.MyGroupsViewer} ${mode === "study" ? styles.study : ""
        }`}
    >
      {myGroups.length ?
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
            const { realIndex } = swiperCore;
            setSelectedGroupIndex(realIndex);
            setIsCam(false);
            setIsMic(false);
          }}
          ref={groupsViewerRef}
        >
          {myGroups.map((group, i) => {
            const focus = i === selectedGroupIndex;
            if (focus) {
              setTimeout(() => {
                socket.emit("changeGroup", group.group_id);
                mediaSocket.emit("changeGroup", group.group_id);
              }, 500);
            }
            return (
              <SwiperSlide key={i} className={styles.groupsWrapper}>
                {focus ?
                  <MyGroupContainer
                    group={group}
                    setIsEditGroupModal={setIsEditGroupModal}
                    mode={mode}
                    isMine={group.leader === userInfo?.user_id}
                  /> : null
                }
              </SwiperSlide>
            )
          })}
        </Swiper>
        :
        <div className={styles.noGroup}>You haven't joined any groups yet!</div>
      }
    </div>
  );
}

export default MyGroupsViewer;