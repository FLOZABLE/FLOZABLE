import styles from "./Challenge.module.css";
import React, { useState, useEffect, useRef } from 'react';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faV, faS, faSlash } from '@fortawesome/free-solid-svg-icons';
import { DateTime } from "luxon";
import { timelineSort } from "../../../utils/timelineSorting"

const serverOrigin = process.env.REACT_APP_ORIGIN;

function Challenge({ userInfo, isSidebarOpen, isSidebarHovered }) { //userInfo, (fetch challenge on its own)


    const [userInfo1, setUserInfo1] = useState({ id: null, name: null });
    const [userInfo2, setUserInfo2] = useState({ id: null, name: null });
    const [challenge, setChallenge] = useState({ first: "An Error Occured", second: "An Error Occured", third: "An Error Occured", firstRange: [0, 0], secondRange: [0, 0], thirdRange: [0, 0] });
    const [datumPoint, setDatumPoint] = useState(0);
    const [challengeId, setChallengeId] = useState("");
    const [user1Pfp, setUser1Pfp] = useState((<p>An error occured</p>));
    const [user2Pfp, setUser2Pfp] = useState((<p>An error occured</p>));
    const [competeInfo1, setCompeteInfo1] = useState({ firstRoundTotal: 0, secondRoundTotal: 0, thirdRoundTotal: 0 });
    const [competeInfo2, setCompeteInfo2] = useState({ firstRoundTotal: 0, secondRoundTotal: 0, thirdRoundTotal: 0 });
    const [user1Subjects, setUser1Subjects] = useState(null);
    const [user2Subjects, setUser2Subjects] = useState(null);
    const [descriptionEl1, setDescriptionEl1] = useState(<p></p>);
    const [descriptionEl2, setDescriptionEl2] = useState(<p></p>);
    const [descriptionEl3, setDescriptionEl3] = useState(<p></p>);
    const [challengeHistoryEl, setChallengeHistoryEl] = useState(<p></p>)


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
        setChallengeId(selectedChallengeId);


        //seed generated random function
        const seed = cyrb128(selectedChallengeId);
        a = seed[0];
        b = seed[1];
        c = seed[2];
        d = seed[3];
        // Four 32-bit component hashes provide the seed for sfc32.
        const rand = sfc32();


        const firstRoundChoices = ["Longest Focus Last Week", "Longest Focus Yesterday", "Most Studied Subject Yesterday", "Total Study Time Last Week", "Most Studied Day Last Week"];
        const secondRoundChoices = ["Study Average Last Week", "Day By Day Comparison (Past 7 Days)", "Subject To Subject Comparison (Last Week)", "Random Day Of Last Week"];
        const thirdRoundChoices = ["Best Ranking Last Week", "Average Ranking Last Week", "3 Random Days Of Last Week", "Random Day Of The Past 30 Days"];

        const random = function (min, max) { //both inclusive
            return Math.floor(rand() * (max - min + 1)) + min;
        }


        const choiceOne = random(0, firstRoundChoices.length - 1);
        const choiceTwo = random(0, secondRoundChoices.length - 1);
        const choiceThree = random(0, thirdRoundChoices.length - 1);


        let rangeOne = [];
        let rangeTwo = [];
        let rangeThree = [];

        fetch(`${serverOrigin}/api/challenges?searchId=${selectedChallengeId}`, {
            method: "get",
            headers: {
                'Content-Type': 'application/json'
            },
        })
            .then((response) => response.json())
            .then((data) => {
                if (data.success) {
                    setUserInfo1({ id: data.data.first_user_id, name: data.data.first_user.name });
                    setUser1Pfp((
                        <div className={styles.profileImg}
                            style={{
                                backgroundImage: `url("${serverOrigin}/profile-images/${data.data.first_user_id}.jpeg")`, backgroundSize: 'cover',
                                backgroundPosition: 'center center',
                                backgroundRepeat: 'no-repeat',
                            }}
                        ></div>
                    ));
                    setUserInfo2({ id: data.data.second_user_id, name: data.data.second_user.name });
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

                    if (choiceOne === 0 || choiceOne == 3 || choiceOne == 4) { //longest focus last week OR total study time last week OR most studied day last week
                        let startUnix = DateTime.fromSeconds(data.data.datum_point).startOf('week').minus({weeks: 1});
                        let endUnix = DateTime.fromSeconds(data.data.datum_point).endOf('week').minus({weeks: 1});
                        rangeOne = [startUnix, endUnix];
                    }
                    else if (choiceOne === 1 || choiceOne === 2) { //longest focus yesterday OR most studied subject yesterday
                        let startUnix = DateTime.fromSeconds(data.data.datum_point).startOf('day').minus({day: 1});
                        let endUnix = DateTime.fromSeconds(data.data.datum_point).endOf('day').minus({day: 1});
                        rangeOne = [startUnix, endUnix];
                    }


                    if (choiceTwo === 0 || choiceTwo === 2) { //study average last week, subject to subject comparison last week
                        let startUnix = DateTime.fromSeconds(data.data.datum_point).startOf('week').minus({weeks: 1});
                        let endUnix = DateTime.fromSeconds(data.data.datum_point).endOf('week').minus({weeks: 1});
                        rangeTwo = [startUnix, endUnix];
                    }
                    else if (choiceTwo === 1){ //day by day comparison past 7 days
                        let startUnix = DateTime.fromSeconds(data.data.datum_point).startOf('day').minus({days: 7});
                        let endUnix = DateTime.fromSeconds(data.data.datum_point).startOf('day').minus({days: 1});
                        rangeTwo = [startUnix, endUnix];
                    }
                    else if (choiceTwo === 3){ //random day past 7 days
                        let startUnix = DateTime.fromSeconds(data.data.datum_point).minus({ days: random(1, 7) }).startOf('day');
                        let endUnix = startUnix.endOf('day');
                        rangeTwo = [startUnix, endUnix];
                    }


                    if (choiceThree === 0 || choiceThree === 1 || choiceThree === 2) {
                        let startUnix = DateTime.fromSeconds(data.data.datum_point).startOf('week').minus({ weeks: 1});
                        let endUnix = DateTime.fromSeconds(data.data.datum_point).endOf('week').minus({ weeks: 1});
                        rangeThree = [startUnix, endUnix];
                    }
                    else if (choiceThree === 3){
                        let startUnix = DateTime.fromSeconds(data.data.datum_point).minus({ days: random(1, 30) }).startOf('day');
                        let endUnix = startUnix.endOf('day');
                        rangeThree = [startUnix, endUnix];
                    }

                    let tempChallenge = { first: firstRoundChoices[choiceOne], second: secondRoundChoices[choiceTwo], third: thirdRoundChoices[choiceThree], firstRange: rangeOne, secondRange: rangeTwo, thirdRange: rangeThree };
                    setChallenge(tempChallenge);
                }
            })
            .catch((error) => console.error(error));
    }, []);


    useEffect(() => {
        if (!!!userInfo1.id) return;
        fetch(`${serverOrigin}/api/study/bring-subjects`, {
            method: "post",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ searchId: userInfo1.id }),
        })
            .then((response) => response.json())
            .then((data) => {
                if (data.success){
                    setUser1Subjects(timelineSort(data.subjects));
                }
            });
 
 
        fetch(`${serverOrigin}/api/study/bring-subjects`, {
            method: "post",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ searchId: userInfo2.id }),
        })
            .then((response) => response.json())
            .then((data) => {
                if (data.success){
                    setUser2Subjects(timelineSort(data.subjects));
                }
            });
    }, [userInfo1])


    useEffect(() => {
        if (challenge.first === "An Error Occured") return;
        if (!!!user1Subjects) return;

        console.log(user1Subjects, user2Subjects);

        const tempUser1 = {};
        const tempUser2 = {};

        const challengeName1 = challenge.first;
        const challengeName2 = challenge.second;
        const challengeName3 = challenge.third;

        if (challengeName1 === "Longest Focus Last Week"){ //using full name for readability in code
            const dateDiff = DateTime.fromMillis(Date.now()).startOf('week').diff(challenge.firstRange[0], ['weeks']); //start of this week to start of range

            const weeklyIndex1 = user1Subjects.weekly.focus.length - dateDiff.weeks - 1; //index of object (-1 for 0-index)
            if (weeklyIndex1 >= 0){
                tempUser1.value1 = user1Subjects.weekly.focus[weeklyIndex1];
            }
            else{
                tempUser1.value1 = 0; //they were not active last week
            }

            const weeklyIndex2 = user2Subjects.weekly.focus.length - dateDiff.weeks;
            if (weeklyIndex2 >= 0){
                tempUser2.value1 = user2Subjects.weekly.focus[weeklyIndex2];
            }
            else{
                tempUser2.value1 = 0;
            }
            setDescriptionEl1(<h3>Week of {challenge.firstRange[0].toFormat("DD")} ~ {challenge.firstRange[1].toFormat("DD")}</h3>);
        }
        else if (challengeName1 === "Longest Focus Yesterday"){
            const dateDiff = DateTime.fromMillis(Date.now()).startOf('day').diff(challenge.firstRange[0], ['days']);

            const dailyIndex1 = user1Subjects.daily.focus.length - dateDiff.days - 1;
            if (dailyIndex1 >= 0){
                tempUser1.value1 = user1Subjects.daily.focus[dailyIndex1];
            }
            else{
                tempUser1.value1 = 0;
            }

            const dailyIndex2 = user2Subjects.daily.focus.length - dateDiff.days - 1;
            if (dailyIndex2 >= 0){
                tempUser2.value1 = user2Subjects.daily.focus[dailyIndex2];
            }
            else{
                tempUser2.value1 = 0;
            }
            setDescriptionEl1(<h3>On {challenge.firstRange[0].toFormat("DD")}</h3>);
        }
        else if (challengeName1 === "Total Study Time Last Week"){
            const dateDiff = DateTime.fromMillis(Date.now()).startOf('week').diff(challenge.firstRange[0], ['weeks']); //start of this week to start of range

            const weeklyIndex1 = user1Subjects.weekly.groupedTotal.length - dateDiff.weeks - 1; //index of object (-1 for 0-index)
            if (weeklyIndex1 >= 0){
                tempUser1.value1 = user1Subjects.weekly.groupedTotal[weeklyIndex1];
            }
            else{
                tempUser1.value1 = 0; //they were not active last week
            }

            const weeklyIndex2 = user2Subjects.weekly.groupedTotal.length - dateDiff.weeks;
            if (weeklyIndex2 >= 0){
                tempUser2.value1 = user2Subjects.weekly.groupedTotal[weeklyIndex2];
            }
            else{
                tempUser2.value1 = 0;
            }
            setDescriptionEl1(<h3>Week of {challenge.firstRange[0].toFormat("DD")} ~ {challenge.firstRange[1].toFormat("DD")}</h3>);
        }
        else if (challengeName1 === "Most Studied Day Last Week"){
            const dateDiff = DateTime.fromMillis(Date.now()).startOf('week').diff(challenge.firstRange[0], ['days']);

            const dailyIndex1 = user1Subjects.daily.groupedTotal.length - dateDiff.days - 1; //start of last week in daily grouped total
            tempUser1.value1 = 0;
            let mostStudied1 = 0;
            for (let i = dailyIndex1; i < dailyIndex1 + 7; i++){
                if (i >= 0 || i < user1Subjects.daily.groupedTotal.length){ //inside grouped total indexes
                    if (tempUser1.value1 < user1Subjects.daily.groupedTotal[i]){
                        tempUser1.value1 = user1Subjects.daily.groupedTotal[i];
                        mostStudied1 = dailyIndex1 - i; //days after week
                    }
                }
            }

            const dailyIndex2 = user2Subjects.daily.groupedTotal.length - dateDiff.days - 1;
            tempUser2.value1 = 0;
            let mostStudied2 = 0;
            for (let i = dailyIndex2; i < dailyIndex2 + 7; i++){
                if (i >= 0 || i < user2Subjects.daily.groupedTotal.length){
                    if (tempUser2.value1 < user2Subjects.daily.groupedTotal[i]){
                        tempUser2.value1 = user2Subjects.daily.groupedTotal[i];
                        mostStudied2 = dailyIndex2 - i; //days after week
                    }
                }
            }
            setDescriptionEl1(<div>
                <h3>Week of {challenge.firstRange[0].toFormat("DD")} ~ {challenge.firstRange[1].toFormat("DD")}</h3>
                <h3>User 1: {challenge.firstRange[0].plus({days: mostStudied1}).toFormat("DD")}</h3>
                <h3>User 2: {challenge.firstRange[0].plus({days: mostStudied2}).toFormat("DD")}</h3>
            </div>);
        }
        else if (challengeName1 === "Most Studied Subject Yesterday"){
            const dateDiff = DateTime.fromMillis(Date.now()).startOf('day').diff(challenge.firstRange[0], ['days']);

            tempUser1.value1 = 0;
            let bestSubject1 = "None";
            user1Subjects.map((subject) => {
                const dailyIndex1 = subject.daily.total.length - dateDiff.days - 1;
                if (dailyIndex1 >= 0){
                    if (tempUser1.value1 < subject.daily.total[dailyIndex1]){
                        tempUser1.value1 = subject.daily.total[dailyIndex1];
                        bestSubject1 = subject.name;
                    }
                }
            });

            tempUser2.value1 = 0;
            let bestSubject2 = "None";
            user2Subjects.map((subject) => {
                const dailyIndex2 = subject.daily.total.length - dateDiff.days - 1;
                if (dailyIndex2 >= 0){
                    if (tempUser2.value1 < subject.daily.total[dailyIndex2]){
                        tempUser2.value1 = subject.daily.total[dailyIndex2];
                        bestSubject2 = subject.name;
                    }
                }
            });

            setDescriptionEl1(<div>
                <h3>On {challenge.firstRange[0].toFormat("DD")}</h3>
                <h3>User 1 Best Subject: {bestSubject1}</h3>
                <h3>User 2 Best Subject: {bestSubject2}</h3>
            </div>);
        }


        if (challengeName2 === "Study Average Last Week"){
            const dateDiff = DateTime.fromMillis(Date.now()).startOf('week').diff(challenge.firstRange[0], ['weeks']);

            const weeklyIndex1 = user1Subjects.weekly.groupedTotal.length - dateDiff.weeks;
            tempUser1.value2 = 0;
            if (weeklyIndex1 >= 0){
                tempUser1.value2 = user1Subjects.weekly.groupedTotal[weeklyIndex1] / 7; //average
            }

            const weeklyIndex2 = user2Subjects.weekly.groupedTotal.length - dateDiff.weeks;
            tempUser2.value2 = 0;
            if (weeklyIndex2 >= 0){
                tempUser2.vaue2 = user2Subjects.weekly.groupedTotal[weeklyIndex2] / 7;
            }

            setDescriptionEl2(<h3>Week of {challenge.secondRange[0].toFormat("DD")} ~ {challenge.secondRange[1].toFormat("DD")}</h3>);
        }
        else if (challengeName2 === "Day By Day Comparison (Past 7 Days)"){
            const dateDiff = DateTime.fromMillis(Date.now()).startOf('day').diff(challenge.firstRange[0], ['days']);
            
            const startIndex1 = user1Subjects.daily.groupedTotal.length - dateDiff.days; //7 days ago
            const dailyArray1 = Array(7).fill(0);
            let idx = 0;
            for (let i = startIndex1; i < startIndex1 + 7; i++, idx++){
                if (i >= 0 && i < user1Subjects.daily.groupedTotal.length){
                    dailyArray1[idx] = user1Subjects.daily.groupedTotal[i];
                }
            }
            tempUser1.value2 = dailyArray1;

            const startIndex2 = user2Subjects.daily.groupedTotal.length - dateDiff.days; //7 days ago
            const dailyArray2 = Array(7).fill(0);
            idx = 0;
            for (let i = startIndex2; i < startIndex2 + 7; i++, idx++){
                if (i >= 0 && i < user2Subjects.daily.groupedTotal.length){
                    dailyArray2[idx] = user2Subjects.daily.groupedTotal[i];
                }
            }
            tempUser2.value2 = dailyArray2;

            setDescriptionEl2(<h3>Days {challenge.secondRange[0].toFormat("DD")} ~ {challenge.secondRange[1].toFormat("DD")}</h3>);
        }
        else if (challengeName2 === "Subject To Subject Comparison (Last Week)"){
            const dateDiff = DateTime.fromMillis(Date.now()).startOf('week').diff(challenge.firstRange[0], ['weeks']);

            const subjectTimes1 = [];
            user1Subjects.map((subject) => {
                const weeklyIndex = subject.weekly.total.length - dateDiff.weeks;
                if (weeklyIndex >= 0){
                    subjectTimes1.push(0);
                }
                else{
                    subjectTimes1.push(user1Subjects.weekly.total[weeklyIndex]);
                }
            });
            const subjectTimes2 = [];
            user2Subjects.map((subject) => {
                const weeklyIndex = subject.weekly.total.length - dateDiff.weeks;
                if (weeklyIndex >= 0){
                    subjectTimes2.push(0);
                }
                else{
                    subjectTimes2.push(user2Subjects.weekly.total[weeklyIndex]);
                }
            });

            tempUser1.value2 = subjectTimes1;
            tempUser2.value2 = subjectTimes2;

            setDescriptionEl2(<h3>Week of {challenge.secondRange[0].toFormat("DD")} ~ {challenge.secondRange[1].toFormat("DD")}</h3>);
        }

        if (challengeName3 === "Best Ranking Last Week"){
            tempUser1.value3 = 1000000; //ranking
            tempUser2.value3 = 1000000; //ranking
            const startDate = challenge.thirdRange[0].toISO();
            fetch(`${serverOrigin}/api/ranking/user?userId=${userInfo1.id}&mode=${'day'}&date=${startDate}`, {
                method: 'get'
              })
                .then((response) => response.json())
                .then((data) => {
                    data.rankings.data.map((ranking) => {
                        if (ranking.ranking > 0){
                            tempUser1.value3 = Math.min(tempUser1.value3, ranking.ranking);
                        }
                    });
                });

            fetch(`${serverOrigin}/api/ranking/user?userId=${userInfo2.id}&mode=${'day'}&date=${startDate}`, {
                method: 'get'
                })
                .then((response) => response.json())
                .then((data) => {
                    data.rankings.data.map((ranking) => {
                        if (ranking.ranking > 0){
                            tempUser2.value3 = Math.min(tempUser2.value3, ranking.ranking);
                        }
                    });
                });

            setDescriptionEl3(<h3>Week of {challenge.thirdRange[0].toFormat("DD")} ~ {challenge.thirdRange[1].toFormat("DD")}</h3>);
        }
        else if (challengeName3 === "Average Ranking Last Week"){
            tempUser1.value3 = 0; //ranking
            let highValue1 = 0;
            tempUser2.value3 = 0; //ranking
            let highValue2 = 0;
            const startDate = challenge.thirdRange[0].toISO();
            fetch(`${serverOrigin}/api/ranking/user?userId=${userInfo1.id}&mode=${'day'}&date=${startDate}`, {
                method: 'get'
              })
                .then((response) => response.json())
                .then((data) => {
                    data.rankings.data.map((ranking) => {
                        if (ranking.ranking > 0){
                            tempUser1.value3 += ranking.ranking;
                            highValue1 = Math.max(highValue1, ranking.ranking);
                        }
                        else {
                            tempUser1.value3 += highValue1;
                        }
                    });
                });

            fetch(`${serverOrigin}/api/ranking/user?userId=${userInfo2.id}&mode=${'day'}&date=${startDate}`, {
                method: 'get'
                })
                .then((response) => response.json())
                .then((data) => {
                    data.rankings.data.map((ranking) => {
                        if (ranking.ranking > 0){
                            tempUser2.value3 += ranking.ranking;
                            highValue2 = Math.max(highValue2, ranking.ranking);
                        }
                        else {
                            tempUser2.value3 += highValue2;
                        }
                    });
                });

            setDescriptionEl3(<h3>Week of {challenge.thirdRange[0].toFormat("DD")} ~ {challenge.thirdRange[1].toFormat("DD")}</h3>);
        }

        
    }, [user1Subjects]);


    useEffect(() => {
        if (!!!userInfo1.id) return;
        fetch(`${serverOrigin}/api/challenges/?searchUser=${userInfo1.id}`, {
            method: "get",
            headers: {
                'Content-Type': 'application/json'
            },
        })
            .then((response) => response.json())
            .then((data) => {
                setChallengeHistoryEl(data.data.map((challenge, i) => {
                    if (challenge.id != challengeId)
                    return (
                        <div key={i} className={styles.pastChallenge}>
                            <a href={challenge.id}>
                                <h3>{challenge.first_user.name} vs {challenge.second_user.name}</h3>
                            </a>
                            <p>On {DateTime.fromSeconds(challenge.datum_point).toFormat("DD")}</p>
                        </div>
                    )
                }))
            })
    }, [userInfo1]);


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
                    <h2>View Other Challenges With {userInfo1.name}</h2>
                    <div className = {styles.historyContainer}>
                        {challengeHistoryEl}
                    </div>
                </div>
            </div>
        </div>
    )
}


export default Challenge;