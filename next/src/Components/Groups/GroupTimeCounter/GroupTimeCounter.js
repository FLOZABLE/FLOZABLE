import React, { useState, useEffect } from "react";
import styles from "./GroupTimeCounter.module.css";
import { DateTime } from "luxon";
import config from "@/utils/config";


function GroupTimeCounter({
  members
}) {

  const [groupTotal, setGroupTotal] = useState(0);

  useEffect(() => {
    if (members.length <= 0) return;

    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    
    fetch(`${config.server}/ranking/sort?mode=Daily&date=${DateTime.now().toISODate()}&timezone=${timezone}`, {
      method: 'get',
      headers: {
        'Content-Type': 'application/json'
      },
    })
      .then((response) => response.json())
      .then((response) => {
        if (response.success) {
          let groupTotalTime = 0;

          response.data.map((ranking) => {
            if (members.includes(ranking.user_id)) {
              groupTotalTime += parseInt(ranking.t);
            }
          });

          setGroupTotal(groupTotalTime);
        }
      });

  }, [members])

  return (
    <div className={styles.GroupTimeCounter}>
      {Math.round(groupTotal * 100 / 3600) / 100}hr
    </div>
  );
}

export default GroupTimeCounter;