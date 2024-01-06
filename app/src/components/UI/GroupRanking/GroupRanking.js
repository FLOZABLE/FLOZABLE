import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import styles from "./GroupRanking.module.css";

const serverOrigin = process.env.REACT_APP_ORIGIN;

function GroupRanking({ groupMembers }) {
    const [searched, setSearched] = useState(false);
    useEffect(() => {
        groupMembers.map((member) => {
            fetch(`${serverOrigin}/account/profile/${selectedUserId}`, { method: 'get' })
                .then((response) => response.json())
                .then((data) => {

                })
                .catch((error) => console.error(error));
        });
    }, [])

    return (
        <div>
            <p></p>
        </div>
    );
}

export default GroupRanking;
