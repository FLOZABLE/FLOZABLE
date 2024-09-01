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

function MyGroupsViewer({}) {
  const { myGroups, setMyGroups } = useContext(GroupsContext);
  const { setResponse } = useContext(ResponseContext);
  const { userInfo } = useContext(UserInfoContext);

  const [activeIndex, setActiveIndex] = useState(-1);

  const leaveGroup = useCallback((groupId) => {
    (async () => {
      const data = await postGroupLeave(groupId);
      setResponse(data);
      if (data.success) {
        setMyGroups((prev) => prev.filter(prev.group_id !== groupId));
      }
    })();
  }, []);

  if (!myGroups.length) {
    return null;
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
