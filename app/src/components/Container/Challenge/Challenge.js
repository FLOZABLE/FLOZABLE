import styles from "./Challenge.module.css";
import React, { useState, useEffect, useRef } from 'react';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faV, faS, faSlash } from '@fortawesome/free-solid-svg-icons';
import { DateTime } from "luxon";

const serverOrigin = process.env.REACT_APP_ORIGIN;

function Challenge({ userInfo, isSidebarOpen, isSidebarHovered }) { //allMembers (for link of challenger), userInfo, (fetch challenge on its own)


    const [userInfo1, setUserInfo1] = useState({ id: null, name: null });
    const [userInfo2, setUserInfo2] = useState({ id: null, name: null });
    const [challenge, setChallenge] = useState({ first: "An Error Occured", second: "An Error Occured", third: "An Error Occured", firstRange: [0, 0], secondRange: [0, 0], thirdRange: [0, 0] });
    const [datumPoint, setDatumPoint] = useState(0);
    const [user1Pfp, setUser1Pfp] = useState((<p>An error occured</p>));
    const [user2Pfp, setUser2Pfp] = useState((<p>An error occured</p>));
    const [competeInfo1, setCompeteInfo1] = useState({ firstRoundTotal: 0, secondRoundTotal: 0, thirdRoundTotal: 0 });
    const [competeInfo2, setCompeteInfo2] = useState({ firstRoundTotal: 0, secondRoundTotal: 0, thirdRoundTotal: 0 });
    const [descriptionEl1, setDescriptionEl1] = useState(<p></p>);
    const [descriptionEl2, setDescriptionEl2] = useState(<p></p>);
    const [descriptionEl3, setDescriptionEl3] = useState(<p></p>);


    const cyrb128 = (str) => {
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
        return [h1 >>> 0, h2 >>> 0, h3 >>> 0, h4 >>> 0];
    }


    let a = 0;
    let b = 0;
    let c = 0;
    let d = 0;


    const sfc32 = () => {
        return function () {
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
        const thirdRoundChoices = ["Best Ranking this Week", "Average Ranking this Week", "3 Random Days this Week", "Random Day of the Past 30 Days"];

        const random = function (min, max) { //both inclusive
            return Math.floor(rand() * (max - min + 1)) + min;
        }


        const choiceOne = 3;
        const choiceTwo = 0;
        const choiceThree = 3;


        let rangeOne = [];
        let rangeTwo = [];
        let rangeThree = [];


        fetch(`${serverOrigin}/api/account/bring-challenges`, {
            method: "post",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ searchId: selectedChallengeId, searchUser: false }),
        })
            .then((response) => response.json())
            .then((data) => {
                if (data.success) {
                    setUserInfo1({ id: data.data.first_user_id, name: data.names[0].name });
                    setUser1Pfp((
                        <div className={styles.profileImg}
                            style={{
                                backgroundImage: `url("${serverOrigin}/profile-images/${data.data.first_user_id}.jpeg")`, backgroundSize: 'cover',
                                backgroundPosition: 'center center',
                                backgroundRepeat: 'no-repeat',
                            }}
                        ></div>
                    ));
                    setUserInfo2({ id: data.data.second_user_id, name: data.names[data.names.length - 1].name });
                    setUser2Pfp((
                        <div className={styles.profileImg}
                            style={{
                                backgroundImage: `url("${serverOrigin}/profile-images/${data.data.second_user_id}.jpeg")`, backgroundSize: 'cover',
                                backgroundPosition: 'center center',
                                backgroundRepeat: 'no-repeat',
                            }}
                        ></div>
                    ));
                    setDatumPoint(data.data.datum_point);

                    if (choiceOne === 3) {
                        let startUnix = DateTime.fromSeconds(data.data.datum_point).startOf('week');
                        let endUnix = DateTime.fromSeconds(data.data.datum_point).endOf('week');
                        rangeOne = [startUnix, endUnix];
                    }
                    if (choiceTwo === 0) {
                        let startUnix = DateTime.fromSeconds(data.data.datum_point).startOf('week');
                        let endUnix = DateTime.fromSeconds(data.data.datum_point).endOf('week');
                        rangeTwo = [startUnix, endUnix];
                    }
                    if (choiceThree === 3) {
                        let startUnix = DateTime.fromSeconds(data.data.datum_point).minus({ days: random(0, 30) }).startOf('day');
                        let endUnix = startUnix.endOf('day');
                        rangeThree = [startUnix, endUnix];
                        console.log(rangeThree);
                    }


                    let tempChallenge = { first: firstRoundChoices[choiceOne], second: secondRoundChoices[choiceTwo], third: thirdRoundChoices[choiceThree], firstRange: rangeOne, secondRange: rangeTwo, thirdRange: rangeThree };
                    setChallenge(tempChallenge);
                }
            })
            .catch((error) => console.error(error));
    }, []);


    useEffect(() => {
        if (challenge.first === "An Error Occured") return;
        if (!!!userInfo1.id) return;

        const startUnix1 = challenge.firstRange[0].ts;
        const stopUnix1 = challenge.firstRange[1].ts;
        const startUnix2 = challenge.secondRange[0].ts;
        const stopUnix2 = challenge.secondRange[1].ts;
        const startUnix3 = challenge.thirdRange[0].ts;
        const stopUnix3 = challenge.thirdRange[1].ts;

        setDescriptionEl1(<h3>{challenge.firstRange[0].toFormat("DD")} ~ {challenge.firstRange[1].toFormat("DD")}</h3>);
        setDescriptionEl2(<h3>{challenge.secondRange[0].toFormat("DD")} ~ {challenge.secondRange[1].toFormat("DD")}</h3>);
        if (startUnix3 + 86400000 > stopUnix3){
            setDescriptionEl3(<h3>Day: {challenge.thirdRange[0].toFormat("DD")}</h3>);
        }
        else{
            setDescriptionEl3(<h3>{challenge.thirdRange[0].toFormat("DD")} ~ {challenge.thirdRange[1].toFormat("DD")}</h3>);
        }

        const DAY_OF_WEEK = DateTime.fromSeconds(datumPoint).weekday; //day of week when challenge was accepted

        //let tempCompete1 = { firstRoundTotal: 0, secondRoundTotal: 0, thirdRoundTotal: 0 };
        //let tempCompete2 = { firstRoundTotal: 0, secondRoundTotal: 0, thirdRoundTotal: 0 };

        fetch(`${serverOrigin}/api/ranking/sort`, {
            method: "post",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ startTime: startUnix1, stopTime: stopUnix1 }),
        })
            .then((response) => response.json())
            .then((data) => {
                if (data.success) {
                    let totalTime1 = 0;
                    let averageTime1 = 0;
                    let totalTime2 = 0;
                    let averageTime2 = 0;
                    totalTime1 = data.data.find((user) => user.user_id === userInfo1.id).total;
                    averageTime1 = Math.round(totalTime1 * 100 / DAY_OF_WEEK) / 100;
                    //tempCompete1.firstRoundTotal = totalTime1;
                    //tempCompete1.secondRoundTotal = averageTime1;
                    totalTime2 = data.data.find((user) => user.user_id === userInfo2.id).total;
                    averageTime2 = Math.round(totalTime2 * 100 / DAY_OF_WEEK) / 100;
                    //tempCompete2.firstRoundTotal = totalTime2;
                    //tempCompete2.secondRoundTotal = averageTime2;
                }
            });

        fetch(`${serverOrigin}/api/ranking/sort`, {
            method: "post",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ startTime: startUnix3, stopTime: stopUnix3 }),
        })
            .then((response) => response.json())
            .then((data) => {
                if (data.success) {
                    let totalTime1 = 0;
                    let totalTime2 = 0;
                    totalTime1 = data.data.find((user) => user.user_id === userInfo1.id).total;
                    //tempCompete1.thirdRoundTotal = totalTime1;
                    totalTime2 = data.data.find((user) => user.user_id === userInfo2.id).total;
                    //tempCompete2.thirdRoundTotal = totalTime2;
                }
            });

        //setCompeteInfo1(tempCompete1);
        //setCompeteInfo2(tempCompete2);

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
                        {descriptionEl1}
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
                                    {competeInfo2.firstRoundTotal} seconds
                                </div>
                            </div>
                        </div>
                    </div>


                    <div className={styles.compareContainer}>
                        <h1>Round 2 - Habbit and Consistency</h1>
                        <h2>{challenge.second}</h2>
                        {descriptionEl2}
                        <div className={styles.container}>
                            <div className={styles.firstHalf}>
                                {user1Pfp}
                                <h2>{userInfo1.name}</h2>
                                <div className={styles.statContainer}>
                                    {competeInfo1.secondRoundTotal} seconds
                                </div>
                            </div>
                            <div className={styles.secondHalf}>
                                {user2Pfp}
                                <h2>{userInfo2.name}</h2>
                                <div className={styles.statContainer}>
                                    {competeInfo2.secondRoundTotal} seconds
                                </div>
                            </div>
                        </div>
                    </div>


                    <div className={styles.compareContainer}>
                        <h1>Round 3 - Wild Card!</h1>
                        <h2>{challenge.third}</h2>
                        {descriptionEl3}
                        <div className={styles.container}>
                            <div className={styles.firstHalf}>
                                {user1Pfp}
                                <h2>{userInfo1.name}</h2>
                                <div className={styles.statContainer}>
                                    {competeInfo1.thirdRoundTotal} seconds
                                </div>
                            </div>
                            <div className={styles.secondHalf}>
                                {user2Pfp}
                                <h2>{userInfo2.name}</h2>
                                <div className={styles.statContainer}>
                                    {competeInfo2.thirdRoundTotal} seconds
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className={styles.ChallengeHistory}>
                    <h2>View other challenges by {userInfo1.name}</h2>
                </div>
            </div>
        </div>
    )
}


export default Challenge;