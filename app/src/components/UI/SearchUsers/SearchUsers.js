import React, { useEffect, useState } from "react";
import styles from "./SearchUsers.module.css";
import { Link } from "react-router-dom";
import MemberTimer from "../MemberTimer/MemberTimer";
import ChallengeBtn from "../ChallengeBtn/ChallengeBtn";
import DmBtn from "../DmBtn/DmBtn";
import CountryViewer from "../CountryViewer/CountryViewer";
import FriendRequestBtn from "../FriendRequestBtn/FriendRequestBtn";

const serverOrigin = process.env.REACT_APP_ORIGIN;

function SearchUsers({ searchQuery, setResponse, setCount, search, setSearch }) {
  const [lastUpd, setLastUpd] = useState(false);
  const [users, setUsers] = useState([]);

  const fetchServer = () => {
    fetch(`${serverOrigin}/friend/search?query=${searchQuery}`, {
      method: "get",
      headers: {
        'Content-Type': 'application/json'
      },
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          setUsers(data.users);
          setCount(data.users.length);
          console.log(data.users, 'dddddd')
        }
      })
      .catch((error) => console.error(error));
  };

  const [searchCountdown, setSearchCountdown] = useState(null);

  useEffect(() => {
    if (searchCountdown){
      clearTimeout(searchCountdown);
    }
    setSearchCountdown(setTimeout(fetchServer, 1000));
  }, [searchQuery, lastUpd]);

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
            <Link className={styles.userInfo} to={`/dashboard/user/${user_id}`}>
              <div className={styles.profileImg}
                style={{
                  backgroundImage: `url("${serverOrigin}/profile-images/${user_id}.jpeg")`, backgroundSize: 'cover',
                  backgroundPosition: 'center center',
                  backgroundRepeat: 'no-repeat',
                }}
              >
              </div>
              <div className={`${styles.name} overflowDot`}>
                {name}
              </div>
              <div className={styles.flagWrapper}>
                <CountryViewer timezone={timezone} />
              </div>
            </Link>
            <div className={styles.buttons}>
              <div>
                <DmBtn
                  userInfo={user}
                  setResponse={setResponse}
                  padding={'0.3125rem 0.625rem'}
                />
              </div>
              <div>
                <FriendRequestBtn
                  userInfo={user}
                  setResponse={setResponse}
                  padding={'0.3125rem 0.625rem'}
                />
              </div>
            </div>
          </div>
        )
      })}
    </div>
  );
};

export default SearchUsers;