import styles from "./Challenge.module.css";
import React, { useState, useEffect } from 'react';
import { DateTime, Duration } from "luxon";
import { timelineSort } from "../../../utils/timelineSorting"
import { cyrb128 } from "../../../utils/Tool";
import parse from "html-react-parser";
import { findLongestFocus, findTotalStudy } from "./ChallengeTools";
import ChallengeCompare from "../../UI/ChallengeCompare/ChallengeCompare";

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
    const [resultEl1, setResultEl1] = useState(<p></p>);
    const [resultEl2, setResultEl2] = useState(<p></p>);
    const [resultEl3, setResultEl3] = useState(<p></p>);
    const [challengeHistoryEl, setChallengeHistoryEl] = useState(<p></p>);
    const [random, setRandom] = useState(null);

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

        setRandom(() => (min, max) => { return (Math.floor(rand() * (max - min + 1)) + min) });
    }, []);

    useEffect(() => {
        if (!!!random) return;

        const firstRoundChoices = ["Longest Focus Last Week", "Longest Focus Yesterday", "Most Studied Subject Yesterday", "Total Study Time Last Week", "Most Studied Day Last Week"];
        const secondRoundChoices = ["Study Average Last Week", "Day By Day Comparison (Past 7 Days)", "Subject To Subject Comparison (Last Week)", "Random Day Of Last Week"];
        const thirdRoundChoices = ["Best Ranking Last Week", "Average Ranking Last Week", "3 Random Days Of Last Week", "Random Day Of The Past 30 Days"];

        const choiceOne = random(0, firstRoundChoices.length - 1);
        const choiceTwo = random(0, secondRoundChoices.length - 1);
        const choiceThree = random(0, thirdRoundChoices.length - 1);


        let rangeOne = [];
        let rangeTwo = [];
        let rangeThree = [];

        fetch(`${serverOrigin}/challenges?searchId=${challengeId}`, {
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
                        let startUnix = DateTime.fromSeconds(data.data.datum_point).startOf('week').minus({ weeks: 1 });
                        let endUnix = DateTime.fromSeconds(data.data.datum_point).endOf('week').minus({ weeks: 1 });
                        rangeOne = [startUnix, endUnix];
                    }
                    else if (choiceOne === 1 || choiceOne === 2) { //longest focus yesterday OR most studied subject yesterday
                        let startUnix = DateTime.fromSeconds(data.data.datum_point).startOf('day').minus({ day: 1 });
                        let endUnix = DateTime.fromSeconds(data.data.datum_point).endOf('day').minus({ day: 1 });
                        rangeOne = [startUnix, endUnix];
                    }


                    if (choiceTwo === 0 || choiceTwo === 2) { //study average last week, subject to subject comparison last week
                        let startUnix = DateTime.fromSeconds(data.data.datum_point).startOf('week').minus({ weeks: 1 });
                        let endUnix = DateTime.fromSeconds(data.data.datum_point).endOf('week').minus({ weeks: 1 });
                        rangeTwo = [startUnix, endUnix];
                    }
                    else if (choiceTwo === 1) { //day by day comparison past 7 days
                        let startUnix = DateTime.fromSeconds(data.data.datum_point).startOf('day').minus({ days: 7 });
                        let endUnix = DateTime.fromSeconds(data.data.datum_point).startOf('day').minus({ days: 1 });
                        rangeTwo = [startUnix, endUnix];
                    }
                    else if (choiceTwo === 3) { //random day past 7 days
                        let startUnix = DateTime.fromSeconds(data.data.datum_point).minus({ days: random(1, 7) }).startOf('day');
                        let endUnix = startUnix.endOf('day');
                        rangeTwo = [startUnix, endUnix];
                    }


                    if (choiceThree === 0 || choiceThree === 1 || choiceThree === 2) {
                        let startUnix = DateTime.fromSeconds(data.data.datum_point).startOf('week').minus({ weeks: 1 });
                        let endUnix = DateTime.fromSeconds(data.data.datum_point).endOf('week').minus({ weeks: 1 });
                        rangeThree = [startUnix, endUnix];
                    }
                    else if (choiceThree === 3) {
                        let startUnix = DateTime.fromSeconds(data.data.datum_point).minus({ days: random(1, 30) }).startOf('day');
                        let endUnix = startUnix.endOf('day');
                        rangeThree = [startUnix, endUnix];
                    }

                    let tempChallenge = { first: firstRoundChoices[choiceOne], second: secondRoundChoices[choiceTwo], third: thirdRoundChoices[choiceThree], firstRange: rangeOne, secondRange: rangeTwo, thirdRange: rangeThree };
                    setChallenge(tempChallenge);
                }
            })
            .catch((error) => console.error(error));
    }, [random]);


    useEffect(() => {
        if (!!!userInfo1.id || !!!userInfo2.id) return;
        fetch(`${serverOrigin}/study/bring-subjects`, {
            method: "post",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ searchId: userInfo1.id }),
        })
            .then((response) => response.json())
            .then((data) => {
                if (data.success) {
                    setUser1Subjects(timelineSort(data.subjects));
                }
            });


        fetch(`${serverOrigin}/study/bring-subjects`, {
            method: "post",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ searchId: userInfo2.id }),
        })
            .then((response) => response.json())
            .then((data) => {
                if (data.success) {
                    setUser2Subjects(timelineSort(data.subjects));
                }
            });
    }, [userInfo1, userInfo2])


    useEffect(() => {
        if (challenge.first === "An Error Occured") return;
        if (!user1Subjects || !user2Subjects) return;


        const tempUser1 = {};
        const tempUser2 = {};

        const challengeName1 = challenge.first;
        const challengeName2 = challenge.second;
        const challengeName3 = challenge.third;

        let waitingForFetch = false;

        if (challengeName1 === "Longest Focus Last Week") { //using full name for readability in code
            tempUser1.value1 = findLongestFocus(user1Subjects, challenge.firstRange[0], "Weekly");
            tempUser2.value1 = findLongestFocus(user2Subjects, challenge.firstRange[0], "Weekly");
            setDescriptionEl1(<h3>Week of {challenge.firstRange[0].toFormat("DD")} ~ {challenge.firstRange[1].toFormat("DD")}</h3>);
        }
        else if (challengeName1 === "Longest Focus Yesterday") {
            tempUser1.value1 = findLongestFocus(user1Subjects, challenge.firstRange[0], "Daily");
            tempUser2.value1 = findLongestFocus(user2Subjects, challenge.firstRange[0], "Daily");
            setDescriptionEl1(<h3>On {challenge.firstRange[0].toFormat("DD")}</h3>);
        }
        else if (challengeName1 === "Total Study Time Last Week") {
            const dateDiff = DateTime.fromMillis(Date.now()).startOf('week').diff(challenge.firstRange[0], ['weeks']); //start of this week to start of range

            const weeklyIndex1 = user1Subjects.weekly.groupedTotal.length - dateDiff.weeks - 1; //index of object (-1 for 0-index)
            if (weeklyIndex1 >= 0) {
                tempUser1.value1 = user1Subjects.weekly.groupedTotal[weeklyIndex1];
            }
            else {
                tempUser1.value1 = 0; //they were not active last week
            }

            const weeklyIndex2 = user2Subjects.weekly.groupedTotal.length - dateDiff.weeks - 1;
            if (weeklyIndex2 >= 0) {
                tempUser2.value1 = user2Subjects.weekly.groupedTotal[weeklyIndex2];
            }
            else {
                tempUser2.value1 = 0;
            }
            setDescriptionEl1(<h3>Week of {challenge.firstRange[0].toFormat("DD")} ~ {challenge.firstRange[1].toFormat("DD")}</h3>);
        }
        else if (challengeName1 === "Most Studied Day Last Week") {
            tempUser1.value1 = 0;
            let mostStudied1 = 1;
            for (let i = 0; i < 7; i++) {
                const startDate = challenge.firstRange[0].plus({ days: i });
                const studiedThisDay = findTotalStudy(user1Subjects, startDate, "Daily");
                if (tempUser1.value1 < studiedThisDay) {
                    tempUser1.value1 = studiedThisDay;
                    mostStudied1 = i;
                }
            }

            tempUser2.value1 = 0;
            let mostStudied2 = 1;
            for (let i = 0; i < 7; i++) {
                const startDate = challenge.firstRange[0].plus({ days: i });
                const studiedThisDay = findTotalStudy(user2Subjects, startDate, "Daily");
                if (tempUser2.value1 < studiedThisDay) {
                    tempUser2.value1 = studiedThisDay;
                    mostStudied2 = i;
                }
            }

            setDescriptionEl1(<div>
                <h3>Week of {challenge.firstRange[0].toFormat("DD")} ~ {challenge.firstRange[1].toFormat("DD")}</h3>
                <h3>User 1: {challenge.firstRange[0].plus({ days: mostStudied1 }).toFormat("DD")}</h3>
                <h3>User 2: {challenge.firstRange[0].plus({ days: mostStudied2 }).toFormat("DD")}</h3>
            </div>);
        }
        else if (challengeName1 === "Most Studied Subject Yesterday") {
            const dateDiff = DateTime.fromMillis(Date.now()).startOf('day').diff(challenge.firstRange[0], ['days']);

            tempUser1.value1 = 0;
            let bestSubject1 = "None";
            user1Subjects.map((subject) => {
                const dailyIndex1 = subject.daily.total.length - dateDiff.days - 1;
                if (dailyIndex1 >= 0) {
                    if (tempUser1.value1 < subject.daily.total[dailyIndex1]) {
                        tempUser1.value1 = subject.daily.total[dailyIndex1];
                        bestSubject1 = subject.name;
                    }
                }
            });

            tempUser2.value1 = 0;
            let bestSubject2 = "None";
            user2Subjects.map((subject) => {
                const dailyIndex2 = subject.daily.total.length - dateDiff.days - 1;
                if (dailyIndex2 >= 0) {
                    if (tempUser2.value1 < subject.daily.total[dailyIndex2]) {
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


        if (challengeName2 === "Study Average Last Week") {
            tempUser1.value2 = findTotalStudy(user1Subjects, challenge.secondRange[0], "Weekly") / 7;
            tempUser2.value2 = findTotalStudy(user2Subjects, challenge.secondRange[0], "Weekly") / 7;
            setDescriptionEl2(<h3>Week of {challenge.secondRange[0].toFormat("DD")} ~ {challenge.secondRange[1].toFormat("DD")}</h3>);
        }
        else if (challengeName2 === "Day By Day Comparison (Past 7 Days)") {
            const dateDiff = DateTime.fromMillis(Date.now()).startOf('day').diff(challenge.secondRange[0], ['days']);

            const startIndex1 = user1Subjects.daily.groupedTotal.length - dateDiff.days - 1; //7 days ago
            const dailyArray1 = Array(7).fill(0);
            let idx = 0;
            for (let i = startIndex1; i < startIndex1 + 7; i++, idx++) {
                if (i >= 0 && i < user1Subjects.daily.groupedTotal.length) {
                    dailyArray1[idx] = user1Subjects.daily.groupedTotal[i];
                }
            }
            tempUser1.value2 = dailyArray1;

            const startIndex2 = user2Subjects.daily.groupedTotal.length - dateDiff.days - 1; //7 days ago
            const dailyArray2 = Array(7).fill(0);
            idx = 0;
            for (let i = startIndex2; i < startIndex2 + 7; i++, idx++) {
                if (i >= 0 && i < user2Subjects.daily.groupedTotal.length) {
                    dailyArray2[idx] = user2Subjects.daily.groupedTotal[i];
                }
            }
            tempUser2.value2 = dailyArray2;

            setDescriptionEl2(<h3>Days {challenge.secondRange[0].toFormat("DD")} ~ {challenge.secondRange[1].toFormat("DD")}</h3>);
        }
        else if (challengeName2 === "Subject To Subject Comparison (Last Week)") {
            const dateDiff = DateTime.fromMillis(Date.now()).startOf('week').diff(challenge.secondRange[0], ['weeks']);

            const subjectTimes1 = [];
            user1Subjects.map((subject) => {
                const weeklyIndex = subject.weekly.total.length - dateDiff.weeks - 1;
                if (weeklyIndex >= 0) {
                    subjectTimes1.push({ name: subject.name, value: user1Subjects.weekly.total[weeklyIndex] });
                }
                else {
                    subjectTimes1.push({ name: subject.name, value: 0 });
                }
            });
            const subjectTimes2 = [];
            user2Subjects.map((subject) => {
                const weeklyIndex = subject.weekly.total.length - dateDiff.weeks - 1;
                if (weeklyIndex >= 0) {
                    subjectTimes2.push({ name: subject.name, value: user2Subjects.weekly.total[weeklyIndex] });
                }
                else {
                    subjectTimes2.push({ name: subject.name, value: 0 });
                }
            });

            tempUser1.value2 = subjectTimes1;
            tempUser2.value2 = subjectTimes2;

            setDescriptionEl2(<h3>Week of {challenge.secondRange[0].toFormat("DD")} ~ {challenge.secondRange[1].toFormat("DD")}</h3>);
        }
        else if (challengeName2 === "Random Day Of Last Week") {
            tempUser1.value2 = findTotalStudy(user1Subjects, challenge.secondRange[0], "Daily");
            tempUser2.value2 = findTotalStudy(user2Subjects, challenge.secondRange[0], "Daily");
            setDescriptionEl2(<h3>On {challenge.thirdRange[0].toFormat("DD")}</h3>);
        }

        if (challengeName3 === "Best Ranking Last Week") {
            waitingForFetch = true;

            tempUser1.value3 = 1000000; //ranking
            tempUser2.value3 = 1000000; //ranking
            const startDate = challenge.thirdRange[0].toISO();

            fetch(`${serverOrigin}/ranking/user?userId=${userInfo1.id}&mode=${'day'}&date=${startDate}`, {
                method: 'get'
            })
                .then((response) => response.json())
                .then((data) => {
                    tempUser1.value3 = data.rankings.maxLength;
                    data.rankings.data.map((ranking) => {
                        if (ranking.ranking >= 0) {
                            tempUser1.value3 = Math.min(tempUser1.value3, ranking.ranking + 1);
                        }
                    });
                    setCompeteInfo1(tempUser1);
                });

            fetch(`${serverOrigin}/ranking/user?userId=${userInfo2.id}&mode=${'day'}&date=${startDate}`, {
                method: 'get'
            })
                .then((response) => response.json())
                .then((data) => {
                    tempUser2.value3 = data.rankings.maxLength;
                    data.rankings.data.map((ranking) => {
                        if (ranking.ranking >= 0) {
                            tempUser2.value3 = Math.min(tempUser2.value3, ranking.ranking + 1);
                        }
                    });
                    setCompeteInfo2(tempUser2);
                });

            setDescriptionEl3(<h3>Week of {challenge.thirdRange[0].toFormat("DD")} ~ {challenge.thirdRange[1].toFormat("DD")}</h3>);
        }
        else if (challengeName3 === "Average Ranking Last Week") {
            waitingForFetch = true;

            tempUser1.value3 = 0; //ranking
            let highValue1 = 0;
            tempUser2.value3 = 0; //ranking
            let highValue2 = 0;
            const startDate = challenge.thirdRange[0].toISO();

            fetch(`${serverOrigin}/ranking/user?userId=${userInfo1.id}&mode=${'day'}&date=${startDate}`, {
                method: 'get'
            })
                .then((response) => response.json())
                .then((data) => {
                    data.rankings.data.map((ranking) => {
                        if (ranking.ranking >= 0) {
                            tempUser1.value3 += ranking.ranking + 1;
                            highValue1 = Math.max(highValue1, ranking.ranking);
                        }
                        else {
                            tempUser1.value3 += data.rankings.maxLength;
                        }
                    });

                    tempUser1.value3 = tempUser1.value3 / 7;
                    setCompeteInfo1(tempUser1);
                });

            fetch(`${serverOrigin}/ranking/user?userId=${userInfo2.id}&mode=${'day'}&date=${startDate}`, {
                method: 'get'
            })
                .then((response) => response.json())
                .then((data) => {
                    data.rankings.data.map((ranking) => {
                        if (ranking.ranking >= 0) {
                            tempUser2.value3 += ranking.ranking + 1;
                            highValue2 = Math.max(highValue2, ranking.ranking);
                        }
                        else {
                            tempUser2.value3 += data.rankings.maxLength;
                        }
                    });

                    tempUser2.value3 = tempUser2.value3 / 7;
                    setCompeteInfo2(tempUser2);
                });

            setDescriptionEl3(<h3>Week of {challenge.thirdRange[0].toFormat("DD")} ~ {challenge.thirdRange[1].toFormat("DD")}</h3>);
        }
        else if (challengeName3 === "3 Random Days Of Last Week") {
            const randomDayAdd = [0, 1, 2, 3, 4, 5, 6];
            const userArr1 = [];
            const userArr2 = [];
            let elString = "<div>"
            for (let i = 0; i < 3; i++) {
                const addDay = random(0, randomDayAdd.length - 1);
                const date = challenge.thirdRange[0].plus({ days: randomDayAdd[addDay] });
                userArr1.push({value: findTotalStudy(user1Subjects, date, "Daily"), days: randomDayAdd[addDay]})
                userArr2.push({value: findTotalStudy(user2Subjects, date, "Daily"), days: randomDayAdd[addDay]})
                randomDayAdd.splice(addDay, 1);
                elString += "<h3>Day " + (i + 1) + ": " + date.toFormat("DD") + "</h3>";
            }
            elString += "</div>";
            tempUser1.value3 = userArr1;
            tempUser2.value3 = userArr2;
            setDescriptionEl3(parse(elString));
        }
        else if (challengeName3 === "Random Day Of The Past 30 Days") {
            tempUser1.value3 = findTotalStudy(user1Subjects, challenge.thirdRange[0], "Daily");
            tempUser2.value3 = findTotalStudy(user2Subjects, challenge.thirdRange[0], "Daily");
            setDescriptionEl3(<h3>On {challenge.thirdRange[0].toFormat("DD")}</h3>);
        }



        if (!waitingForFetch) {
            setCompeteInfo1(tempUser1);
            setCompeteInfo2(tempUser2);
        }

    }, [user1Subjects, user2Subjects]);


    useEffect(() => {
        if (!("value1" in competeInfo1) || !("value1" in competeInfo2)) return;

        if (challenge.first === "Longest Focus Last Week" || challenge.first === "Longest Focus Yesterday" || challenge.first === "Total Study Time Last Week") {
            setResultEl1(
                <ChallengeCompare value1={competeInfo1.value1} value2={competeInfo2.value1} user1Pfp={user1Pfp} user2Pfp={user2Pfp} userInfo1={userInfo1} userInfo2={userInfo2}/>
            );
        }
        else if (challenge.first === "Most Studied Subject Yesterday") {
            setResultEl1( //make it show the subject
                <ChallengeCompare value1={competeInfo1.value1} value2={competeInfo2.value1} user1Pfp={user1Pfp} user2Pfp={user2Pfp} userInfo1={userInfo1} userInfo2={userInfo2}/>
            );
        }
        else if (challenge.first === "Most Studied Day Last Week") {
            setResultEl1( //make it show the day
                <ChallengeCompare value1={competeInfo1.value1} value2={competeInfo2.value1} user1Pfp={user1Pfp} user2Pfp={user2Pfp} userInfo1={userInfo1} userInfo2={userInfo2}/>
            );
        }


        if (challenge.second === "Study Average Last Week") {
            setResultEl2(
                <ChallengeCompare value1={competeInfo1.value2} value2={competeInfo2.value2} user1Pfp={user1Pfp} user2Pfp={user2Pfp} userInfo1={userInfo1} userInfo2={userInfo2}/>
            );
        }
        else if (challenge.second === "Random Day Of Last Week") {
            setResultEl2(
                <ChallengeCompare value1={competeInfo1.value2} value2={competeInfo2.value2} user1Pfp={user1Pfp} user2Pfp={user2Pfp} userInfo1={userInfo1} userInfo2={userInfo2}/>
            );
        }
        else if (challenge.second === "Day By Day Comparison (Past 7 Days)") {
            const value1 = competeInfo1.value2;
            const value2 = competeInfo2.value2;

            setResultEl2(
                <div>
                    <div className={styles.firstHalf}>
                        {user1Pfp}
                        <h2>{userInfo1.name}</h2>
                    </div>
                    <div className={styles.secondHalf}>
                        {user2Pfp}
                        <h2>{userInfo2.name}</h2>
                    </div>
                    <div className={styles.multipleCompare}>
                        <div className={styles.leftCompare}>
                            {
                                value1.map((studySeconds, i) => {
                                    return (
                                        <div key={i} className={styles.compareElement}>
                                            <p>{Duration.fromObject({ seconds: studySeconds }).toFormat("h'H 'mm'M 'ss'S'")}</p>
                                        </div>
                                    );
                                })
                            }
                        </div>
                        <div className={styles.middleCompare}>
                            {
                                [0, 1, 2, 3, 4, 5, 6].map((val, i) => {
                                    return (
                                        <div key={i} className={`${styles.compareElement} ${styles.circle}`}>
                                            <p>{challenge.secondRange[0].plus({ days: val }).toLocaleString({ month: 'long', day: 'numeric' })}</p>
                                        </div>
                                    );
                                })
                            }
                        </div>
                        <div className={styles.rightCompare}>
                            {
                                value2.map((studySeconds, i) => {
                                    return (
                                        <div key={i} className={styles.compareElement}>
                                            <p>{Duration.fromObject({ seconds: studySeconds }).toFormat("h'H 'mm'M 'ss'S'")}</p>
                                        </div>
                                    );
                                })
                            }
                        </div>
                    </div>
                </div>
            );
        }
        else if (challenge.second === "Subject To Subject Comparison (Last Week)") {
            let value1 = competeInfo1.value2.sort((a, b) => b.value - a.value);
            let value2 = competeInfo2.value2.sort((a, b) => b.value - a.value);

            while (value1.length < 3) {
                value1.push({ name: "None", value: 0 });
            }
            while (value2.length < 3) {
                value2.push({ name: "None", value: 0 });
            }

            setResultEl2(
                <div>
                    <div className={styles.firstHalf}>
                        {user1Pfp}
                        <h2>{userInfo1.name}</h2>
                        <div className={styles.statContainer}>
                            {
                                value1.slice(0, 3).map((val, i) => {
                                    return (
                                        <div key={i}>
                                            <p>{Duration.fromObject({ seconds: val.value }).toFormat("h'H 'mm'M 'ss'S'")}</p>
                                            <p>Subject: {val.name}</p>
                                        </div>
                                    );
                                })
                            }
                        </div>
                    </div>
                    <div className={styles.secondHalf}>
                        {user2Pfp}
                        <h2>{userInfo2.name}</h2>
                        <div className={styles.statContainer}>
                            {
                                value2.slice(0, 3).map((val, i) => {
                                    return (
                                        <div key={i}>
                                            <p>{Duration.fromObject({ seconds: val.value }).toFormat("h'H 'mm'M 'ss'S'")}</p>
                                            <p>Subject: {val.name}</p>
                                        </div>
                                    );
                                })
                            }
                        </div>
                    </div>
                </div>
            );
        }

        if (challenge.third === "Best Ranking Last Week") {
            const value1 = competeInfo1.value3;
            const value2 = competeInfo2.value3;
            const morePercentage = Math.max(value1, value2) - Math.min(value1, value2);
            let percentageEl1 = <div></div>;
            let percentageEl2 = <div></div>;
            if (value1 > value2) {
                percentageEl1 = <div><p>+{morePercentage}</p></div>
            }
            else if (value2 > value1) {
                percentageEl2 = <div><p>+{morePercentage}</p></div>
            }
            //Make it tell the day
            setResultEl3(
                <div>
                    <div className={styles.firstHalf}>
                        {user1Pfp}
                        <h2>{userInfo1.name}</h2>
                        <div className={styles.statContainer}>
                            Ranked: #{value1}
                            {percentageEl1}
                        </div>
                    </div>
                    <div className={styles.secondHalf}>
                        {user2Pfp}
                        <h2>{userInfo2.name}</h2>
                        <div className={styles.statContainer}>
                            Ranked: #{value2}
                            {percentageEl2}
                        </div>
                    </div>
                </div>
            );
        }
        else if (challenge.third === "Average Ranking Last Week") {
            const value1 = Math.round(competeInfo1.value3 * 10) / 10;
            const value2 = Math.round(competeInfo2.value3 * 10) / 10;
            const morePercentage = Math.max(value1, value2) - Math.min(value1, value2);
            let percentageEl1 = <div></div>;
            let percentageEl2 = <div></div>;
            if (value1 > value2) {
                percentageEl1 = <div><p>+{morePercentage}</p></div>
            }
            else if (value2 > value1) {
                percentageEl2 = <div><p>+{morePercentage}</p></div>
            }
            //Make it tell the day
            setResultEl3(
                <div>
                    <div className={styles.firstHalf}>
                        {user1Pfp}
                        <h2>{userInfo1.name}</h2>
                        <div className={styles.statContainer}>
                            Average Ranking: #{value1}
                            {percentageEl1}
                        </div>
                    </div>
                    <div className={styles.secondHalf}>
                        {user2Pfp}
                        <h2>{userInfo2.name}</h2>
                        <div className={styles.statContainer}>
                            Average Ranking: #{value2}
                            {percentageEl2}
                        </div>
                    </div>
                </div>
            );
        }
        else if (challenge.third === "3 Random Days Of Last Week") {
            const value1 = competeInfo1.value3;
            const value2 = competeInfo2.value3;

            setResultEl3(
                <div>
                    <div className={styles.firstHalf}>
                        {user1Pfp}
                        <h2>{userInfo1.name}</h2>
                        <div className={styles.statContainer}>
                            {
                                value1.map((val, i) => {
                                    return (
                                        <div key={i}>
                                            <p>{Duration.fromObject({ seconds: val.value }).toFormat("h'H 'mm'M 'ss'S'")}</p>
                                            <p>On {challenge.thirdRange[0].plus({ days: val.days }).toFormat("DD")}</p>
                                        </div>
                                    );
                                })
                            }
                        </div>
                    </div>
                    <div className={styles.secondHalf}>
                        {user2Pfp}
                        <h2>{userInfo2.name}</h2>
                        <div className={styles.statContainer}>
                            {
                                value2.map((val, i) => {
                                    return (
                                        <div key={i}>
                                            <p>{Duration.fromObject({ seconds: val.value }).toFormat("h'H 'mm'M 'ss'S'")}</p>
                                            <p>On {challenge.thirdRange[0].plus({ days: val.days }).toFormat("DD")}</p>
                                        </div>
                                    );
                                })
                            }
                        </div>
                    </div>
                </div>
            );
        }
        else if (challenge.third === "Random Day Of The Past 30 Days") {
            const value1 = competeInfo1.value3;
            const value2 = competeInfo2.value3;
            const morePercentage = Math.round((Math.max(value1, value2) / Math.min(value1, value2)) * 1000) / 10 - 100; //round to 1 place
            let percentageEl1 = <div></div>;
            let percentageEl2 = <div></div>;
            if (value1 > value2) {
                percentageEl1 = <div><p>+ {morePercentage}%</p></div>
            }
            else if (value2 > value1) {
                percentageEl2 = <div><p>+ {morePercentage}%</p></div>
            }

            setResultEl3(
                <div>
                    <div className={styles.firstHalf}>
                        {user1Pfp}
                        <h2>{userInfo1.name}</h2>
                        <div className={styles.statContainer}>
                            {Duration.fromObject({ seconds: value1 }).toFormat("h'H 'mm'M 'ss'S'")}
                            <p>On {challenge.thirdRange[0].toFormat("DD")}</p>
                            {percentageEl1}
                        </div>
                    </div>
                    <div className={styles.secondHalf}>
                        {user2Pfp}
                        <h2>{userInfo2.name}</h2>
                        <div className={styles.statContainer}>
                            {Duration.fromObject({ seconds: value2 }).toFormat("h'H 'mm'M 'ss'S'")}
                            <p>On {challenge.thirdRange[0].toFormat("DD")}</p>
                            {percentageEl2}
                        </div>
                    </div>
                </div>
            );
        }

    }, [competeInfo1, competeInfo2]);


    useEffect(() => {
        if (!!!userInfo1.id) return;
        fetch(`${serverOrigin}/challenges/?searchUser=${userInfo1.id}`, {
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
                            {resultEl1}
                        </div>
                    </div>


                    <div className={styles.compareContainer}>
                        <h1>Round 2 - Habbit and Consistency</h1>
                        <h2>{challenge.second}</h2>
                        {descriptionEl2}
                        <div className={styles.container}>
                            {resultEl2}
                        </div>
                    </div>


                    <div className={styles.compareContainer}>
                        <h1>Round 3 - Wild Card!</h1>
                        <h2>{challenge.third}</h2>
                        {descriptionEl3}
                        <div className={styles.container}>
                            {resultEl3}
                        </div>
                    </div>
                </div>

                <div className={styles.ChallengeHistory}>
                    <h2>View Other Challenges With {userInfo1.name}</h2>
                    <div className={styles.historyContainer}>
                        {challengeHistoryEl}
                    </div>
                </div>
            </div>
        </div>
    )
}


export default Challenge;