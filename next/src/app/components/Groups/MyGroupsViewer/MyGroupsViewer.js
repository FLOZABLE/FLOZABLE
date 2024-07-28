import React, { useRef, useState, useEffect, useCallback, useContext } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";
import styles from "./MyGroupsViewer.module.css";
import MyGroupContainer from "../MyGroupContainer/MyGroupContainer";
import { CallOptionsContext, GroupsContext, ResponseContext } from "@/app/utils/Contexts";
import { socket } from "@/app/utils/socket";
import { mediaSocket } from "@/app/utils/mediaSocket";
import config from "@/app/utils/config";
import { useAccount } from "@/Hooks/accountHooks";

function MyGroupsViewer({
  mode,
  groupsViewerRef,
  setIsEditGroupModal,
  setRightClickedMember
}) {
  const { myGroups, setMyGroups } = useContext(GroupsContext);
  const { userInfo } = useAccount();
  const { setResponse } = useContext(ResponseContext);

  const { setIsCam, setIsMic } = useContext(CallOptionsContext);

  const [selectedGroupIndex, setSelectedGroupIndex] = useState(0);

  useEffect(() => {
    mediaSocket.connect();
  }, []);

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const selectedGroupId = searchParams.get("group");
    if (!selectedGroupId) {
      if (groupsViewerRef.current) {
        setTimeout(() => {
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

  const leaveGroup = useCallback((group) => {
    fetch(`${config.server}/groups/leave`,
      {
        method: "POST",
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ groupId: group.group_id }),
        credentials: "include",
      }).then((response) => response.json())
      .then((data) => {
        if (data.success) {
          setResponse({ success: true, msg: "You left " + group.name })
        }
      })
    setMyGroups(myGroups.filter((g) => g.group_id !== group.group_id));
  }, [myGroups]);

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
                    leaveGroup={leaveGroup}
                    setIsEditGroupModal={setIsEditGroupModal}
                    mode={mode}
                    isMine={group.leader === userInfo?.user_id}
                    setRightClickedMember={setRightClickedMember}
                  /> : null
                }
              </SwiperSlide>
            )
          })}
        </Swiper>
        :
        <div className={styles.noGroup}>You haven&apos;t joined any groups yet!</div>
      }
    </div>
  );
}

export default MyGroupsViewer;