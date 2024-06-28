"use client";

import React, { useContext, useEffect, useState } from "react";
import styles from "./RecommendedFriendsViewer.module.css";
import Link from "next/link";
import { ResponseContext, UserInfoContext } from "@/app/utils/Contexts";
import config from "@/app/utils/config";
import RefreshBtn from "../../Buttons/RefreshBtn/RefreshBtn";
import ProfileImage from "../../Users/ProfileImage/ProfileImage";
import CountryViewer from "../../Others/CountryViewer/CountryViewer";
import FriendRequestBtn from "../../Buttons/FriendRequestBtn/FriendRequestBtn";
import { useQuery } from "@tanstack/react-query";
import { getRecommendedFriends } from "@/Api/friendsApi";
import CircularLoading from "../../LoadingScreen/CircularLoading/CircularLoading";
import UserContainer from "../../Users/UserContainer/UserContainer";
import { useRouter } from "next/navigation";

function RecommendedFriendsViewer({}) {
  const { userInfo } = useContext(UserInfoContext);

  const { setResponse } = useContext(ResponseContext);
  const [refresh, setRefresh] = useState(true);
  const {
    data: recommendedFriends,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["recommendedFriends"],
    queryFn: getRecommendedFriends,
    staleTime: 3000,
  });

  const router = useRouter();

  useEffect(() => {
    if (!userInfo || !refresh) return;
    refetch();
    console.log("refetch", refresh, userInfo);
  }, [userInfo, refresh]);

  return (
    <div className={`Box ${styles.RecommendedFriendsViewer}`}>
      <div className={`header`}>
        <h3>Recommended Friends</h3>
        <RefreshBtn refresh={refresh} setRefresh={setRefresh} />
      </div>
      <div className={`contents customScroll`}>
        {isLoading ? (
          <CircularLoading />
        ) : (
          recommendedFriends.users.map((user, i) => {
            return (
              <UserContainer
                key={i}
                userInfo={user}
                onClick={() => {
                  router.replace(`/dashboard/user/${friend.user_id}`);
                }}
              >
                <FriendRequestBtn
                  userInfo={user}
                  setResponse={setResponse}
                  padding={"0.1875rem 0.313rem"}
                />
              </UserContainer>
            );
          })
        )}
      </div>
    </div>
  );
}

export default RecommendedFriendsViewer;
