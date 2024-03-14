import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import styles from "./FriendsRankingViewer.module.css";
import { faAngleRight } from "@fortawesome/free-solid-svg-icons";
import { Link } from "react-router-dom";
import React, { useEffect, useState } from "react";
import { DateTime } from "luxon";
import CountryViewer from "../CountryViewer/CountryViewer";
import { secondConverter } from "../../../utils/Tool";
import DropDownButton from "../DropDownButton/DropDownButton";

const serverOrigin = process.env.REACT_APP_ORIGIN;

function FriendsRankingViewer({ friendsRanking }) {

  const [viewer, setViewer] = useState('day');

  return (
    <div className={styles.FriendsRankingViewer}>
      <div className={styles.Button}>
        <div>
          <DropDownButton
            options={{
              "day": "Today",
              "week": "This Week",
              "month": "This Month"
            }}
            setValue={setViewer}
            value={viewer}
          />
        </div>
      </div>
      <div className={`${styles.rankings} customScroll`}>
        {friendsRanking?.[viewer]?.map((friend, i) => {
          console.log(friend);
          let value = friend.dayTotal;
          if (viewer === "month") {
            value = friend.monthTotal;
          } else if (viewer === "week") {
            value = friend.weekTotal;
          };

          const formattedVal = secondConverter(value);

          return (
            <div className={styles.userContainer} key={i}>
              <div className={styles.rank}>
                #{i + 1}
              </div>
              <Link
                to={`/dashboard/user/${friend.user_id}`}
                className={styles.userInfo}>
                <div className={styles.profileImg}
                  style={{
                    backgroundImage: `url("${serverOrigin}/profile-images/${friend.user_id}.jpeg")`, backgroundSize: 'cover',
                    backgroundPosition: 'center center',
                    backgroundRepeat: 'no-repeat',
                  }}
                ></div>
                <div className={`${styles.name} overflowDot`}>{friend.name}</div>
                <CountryViewer timezone={friend.timezone} />
              </Link>
              <div className={styles.diff}>
                {formattedVal.value} {formattedVal.type}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  );
};

export default FriendsRankingViewer;