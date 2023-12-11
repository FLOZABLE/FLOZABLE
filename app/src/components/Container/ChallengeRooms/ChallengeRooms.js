import React from "react";
import { Link } from "react-router-dom";
import styles from "./ChallengeRooms.module.css";
import { useEffect, useState } from "react";
import ChallengeRoom from "../../UI/ChallengeRoom/ChallengeRoom.js"

const serverOrigin = process.env.REACT_APP_ORIGIN;

function ChallengeRooms({ isSidebarOpen, isSidebarHovered, setResponse }) {
    const [challenges, setChallenges] = useState([]);
    const [challengesEl, setChallengesEl] = useState([]);

    useEffect(() => {
        fetch(`${serverOrigin}/api/challenges/rooms`, {
            method: "get",
            headers: {
                'Content-Type': 'application/json'
            },
        })
            .then((response) => response.json())
            .then((data) => {
                if (data.success) {
                    const tempChallenges = [...data.data];
                    const tempEl = [];
                    data.data.map((challenge, i) => {
                        tempEl.push(
                            <ChallengeRoom key={i} challengeInfo={challenge} challenges={tempChallenges} setChallenges={setChallenges} setResponse={setResponse} />
                        )
                    });
                    setChallenges(tempChallenges);

                }
            });
    }, []);

    useEffect(() => {
        const tempEl = [];
        challenges.map((challenge, i) => {
            tempEl.push(
                <ChallengeRoom key={i} challengeInfo={challenge} challenges={challenges} setChallenges={setChallenges} setResponse={setResponse} />
            )
        });
        setChallengesEl(tempEl);
    }, [challenges])

    return (
        <div className={styles.ChallengeRooms}>
            <div className={` Main ${isSidebarOpen || isSidebarHovered ? 'sidebarOpen' : ''}`}>
                {
                    challengesEl.map((el) => {
                        return el;
                    })
                }
            </div>
        </div>
    );
}

export default ChallengeRooms;