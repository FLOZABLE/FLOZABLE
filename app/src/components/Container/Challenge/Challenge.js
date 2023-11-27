import styles from "./Challenge.module.css";
import React, { useState, useEffect, useRef } from 'react';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faV, faS, faSlash } from '@fortawesome/free-solid-svg-icons';
import { DateTime } from "luxon";

const serverOrigin = process.env.REACT_APP_ORIGIN;

function Challenge({ userInfo, isSidebarOpen, isSidebarHovered }) { //allMembers (for link of challenger), userInfo, (fetch challenge on its own)

    const [userInfo1, setUserInfo1] = useState({ id: null, name: null });
    const [userInfo2, setUserInfo2] = useState({ id: null, name: null });
    const [challenge, setChallenge] = useState({ first: "An Error Occured", second: "An Error Occured", third: "An Error Occured", firstRange: [0,0], secondRange: [0,0], thirdRange: [0,0]});
    const [user1Pfp, setUser1Pfp] = useState((<p>An error occured</p>));
    const [user2Pfp, setUser2Pfp] = useState((<p>An error occured</p>));
    const [competeInfo1, setCompeteInfo1] = useState({firstRoundTotal: 0});

    const cyrb128 = (str) => {
        console.log(str);
        let h1 = 1779033703, h2 = 3144134277,
            h3 = 1013904242, h4 = 2773480762;
        for (let i = 0, k; i < str.length; i++) {
            k = str.charCodeAt(i);
            h1 = h2 ^ Math.imul(h1 ^ k, 597399067);
            h2 = h3 ^ Math.imul(h2 ^ k, 2869860233);
            h3 = h4 ^ Math.imul(h3 ^ k, 951274213);
            h4 = h1 ^ Math.imul(h4 ^ k, 2716044179);
        }
        h1 = Math.imul(h3 ^ (h1 >>> 18), 597399067);
        h2 = Math.imul(h4 ^ (h2 >>> 22), 2869860233);
        h3 = Math.imul(h1 ^ (h3 >>> 17), 951274213);
        h4 = Math.imul(h2 ^ (h4 >>> 19), 2716044179);
        h1 ^= (h2 ^ h3 ^ h4);
        h2 ^= h1;
        h3 ^= h1;
        h4 ^= h1;
        return [h1>>>0, h2>>>0, h3>>>0, h4>>>0];
    }

    let a = 0;
    let b = 0;
    let c = 0;
    let d = 0;

    const sfc32 = () => {
        return function() {
          a >>>= 0; b >>>= 0; c >>>= 0; d >>>= 0; 
          var t = (a + b) | 0;
          a = b ^ b >>> 9;
          b = c + (c << 3) | 0;
          c = (c << 21 | c >>> 11);
          d = d + 1 | 0;
          t = t + d | 0;
          c = c + t | 0;
          return (t >>> 0) / 4294967296;
        }
    }

    useEffect(() => {
        const pathName = window.location.pathname.split('/');
        const selectedChallengeId = pathName[pathName.length - 1];

        //seed generated random function
        const seed = cyrb128(selectedChallengeId);
        a = seed[0];
        b = seed[1];
        c = seed[2];
        d = seed[3];
        // Four 32-bit component hashes provide the seed for sfc32.
        const rand = sfc32();

        const firstRoundChoices = ["Longest Focus this Week", "Longest Focus today", "Most Studied Subject", "Total Study Time this Week", "Most Studied Day this Week"];
        const secondRoundChoices = ["Study Average this Week", "Day by Day Comparison (Past 7 Days)", "Subject to Subject Comparison (This Week)", "Random Day of the Week"];
        const thirdRoundChoices = ["Best Ranking this Week", "Average Ranking this Week", "3 Random Days this Week", "Random Day of the Past 40 Days"];
        
        const random = function(min, max){ //both inclusive
            return Math.floor(rand() * (max - min + 1)) + min;
        }

        const choiceOne = random(0, 1);
        const choiceTwo = random(0, 1);
        const choiceThree = random(0, 1);

        let rangeOne = [];
        let rangeTwo = [];
        let rangeThree = [];

        if (choiceOne === 0 || choiceOne === 1){
            let currTime = new DateTime({zone: 'utc'});
            let startUnix = currTime.startOf('week');
            let endUnix = currTime.endOf('week');
            rangeOne = [startUnix, endUnix];
        }

        if (choiceTwo === 0 || choiceTwo === 1){
            let currTime = new DateTime({zone: 'utc'});
            let startUnix = currTime.startOf('week');
            let endUnix = currTime.endOf('week');
            rangeTwo = [startUnix, endUnix];
        }

        if (choiceThree === 0 || choiceThree === 1){
            let currTime = new DateTime({zone: 'utc'});
            let startUnix = currTime.startOf('week');
            let endUnix = currTime.endOf('week');
            rangeThree = [startUnix, endUnix];
        }

        let tempChallenge = {first: firstRoundChoices[choiceOne], second: secondRoundChoices[choiceTwo], third: thirdRoundChoices[choiceThree], firstRange: rangeOne, secondRange: rangeTwo, thirdRange: rangeThree};
        setChallenge(tempChallenge);

        fetch(`${serverOrigin}/api/account/bring-challenges`, {
            method: "post",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ searchId: selectedChallengeId, searchUser: false }),
        })
            .then((response) => response.json())
            .then((data) => {
                if (data.success){
                    setUserInfo1({id : data.data.first_user_id, name: data.names[0].name});
                    setUser1Pfp((
                        <div className={styles.profileImg}
                            style={{
                                backgroundImage: `url("${serverOrigin}/profile-images/${data.data.first_user_id}.jpeg")`, backgroundSize: 'cover',
                                backgroundPosition: 'center center',
                                backgroundRepeat: 'no-repeat',
                            }}
                        ></div>
                    ))
                    setUserInfo2({id : data.data.second_user_id, name: data.names[data.names.length - 1].name});
                    setUser2Pfp((
                        <div className={styles.profileImg}
                            style={{
                                backgroundImage: `url("${serverOrigin}/profile-images/${data.data.second_user_id}.jpeg")`, backgroundSize: 'cover',
                                backgroundPosition: 'center center',
                                backgroundRepeat: 'no-repeat',
                            }}
                        ></div>
                    ))
                }
            })
            .catch((error) => console.error(error));
    }, []);

    useEffect(() => {
        //First comparison
        if (challenge.first === "An Error Occured") return;
        if (!!!userInfo1.id) return;
        const startUnix = challenge.firstRange[0];
        const stopUnix = challenge.firstRange[1];
        let totalTime = 0;
        fetch(`${serverOrigin}/api/ranking/sort`, {
            method: "post",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ startTime: startUnix, stopTime: stopUnix }),
        })
            .then((response) => response.json())
            .then((data) => {
                if (data.success){
                    totalTime = data.data.find((user) => user.user_id === userInfo1.id).total;
                    setCompeteInfo1({...competeInfo1, firstRoundTotal: totalTime});
                }
            });
    }, [challenge, userInfo1])

    return (
        <div className={styles.ChallengeContainer}>
            <div className={` Main ${isSidebarOpen || isSidebarHovered ? 'sidebarOpen' : ''}`}>
                <div className={styles.CurrentChallenge}>
                    <div className={styles.IntroContainer}>
                        <div className={styles.ChallengeTitle}>
                            <h1 className={styles.ChallengeTitle}>Head to Head - A Study Face-off!</h1>
                            <h2 className={styles.vsTitle}>V/S</h2>
                        </div>
                        <div className={styles.ChallengeIntroduction}>
                            <div className={styles.container}>
                                <div className={styles.firstHalf}>
                                    {user1Pfp}
                                    <h2>{userInfo1.name}</h2>
                                    <h4><i>"The study expert"</i></h4>
                                </div>
                                <div className={styles.secondHalf}>
                                    {user2Pfp}
                                    <h2>{userInfo2.name}</h2>
                                    <h4><i>"The time magician"</i></h4>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className={styles.compareContainer}>
                        <h1>Round 1 - Focus and Commitment</h1>
                        <h2>{challenge.first}</h2>
                        <div className={styles.container}>
                            <div className={styles.firstHalf}>
                                {user1Pfp}
                                <h2>{userInfo1.name}</h2>
                                <div className={styles.statContainer}>
                                    {competeInfo1.firstRoundTotal} seconds
                                </div>
                            </div>
                            <div className={styles.secondHalf}>
                                {user2Pfp}
                                <h2>{userInfo2.name}</h2>
                                <div className={styles.statContainer}>
                                    {competeInfo1.firstRoundTotal} seconds
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className={styles.compareContainer}>
                        <h1>Round 2 - Habbit and Consistency</h1>
                        <h2>{challenge.second}</h2>
                        <div className={styles.container}>
                            <div className={styles.firstHalf}>
                                {user1Pfp}
                                <h2>{userInfo1.name}</h2>
                                <div className={styles.statContainer}>
                                    {competeInfo1.firstRoundTotal} seconds
                                </div>
                            </div>
                            <div className={styles.secondHalf}>
                                {user2Pfp}
                                <h2>{userInfo2.name}</h2>
                                <div className={styles.statContainer}>
                                    {competeInfo1.firstRoundTotal} seconds
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className={styles.compareContainer}>
                        <h1>Round 3 - Wild Card!</h1>
                        <h2>{challenge.third}</h2>
                        <div className={styles.container}>
                            <div className={styles.firstHalf}>
                                {user1Pfp}
                                <h2>{userInfo1.name}</h2>
                                <div className={styles.statContainer}>
                                    {competeInfo1.firstRoundTotal} seconds
                                </div>
                            </div>
                            <div className={styles.secondHalf}>
                                {user2Pfp}
                                <h2>{userInfo2.name}</h2>
                                <div className={styles.statContainer}>
                                    {competeInfo1.firstRoundTotal} seconds
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Challenge;