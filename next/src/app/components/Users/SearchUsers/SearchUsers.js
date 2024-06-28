import React, { useEffect, useState } from "react";
import styles from "./SearchUsers.module.css";
import config from "@/app/utils/config";
import Link from "next/link";
import DmBtn from "@/app/components/Buttons/DmBtn/DmBtn";
import FriendRequestBtn from "@/app/components/Buttons/FriendRequestBtn/FriendRequestBtn";
import CountryViewer from "@/app/components/Others/CountryViewer/CountryViewer";
import ProfileImage from "../ProfileImage/ProfileImage";
import UserContainer from "../UserContainer/UserContainer";

function SearchUsers({ searchQuery, search, setSearch, onClick = () => {} }) {
  const [users, setUsers] = useState([]);

  const fetchServer = () => {
    fetch(`${config.server}/friend/search?query=${searchQuery}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          setUsers(data.users);
        }
      })
      .catch((error) => console.error(error));
  };

  const [searchCountdown, setSearchCountdown] = useState(null);

  useEffect(() => {
    if (searchCountdown) {
      clearTimeout(searchCountdown);
    }
    setSearchCountdown(setTimeout(fetchServer, 1000));
  }, [searchQuery]);

  useEffect(() => {
    if (!search) return;

    fetchServer();
    setSearch(false);
  }, [search]);

  return (
    <div className={`customScroll ${styles.SearchUsers}`}>
      {users.map((userInfo, i) => {
        return (
          <UserContainer
            key={i}
            onClick={() => {
              onClick(userInfo);
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
      })}
    </div>
  );
}

export default SearchUsers;
