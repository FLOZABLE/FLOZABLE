import React, { useEffect, useState } from "react";
import styles from "./SearchUsers.module.css";
import DmBtn from "@/app/components/Buttons/DmBtn/DmBtn";
import FriendRequestBtn from "@/app/components/Buttons/FriendRequestBtn/FriendRequestBtn";
import UserContainer from "../UserContainer/UserContainer";
import CircularLoading from "../../LoadingScreen/CircularLoading/CircularLoading";
import { useDebounce } from "use-debounce";
import { useGetFriendsSearch } from "@/Hooks/friendsHooks";

function SearchUsers({ searchQuery, onClick }) {
  const [debouncedQuery] = useDebounce(searchQuery, 500);

  const { data, isLoading } = useGetFriendsSearch(debouncedQuery);

  return (
    <div className={`customScroll ${styles.SearchUsers}`}>
      {data?.success && !isLoading && debouncedQuery === searchQuery ? (
        data.users.map((userInfo, i) => {
          return (
            <UserContainer
              key={i}
              onClick={() => {
                if (onClick) {
                  onClick(userInfo);
                }
              }}
              userInfo={userInfo}
            >
              <div>
                <DmBtn userInfo={userInfo} padding={"0.3125rem 0.625rem"} />
              </div>
              <div>
                <FriendRequestBtn
                  userInfo={userInfo}
                  padding={"0.3125rem 0.625rem"}
                />
              </div>
            </UserContainer>
          );
        })
      ) : (
        <div className={styles.loading}>
          <CircularLoading />
        </div>
      )}
    </div>
  );
}

export default SearchUsers;
