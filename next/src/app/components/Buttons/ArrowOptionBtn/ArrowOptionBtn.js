import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import styles from "./ArrowOptionBtn.module.css";
import { faArrowUp } from "@fortawesome/free-solid-svg-icons";
import React from 'react';

function ArrowOptionBtn({ clicked, setClicked }) {
  return (
    <div className={styles.ArrowOptionBtn}>
      <div className={styles.options}>
        <p
          onClick={() => {
            setClicked(false);
          }}
        >
          LOG IN
        </p>
        <p
          onClick={() => {
            setClicked(true);
          }}
        >
          SIGN UP
        </p>
      </div>
      <div
        className={styles.slider}
        onClick={() => {
          setClicked(!clicked);
        }}
      >
        <div
          className={`${styles.arrow} ${clicked ? styles.clicked : ""}`}
          onClick={() => {
            setClicked(!clicked);
          }}
        >
          <FontAwesomeIcon icon={faArrowUp} />
        </div>
      </div>
    </div>
  );
}

export default ArrowOptionBtn;