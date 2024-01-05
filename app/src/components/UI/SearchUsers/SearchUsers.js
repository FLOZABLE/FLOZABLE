import { useEffect, useState } from "react";
import styles from "./SearchUsers.module.css";
import { Link } from "react-router-dom";
import MemberTimer from "../MemberTimer/MemberTimer";
import ChallengeBtn from "../ChallengeBtn/ChallengeBtn";
import DmBtn from "../DmBtn/DmBtn";
import CountryViewer from "../CountryViewer/CountryViewer";
import FriendRequestBtn from "../FriendRequestBtn/FriendRequestBtn";

const serverOrigin = process.env.REACT_APP_ORIGIN;

function SearchUsers({ searchQuery, setResponse, setCount }) {
  const [lastUpd, setLastUpd] = useState(false);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const isRateLimited = lastUpd && new Date().getTime() - lastUpd < 1000;
    console.log(isRateLimited)
    if (isRateLimited || !searchQuery || searchQuery.length < 3) return;

    setLastUpd(new Date().getTime());
    fetch(`${serverOrigin}/friend/search?query=${searchQuery}`, {
      method: "get",
      headers: {
        'Content-Type': 'application/json'
      },
    })
      .then((response) => response.json())
      .then((data) => {
        console.log(data);
        if (data.success) {
          setUsers(data.users);
          setCount(data.users.length);
        }
      })
      .catch((error) => console.error(error));
  }, [searchQuery, lastUpd]);

  return (
    <div className={styles.SearchUsers}>
      {users.map(user => {
        const { user_id, name, timezone } = user;
        return (
          <div className={styles.user}>
            <Link
              to={`/dashboard/user/${user_id}`}
              className={styles.userInfo}>
              <div className={styles.profileImg}
                style={{
                  backgroundImage: `url("${serverOrigin}/profile-images/{user_id}.jpeg")`, backgroundSize: 'cover',
                  backgroundPosition: 'center center',
                  backgroundRepeat: 'no-repeat',
                }}
              >
              </div>
              <div className={styles.name}>
                {name}
              </div>
              <div className={styles.flagWrapper}>
                <CountryViewer timezone={timezone} />
              </div>
            </Link>
            {/* <div className={styles.subject}>
            <UserSubjectViewer
              userInfo={friend}
              setResponse={setResponse}
            />
          </div> */}
            <div className={styles.right}>
              {/* <div className={styles.today}>
              <p>Today: </p>
              <p>&nbsp;</p>
              <MemberTimer
                userInfo={friend}
                initialStatus={id ? true : false}
                initialSec={liveTotal}
                setResponse={setResponse}
              />
            </div> */}
              <div className={styles.buttonsWrapper}>
                <div className={styles.requestBtn}>
                  <ChallengeBtn
                    userInfo={user}
                    setResponse={setResponse}
                  />
                </div>
                <div className={styles.requestBtn}>
                  <DmBtn
                    userInfo={user}
                    setResponse={setResponse}
                  />
                </div>
                <div className={styles.requestBtn}>
                  <FriendRequestBtn
                    userInfo={user}
                    setResponse={setResponse}
                  />
                </div>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  );
};

export default SearchUsers;