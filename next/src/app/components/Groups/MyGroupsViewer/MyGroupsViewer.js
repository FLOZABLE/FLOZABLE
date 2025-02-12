import React, { useRef, useState, useEffect, useCallback } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import styles from "./MyGroupsViewer.module.css";
import MyGroupContainer from "../MyGroupContainer/MyGroupContainer";
import { postGroupLeave } from "@/Api/groupsApi";
import { useDebounce } from "use-debounce";
import { socket } from "@/app/utils/socket";
import { mediaSocket } from "@/app/utils/mediaSocket";
import { ACTIVE_GROUP_DEBOUNCE } from "@/app/utils/Constant";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { MittInstance } from "@/app/utils/mittInstance";
import { useAccount } from "@/Hooks/accountHooks";
import { useGroups } from "@/Hooks/groupsHook";
import Link from "next/link";

function MyGroupsViewer({}) {
  const { myGroups, updateGroupsData } = useGroups();
  const { accountData, updateUserInfo } = useAccount();

  const [activeIndex, setActiveIndex] = useState(-1);

  const [debouncedIndex] = useDebounce(activeIndex, ACTIVE_GROUP_DEBOUNCE);

  const SwiperRef = useRef(null);
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const groupId = searchParams.get("group");

  const leaveGroup = useCallback(async (groupId) => {
    try {
      const response = await postGroupLeave(groupId);
      if (!response.success) return;

      updateUserInfo((prev) => ({
        ...prev,
        groups: prev.groups.filter((group) => group !== groupId),
      }));

      updateGroupsData((prev) => {
        const newGroups = [...prev];
        const groupIndex = newGroups.findIndex(
          (group) => group.group_id === groupId
        );
        if (groupIndex === -1) return prev;

        newGroups[groupIndex].members.filter(
          (member) => member !== accountData.user_id
        );
        return newGroups;
      });
    } catch (err) {
      console.log(err);
    }
  }, []);

  useEffect(() => {
    if (!debouncedIndex === -1) return;

    const group = myGroups[debouncedIndex];
    if (!group) return;

    localStorage.setItem("swiperGroupId", group.group_id);
    console.log("swiper set" ,group)
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
    const onMessage = ({ groupId }) => {
      const groupIndex = myGroups.findIndex(
        (group) => group.group_id === groupId
      );
      if (groupIndex === -1) return;
      localStorage.removeItem("swiperGroupId");
      SwiperRef.current.swiper.slideTo(groupIndex);
    };

    const swiperGroupId = localStorage.getItem("swiperGroupId");
    console.log("swiper", swiperGroupId);
    if (swiperGroupId) {
      setTimeout(() => {
        onMessage({ groupId: swiperGroupId });
      }, 500);
    }

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
        <h3>{"You haven't joined any groups yet!"}</h3>
        {pathname !== "/dashboard/groups" ? (
          <Link href={"/dashboard/groups"} className={styles.toGroups}>
            Click here to join groups!
          </Link>
        ) : null}
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
                isAdmin={group.leader === accountData?.user_id}
              />
            </SwiperSlide>
          );
        })}
      </Swiper>
    </div>
  );
}

export default MyGroupsViewer;
