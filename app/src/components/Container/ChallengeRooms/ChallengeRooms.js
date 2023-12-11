import React from "react";
import { Link } from "react-router-dom";
import styles from "./ChallengeRooms.module.css";
import { useEffect, useState } from "react";

function ChallengeRooms({ isSidebarOpen, isSidebarHovered }) {
    const [challenges, setChallenges] = useState(false);
    return (
        <div className={styles.ChallengeRooms}>
            <div className={` Main ${isSidebarOpen || isSidebarHovered ? 'sidebarOpen' : ''}`}>
                Challenge Rooms
            </div>
        </div>
    );
}

export default ChallengeRooms;