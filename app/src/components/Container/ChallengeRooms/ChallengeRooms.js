import React from "react";
import { Link } from "react-router-dom";
import styles from "./ChallengeRooms.module.css";
import { useEffect, useState } from "react";
import ChallengeRoom from "../../UI/ChallengeRoom/ChallengeRoom.js"
import CreateChallengeModal from "../../UI/CreateChallengeModal/CreateChallengeModal.js";
import { DateTime } from "luxon"

const serverOrigin = process.env.REACT_APP_ORIGIN;

function ChallengeRooms({ isSidebarOpen, isSidebarHovered, setResponse }) {
    const [challenges, setChallenges] = useState([]);
    const [challengesEl, setChallengesEl] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [start, setStart] = useState(new Date());
    const [end, setEnd] = useState(new Date());
    
    function setChallengeSubmit(){
        const currMillis = new Date(Date.now() + 3600000 - 60000); // + 59 minutes
        if (start < currMillis){
            setResponse({success: false, reason: "Must be 1 hour in the future"});
            return;
        }
        if (title === ""){
            setResponse({success: false, reason: "Please enter a title"});
            return;
        }
        console.log(description);
        if (description === "<p><br></p>"){
            setResponse({success: false, reason: "Please enter a description"});
            return;
        }
        alert("Program the fetch statement ChallengeRooms.js Line 35");
        setIsModalOpen(false);
    }

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
            <CreateChallengeModal 
                isModalOpen={isModalOpen} 
                setIsModalOpen={setIsModalOpen} 
                title={title}
                setTitle={setTitle}
                description={description}
                setDescription={setDescription}
                start={start}
                setStart={setStart}
                end={end}
                setEnd={setEnd}
                setChallengeSubmit={setChallengeSubmit}
            />
            <div className={` Main ${isSidebarOpen || isSidebarHovered ? 'sidebarOpen' : ''}`}>
                <button onClick = {() => {setIsModalOpen(true)}}>Create A Challenge</button>
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