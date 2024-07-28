"use client";

import React, { useContext, useEffect, useState } from "react";
import styles from "./RecommendedFriendsViewer.module.css";
import { ResponseContext } from "@/app/utils/Contexts";
import RefreshBtn from "../../Buttons/RefreshBtn/RefreshBtn";
import FriendRequestBtn from "../../Buttons/FriendRequestBtn/FriendRequestBtn";
import CircularLoading from "../../LoadingScreen/CircularLoading/CircularLoading";
import UserContainer from "../../Users/UserContainer/UserContainer";
import { useRouter } from "next/navigation";
import { useFriendsRecommended } from "@/Hooks/friendsHooks";

function RecommendedFriendsViewer({}) {
  const { setResponse } = useContext(ResponseContext);
  const [refresh, setRefresh] = useState(true);
  const { data: recommendedFriends, isLoading } =
    useFriendsRecommended(refresh);

  const router = useRouter();

  useEffect(() => {
    setRefresh(false);
  }, []);

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
          recommendedFriends?.users.map((user, i) => {
            return (
              <div className={styles.user} key={i}>
                <UserContainer
                  userInfo={user}
                  onClick={() => {
                    router.push(`/dashboard/user/${friend.user_id}`);
                  }}
                >
                  <FriendRequestBtn
                    userInfo={user}
                    setResponse={setResponse}
                    padding={"0.1875rem 0.313rem"}
                  />
                </UserContainer>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

export default RecommendedFriendsViewer;
