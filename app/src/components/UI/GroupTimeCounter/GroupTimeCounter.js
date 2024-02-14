import React, { useRef, useState, useEffect, useCallback } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";
import styles from "./GroupTimeCounter.module.css";
import { mediaSocket } from "../../../mediaSocket";
import { durationFormatter } from "../../../utils/Tool";
import { DateTime } from "luxon";

const serverOrigin = process.env.REACT_APP_ORIGIN;

function GroupTimeCounter({
  members
}) {

  const [groupTotal, setGroupTotal] = useState(0);

  useEffect(() => {
    if (members.length <= 0) return;

    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    
    fetch(`${serverOrigin}/ranking/sort?mode=Daily&date=${DateTime.now().toISODate()}&timezone=${timezone}`, {
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