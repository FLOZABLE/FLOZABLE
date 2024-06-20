import React, { useEffect, useState } from "react";
import styles from "./SearchUsers.module.css";
import config from "@/app/utils/config";
import Link from "next/link";
import DmBtn from "@/app/components/Buttons/DmBtn/DmBtn";
import FriendRequestBtn from "@/app/components/Buttons/FriendRequestBtn/FriendRequestBtn";
import CountryViewer from "@/app/components/Others/CountryViewer/CountryViewer";
import ProfileImage from "../ProfileImage/ProfileImage";

function SearchUsers({ searchQuery, setCount, search, setSearch }) {
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
          setCount(data.users.length);
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
    <div className={styles.SearchUsers}>
      {users.map((user, i) => {
        const { user_id, name, timezone } = user;
        return (
          <div className={styles.user} key={i}>
            <Link
              className={styles.userInfo}
              href={`/dashboard/user/${user_id}`}
            >
              <ProfileImage userId={user_id} />
              <div className={`${styles.name} overflowDot`}>{name}</div>
              <div className={styles.flagWrapper}>
                <CountryViewer timezone={timezone} />
              </div>
            </Link>
            <div className={styles.buttons}>
              <div>
                <DmBtn userInfo={user} padding={"0.3125rem 0.625rem"} />
              </div>
              <div>
                <FriendRequestBtn
                  userInfo={user}
                  padding={"0.3125rem 0.625rem"}
                />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default SearchUsers;
