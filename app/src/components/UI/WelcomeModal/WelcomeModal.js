import React, { useState, useEffect } from 'react';
import styles from "./WelcomeModal.module.css";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import BlobBtn from '../BlobBtn/BlobBtn';
import Confetti from 'react-confetti';

function WelcomeModal({ userInfo }) {
  const navigate = useNavigate();
  const [isModal, setIsModal] = useState(false);

  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    const isNew = searchParams.get('welcome');
    console.log('new', isNew);
    if (isNew === "true") {
      console.log('new', isNew);
      setIsModal(true);
    } else {
      setIsModal(false);
    }
  }, [searchParams]);

  return (
    <div
      to="/dashboard?tutorial=1"
      className={`${styles.WelcomeModal} ${isModal ? styles.open : ''}`}
    >
      <Confetti
        width={window.innerWidth}
        height={window.innerHeight}
        recycle={false}
        numberOfPieces={500}
        confettiSource={{ x: 0, y: -10, w: window.innerWidth, h: 0 }}
      />
      <div className={styles.modal}>
        <p>
          Welcome to FLOZABLE!
        </p>
        <p className={styles.description}>
          Hey {userInfo?.name}, let's get you all set up with this tutorial
          <br/>
          We hope your journey in studying is successful
        </p>
        <div className={styles.buttons}>
          <div className={styles.blobWrapper}>
            <BlobBtn
              name={"Begin!"}
              setClicked={() => {
                setIsModal(false);
                navigate("/dashboard?tutorial=1")
              }}
              color1={"#fff"}
              color2={"var(--purple2)"}
            />
          </div>
          <button className={styles.skipBtn} onClick={() => {
            searchParams.delete('welcome');
            setSearchParams(searchParams);
          }}>
            or Skip Tutorial
          </button>
        </div>
      </div>
    </div>
  )
}

export default WelcomeModal;