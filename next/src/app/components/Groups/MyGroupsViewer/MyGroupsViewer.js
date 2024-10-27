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
import { GroupsContext, UserInfoContext } from "@/app/utils/Contexts";
import MyGroupContainer from "../MyGroupContainer/MyGroupContainer";
import { postGroupLeave } from "@/Api/groupsApi";
import { useDebounce } from "use-debounce";
import { socket } from "@/app/utils/socket";
import { mediaSocket } from "@/app/utils/mediaSocket";
import { ACTIVE_GROUP_DEBOUNCE } from "@/app/utils/Constant";
import { useRouter, useSearchParams } from "next/navigation";
import { MittInstance } from "@/app/utils/mittInstance";

function MyGroupsViewer({}) {
  const { myGroups, setMyGroups } = useContext(GroupsContext);
  const { userInfo } = useContext(UserInfoContext);

  const [activeIndex, setActiveIndex] = useState(-1);

  const [debouncedIndex] = useDebounce(activeIndex, ACTIVE_GROUP_DEBOUNCE);

  const SwiperRef = useRef(null);
  const searchParams = useSearchParams();
  const router = useRouter();

  const groupId = searchParams.get("group");

  const leaveGroup = useCallback((groupId) => {
    (async () => {
      const response = await postGroupLeave(groupId);
      if (!response.success) return;

      setMyGroups((prev) => prev.filter((group) => group.group_id !== groupId));
    })();
  }, []);

  useEffect(() => {
    if (!debouncedIndex === -1) return;

    const group = myGroups[debouncedIndex];
    if (!group) return;

    //only in study page
    //if (!window.location.href.includes("study")) return;

    socket.emit("changeGroup", group.group_id);
    mediaSocket.emit("changeGroup", group.group_id);

    return () => {
      socket.emit("changeGroup", null);
      mediaSocket.emit("changeGroup", null);
    };
  }, [debouncedIndex, myGroups.length]);

  useEffect(() => {
    const onMessage = () => {
      SwiperRef.current.swiper.slideTo(myGroups.length - 1);
    };
    MittInstance.on("moveMyGroupsViewer", onMessage);
    return () => {
      MittInstance.off("moveMyGroupsViewer", onMessage);
    };
  }, [myGroups.length]);

  useEffect(() => {
    if (!groupId) return;

    const groupIndex = myGroups.findIndex(
      (group) => group.group_id === groupId
    );
    if (groupIndex === -1) return;

    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.delete("group");
    router.replace(
      `${document.location.pathname}?${newSearchParams.toString()}`,
      {
        scroll: false,
      }
    );

    SwiperRef.current.swiper.slideTo(groupIndex);
  }, [groupId, myGroups]);

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
                isActive={debouncedIndex === i}
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
