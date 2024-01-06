import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import styles from "./GroupRanking.module.css";
import { durationFormatter } from "../../../utils/Tool.js";
import { isRequestOptions } from "openai/core";
import BlobBtn from "../BlobBtn/BlobBtn";

const serverOrigin = process.env.REACT_APP_ORIGIN;

function GroupRanking({ groupMembers, isGroupRankingModal, setIsGroupRankingModal }) {
    const [groupRanking, setGroupRanking] = useState([]);
    useEffect(() => {
        if (!!!groupMembers) return;
        const groupMemberIds = [];
        const tempGroupRanking = [];

        groupMembers.map((member) => {
            groupMemberIds.push(member.user_id);
        })

        fetch(`${serverOrigin}/ranking/today`, { method: 'get' })
            .then((response) => response.json())
            .then((data) => {
                data.rankings.map((ranking) => {
                    if (groupMemberIds.includes(ranking.user.user_id)) {
                        tempGroupRanking.push(ranking);
                    }
                })
                setGroupRanking(tempGroupRanking);
            })
            .catch((error) => console.error(error));

    }, [groupMembers]);

    return (
        <div className={`${styles.GroupRanking}`}>
            <div className={isGroupRankingModal ? styles.GroupRankingContainer : styles.hidden}>
                <h1>Group Ranking</h1>
                <div>
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
                <BlobBtn
                  name={"Close"}
                  setClicked={() => {setIsGroupRankingModal(!isGroupRankingModal)}}
                  color1={"#fff"}
                  color2={"var(--pink)"}
                  delay={-1}
                />
            </div>
        </div>
    );
}

export default GroupRanking;
