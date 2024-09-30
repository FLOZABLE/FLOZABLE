import React, {
  useRef,
  useState,
  useEffect,
  useCallback,
  useContext,
} from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";
import styles from "./MyGroupsViewer.module.css";
import {
  GroupsContext,
  ResponseContext,
  UserInfoContext,
} from "@/app/utils/Contexts";
import MyGroupContainer from "../MyGroupContainer/MyGroupContainer";
import { postGroupLeave } from "@/Api/groupsApi";
import { useDebounce } from "use-debounce";
import { socket } from "@/app/utils/socket";
import { mediaSocket } from "@/app/utils/mediaSocket";
import AccountWall from "../../Others/AccountWall/AccountWall";

function MyGroupsViewer({}) {
  const { myGroups, setMyGroups } = useContext(GroupsContext);
  const { response, setResponse } = useContext(ResponseContext);
  const { userInfo } = useContext(UserInfoContext);

  const [activeIndex, setActiveIndex] = useState(-1);

  const [debouncedIndex] = useDebounce(activeIndex, 3000);

  const SwiperRef = useRef(null);

  const leaveGroup = useCallback((groupId) => {
    (async () => {
      const data = await postGroupLeave(groupId);
      setResponse(data);
      if (data.success) {
        setMyGroups((prev) =>
          prev.filter((group) => group.group_id !== groupId)
        );
      }
    })();
  }, []);

  useEffect(() => {
    if (!debouncedIndex === -1) return;

    const group = myGroups[debouncedIndex];
    if (!group) return;

    socket.emit("changeGroup", group.group_id);
    mediaSocket.emit("changeGroup", group.group_id);
  }, [debouncedIndex, myGroups.length]);

  useEffect(() => {
    if (response?.action?.code !== 1 || !SwiperRef?.current) return;

    SwiperRef.current.swiper.slideTo(myGroups.length - 1);
    setTimeout(() => {
      setResponse(null);
    }, 100);
  }, [response, SwiperRef, myGroups.length]);

  if (!myGroups.length) {
    return (
      <div className={styles.noGroups}>
        {"You haven't joined any groups yet!"}
      </div>
    );
  }

  return (
    <div className={styles.MyGroupsViewer}>
      <Swiper
        slidesPerView={1}
        loop={true}
        pagination={{
          clickable: true,
          dynamicBullets: true,
        }}
        navigation={true}
        modules={[Pagination, Navigation]}
        onSnapIndexChange={(swiperCore) => {
          const { realIndex } = swiperCore;
          setActiveIndex(realIndex);
        }}
        className={styles.Swiper}
        ref={SwiperRef}
      >
        {myGroups.map((group, i) => {
          return (
            <SwiperSlide key={i}>
              <MyGroupContainer
                group={group}
                isActive={activeIndex === i}
                leaveGroup={leaveGroup}
                isAdmin={group.leader === userInfo?.user_id}
              />
            </SwiperSlide>
          );
        })}
      </Swiper>
    </div>
  );
}

export default MyGroupsViewer;
