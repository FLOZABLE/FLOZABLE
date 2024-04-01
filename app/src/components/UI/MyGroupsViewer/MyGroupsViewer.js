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
import { socket } from "../../../socket";

const serverOrigin = process.env.REACT_APP_ORIGIN;

function MyGroupsViewer({
  myGroups,
  setMyGroups,
  setResponse,
  userInfo,
  isCam,
  isMic,
  setIsCam = () => { },
  setIsMic = () => { },
  mode,
  setIsChatModal,
  groupsViewerRef,
  setIsEditGroupModal,
  setRightClickedMember,
  isHeadphone
}) {
  const [selectedGroupIndex, setSelectedGroupIndex] = useState(0);
  const [swiperEl, setSwiperEl] = useState([]);
  const [localStream, setLocalStream] = useState(null);
  const [isGroupRankingModal, setIsGroupRankingModal] = useState(false);

  useEffect(() => {
    mediaSocket.connect();
  }, []);

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const selectedGroupId = searchParams.get("group");
    if (!selectedGroupId) return;

    setTimeout(() => {
      const groupIndex = myGroups.findIndex(group => group.group_id === selectedGroupId);
      if (groupsViewerRef.current && groupIndex !== -1) {
        groupsViewerRef.current.swiper.slideTo(groupIndex);
      };
    }, 2000);
  }, [myGroups, groupsViewerRef]);

  const leaveGroup = useCallback((group) => {
    console.log("Leaving ", group);
    fetch(`${serverOrigin}/groups/leave-group`,
      {
        method: "POST",
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ groupId: group.group_id })
      }).then((response) => response.json())
      .then((data) => {
        console.log(data);
        if (data.success) {
          setResponse({ success: true, msg: "You left " + group.name })
        }
      })
    setMyGroups(myGroups.filter((g) => g.group_id !== group.group_id));
  }, [myGroups]);

  useEffect(() => {
    if (!myGroups || !userInfo) return;
    console.log(myGroups);

    const memberJoinGroup = (groupId, memberInfo) => {
      setMyGroups(myGroups.map((group) => {
        if (group.group_id !== groupId) return group;
        return { ...group, members: group.members + "," + memberInfo.user_id };
      }));
    };

    const memberLeaveGroup = (groupId, memberId) => {
      if (memberId === userInfo.user_id) {
        setMyGroups(myGroups.filter((group) => group.group_id != groupId));
      }
      else {
        setMyGroups(myGroups.map((group) => {
          if (group.group_id !== groupId) return group;
          return { ...group, members: group.members.split(",").splice(memberId, 1).join(",") };
        }));
      }
    };

    const handleLeaderChange = (groupId, memberId) => {
      setMyGroups(myGroups.map((group) => {
        if (group.group_id !== groupId) return group;
        return { ...group, leader: memberId };
      }));
    };

    socket.on(`newMemberInfo`, memberJoinGroup);
    socket.on(`removeMember`, memberLeaveGroup);
    socket.on('leaderChange', handleLeaderChange);
    return () => {
      socket.off("newMemberInfo", memberJoinGroup);
      socket.off(`removeMember`, memberLeaveGroup);
      socket.off('leaderChange', handleLeaderChange);
    };
  }, [myGroups, userInfo]);

  useEffect(() => {
    setSwiperEl(myGroups.map((group, i) => {
      const focus = i === selectedGroupIndex;
      return (
        <SwiperSlide key={i} className={styles.groupsWrapper}>
          {focus ?
            <MyGroupContainer
              group={group}
              leaveGroup={() => leaveGroup(group)}
              isFocus={true}
              studyingUsers={[]}
              userInfo={userInfo}
              isCam={isCam}
              isMic={isMic}
              setIsChatModal={setIsChatModal}
              setIsGroupRankingModal={setIsGroupRankingModal}
              setIsEditGroupModal={setIsEditGroupModal}
              mode={mode}
              isHeadphone={isHeadphone}
              setRightClickedMember={setRightClickedMember}
            /> : null
          }
        </SwiperSlide>
      )
    }));
  }, [myGroups, selectedGroupIndex, isMic, isCam, mode, isHeadphone]);

  return (
    <div
      className={`${styles.MyGroupsViewer} ${mode === "study" ? styles.study : ""
        }`}
    >
      {/* <GroupRankingModal
        isOpen={isGroupRankingModal}
        setIsOpen={setIsGroupRankingModal}
        members={myGroups[selectedGroupIndex]?.members}
      /> */}
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
            setIsCam(false);
            setIsMic(false);
          }}
          ref={groupsViewerRef}
        >
          {swiperEl}
        </Swiper>
        :
        <div className={styles.noGroup}>You haven't joined any groups yet!</div>
      }
    </div>
  );
}

export default MyGroupsViewer;