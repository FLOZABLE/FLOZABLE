import React, { useEffect, useState } from "react";
import styles from "./ChallengeHistory.module.css";
import { DateTime } from 'luxon';
import { Link } from 'react-router-dom';

const serverOrigin = process.env.REACT_APP_ORIGIN;

function ChallengeHistory({
  userInfo,
}) {
  const [challenges, setChallenges] = useState([]);

  useEffect(() => {
    if (!userInfo) return;
    fetch(`${serverOrigin}/challenges?searchUser=${userInfo.user_id}`, {
      method: "get",
      headers: {
        'Content-Type': 'application/json'
      },
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          setChallenges(data.data);
        }
      });
  }, [userInfo]);

  return (
    <div className={styles.ChallengeHistory}>
      {
        challenges.sort((a, b) => b.datum_point - a.datum_point).map((challenge, i) => {
          return (
            <div key={i}>
              <Link to={`/dashboard/challenge/${challenge.id}`}>
                <p>
                  {challenge.first_user.name} VS {challenge.second_user.name}
                </p>
              </Link>
              <p>
                {
                  DateTime.fromJSDate(new Date()).toUTC().ts / 1000 > parseInt(challenge.datum_point)
                    ? "Started On: "
                    : "Starts On "
                }
                {`${DateTime.fromSeconds(challenge.datum_point).toFormat("DD")} at ${DateTime.fromSeconds(challenge.datum_point).toFormat("h:mm a")}`}
              </p>
            </div>
          )
        })
      }
    </div>
  )
};

export default ChallengeHistory;