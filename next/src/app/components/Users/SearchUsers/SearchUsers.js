import React, { useEffect, useState } from "react";
import styles from "./SearchUsers.module.css";
import FriendRequestBtn from "@/app/components/Buttons/FriendRequestBtn/FriendRequestBtn";
import UserContainer from "../UserContainer/UserContainer";
import CircularLoading from "../../LoadingScreen/CircularLoading/CircularLoading";
import { useDebounce } from "use-debounce";
import { useFriendsSearch } from "@/Hooks/friendsHooks";
import ChatBtn from "../../Buttons/ChatBtn/ChatBtn";

function SearchUsers({ searchQuery, onClick }) {
  const [debouncedQuery] = useDebounce(searchQuery, 500);

  const { data, isLoading } = useFriendsSearch(debouncedQuery);

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
                <ChatBtn targetInfo={userInfo} padding={"0.3125rem 0.625rem"} />
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
