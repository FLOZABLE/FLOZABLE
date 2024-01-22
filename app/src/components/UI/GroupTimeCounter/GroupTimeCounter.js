import React, { useRef, useState, useEffect, useCallback } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";
import styles from "./GroupTimeCounter.module.css";
import { mediaSocket } from "../../../mediaSocket";
import { durationFormatter } from "../../../utils/Tool";

const serverOrigin = process.env.REACT_APP_ORIGIN;

function GroupTimeCounter({
    members
}) {

    const [groupTotal, setGroupTotal] = useState(0);

    useEffect(() => {
        if (members.length <= 0) return;

        fetch(`${serverOrigin}/ranking/today`, {
            method: "get",
            headers: {
                'Content-Type': 'application/json'
            },
        })
            .then((response) => response.json())
            .then((data) => {
                if (data.success) {
                    let groupTotalTime = 0;

                    data.rankings.map((ranking) => {
                        if (members.includes(ranking.user.user_id)) {
                            groupTotalTime += parseInt(ranking.total);
                        }
                    });

                    setGroupTotal(groupTotalTime);
                }
            });

    }, [members])

    return (
        <div className={styles.GroupTimeCounter}>
            {durationFormatter(groupTotal)}
        </div>
    );
}

export default GroupTimeCounter;