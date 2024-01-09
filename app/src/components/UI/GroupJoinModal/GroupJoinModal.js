import React, { useState, useEffect } from "react";
import styles from "./GroupJoinModal.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faVolumeHigh,
    faVolumeXmark,
} from "@fortawesome/free-solid-svg-icons";
import BlobBtn from "../BlobBtn/BlobBtn"
import parse from 'html-react-parser';

const serverOrigin = process.env.REACT_APP_ORIGIN;

function GroupJoinModal({ groups, userInfo, isSidebarHovered, isSidebarOpen, setResponse }) {
    const [isDragging, setIsDragging] = useState(false);
    const [volume, setVolume] = useState(0);
    const [joiningGroup, setJoiningGroup] = useState({ id: "" });
    const [groupDescriptionEl, setGroupDescriptionEl] = useState(<div></div>);
    const [passwordEl, setPasswordEl] = useState(<div></div>);
    const [groupPassword, setGroupPassword] = useState("");

    useEffect(() => {
        const pathName = window.location.pathname.split('/');
        const selectedGroupId = pathName[pathName.length - 1];

        groups.map((group) => {
            if (group.group_id === selectedGroupId) {
                setJoiningGroup({ ...group });
            }
        });
    }, [groups]);

    useEffect(() => {
        console.log("test", joiningGroup, userInfo);
        if (!!joiningGroup.group_id) {
            setGroupDescriptionEl(
                <div>
                    <h1>
                        {joiningGroup.name}
                        ({joiningGroup.members.split(",").length})
                        ({joiningGroup.goal_hr}hr)
                    </h1>
                </div>
            );
            if (joiningGroup.visibility === 0) {
                setPasswordEl(
                    <div>
                        <input type="text" placeholder="Password" autoComplete="off" onKeyUp={handlePasswordInput} />
                    </div>
                )
            }
        }
        else {
            setGroupDescriptionEl(
                <div>
                    <h1>
                        This group does not exist or has been deleted
                    </h1>
                </div>
            )
        }
    }, [joiningGroup]);

    const joinGroup = (password = "") => {
        alert(password);
        fetch(`${serverOrigin}/groups/join/${joiningGroup.group_id}`,
            {
                method: "post",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({ password: password })
            })
            .then((response) => response.json())
            .then((data) => {
                setResponse(data);
                if (data.success){
                    window.location.pathname = "/dashboard/groups";
                }
            })
            .catch((error) => console.error(error));
    }

    const handlePasswordInput = (e) => {
        setGroupPassword(e.target.value);
    }

    return (
        <div className={styles.GroupJoinModal}>
            <div className={` Main ${isSidebarOpen || isSidebarHovered ? 'sidebarOpen' : ''}`}>
                {groupDescriptionEl}
                {passwordEl}
                <BlobBtn setClicked={() => { joinGroup(groupPassword) }} name="Join" delay={-1} />
            </div>
        </div>
    );
}

export default GroupJoinModal;