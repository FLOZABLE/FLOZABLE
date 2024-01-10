import { useEffect, useState } from "react";
import styles from "./ChallengeHistory.module.css";

const serverOrigin = process.env.REACT_APP_ORIGIN;

function ChallengeHistory({
    userInfo,
}) {
    const [challenges, setChallenges] = useState([]);

    useEffect(() => {
        if (!userInfo) return;
        fetch(`${serverOrigin}/challenges?userId=${userInfo.user_id}`, {
            method: "get",
            headers: {
                'Content-Type': 'application/json'
            },
        })
            .then((response) => response.json())
            .then((data) => {
                if (data.success) {
                    console.log(data);
                }
            });
    }, [userInfo]);

    return (
        <div className={styles.ChallengeHistory}>

        </div>
    )
};

export default ChallengeHistory;