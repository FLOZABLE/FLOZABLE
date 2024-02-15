import React, { useState, useEffect } from "react";
import styles from "./GroupRankingModal.module.css";
import { durationFormatter } from "../../../utils/Tool.js";
import BlobBtn from "../BlobBtn/BlobBtn.js";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark } from "@fortawesome/free-solid-svg-icons";
import { DateTime } from "luxon";

const serverOrigin = process.env.REACT_APP_ORIGIN;

function GroupRankingModal({ isOpen, setIsOpen, members }) {
  const [groupRanking, setGroupRanking] = useState([]);

  useEffect(() => {
    if (!members) return;
    const membArr = members === "" ? [] : members.split(",");
    
    const tempGroupRanking = [];
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    fetch(`${serverOrigin}/ranking/sort?mode=Daily&date=${DateTime.now().toISODate()}&timezone=${timezone}`, {
      method: 'get',
      headers: {
        'Content-Type': 'application/json'
      },
    })
      .then((response) => response.json())
      .then((data) => {
        data.rankings.map((ranking) => {
          if (membArr.includes(ranking.user.user_id)) {
            tempGroupRanking.push(ranking);
          }
        })
        setGroupRanking(tempGroupRanking);
      })
      .catch((error) => console.error(error));

  }, [members]);
  

  return (
    <div className={`${styles.GroupRankingModal} modal ${isOpen ? "open" : ""}`}>
      <div className={styles.header}>
        <i onClick={() => {setIsOpen(false)}}>
          <FontAwesomeIcon icon={faXmark} />
        </i>
      </div>
      <div
        className={styles.title}
      >Group Ranking</div>
      <div className={`${styles.rankingContainer} hiddenScroll`}>
        {
          groupRanking.map((ranking, i) => {
            return (
              <div key={i}>
                {i + 1}&#41; {ranking.user.name}: {durationFormatter(ranking.total)}
              </div>
            )
          })
        }
      </div>
    </div>
  );
}

export default GroupRankingModal;