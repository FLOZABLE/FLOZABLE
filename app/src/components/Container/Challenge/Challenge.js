import styles from "./Challenge.module.css";
import React, { useState, useEffect, useRef } from 'react';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faV, faS, faSlash } from '@fortawesome/free-solid-svg-icons';

const serverOrigin = process.env.REACT_APP_ORIGIN;

function Challenge({ allMembers, userInfo, isSidebarOpen, isSidebarHovered }) { //allMembers (for link of challenger), userInfo, (fetch challenge on its own)

    const [userInfo1, setUserInfo1] = useState({ id: null, name: null });
    const [userInfo2, setUserInfo2] = useState({ id: null, name: null });
    const [challenge, setChallenge] = useState({})
    const [user1Pfp, setUser1Pfp] = useState((<p>An error occured</p>))
    const [user2Pfp, setUser2Pfp] = useState((<p>An error occured</p>))

    useEffect(() => {
        if (!!!allMembers) return;
        const pathName = window.location.pathname.split('/');
        const selectedChallengeId = pathName[pathName.length - 1];
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
                    setChallenge(data.data);
                    setUserInfo1({id : data.data.first_user_id, name: allMembers.find((member) => member.user_id == data.data.first_user_id).name});
                    setUser1Pfp((
                        <div className={styles.profileImg}
                            style={{
                                backgroundImage: `url("${serverOrigin}/profile-images/${data.data.first_user_id}.jpeg")`, backgroundSize: 'cover',
                                backgroundPosition: 'center center',
                                backgroundRepeat: 'no-repeat',
                            }}
                        ></div>
                    ))
                    setUserInfo2({id : data.data.second_user_id, name: allMembers.find((member) => member.user_id == data.data.second_user_id).name});
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
    }, [allMembers]);

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

                    <div className={styles.firstCompare}>
                        <h1>Round 1</h1>
                        <div className={styles.container}>
                            <div className={styles.firstHalf}>
                                {user1Pfp}
                                <h2>{userInfo1.name}</h2>
                            </div>
                            <div className={styles.secondHalf}>
                                {user2Pfp}
                                <h2>[User 2]</h2>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Challenge;