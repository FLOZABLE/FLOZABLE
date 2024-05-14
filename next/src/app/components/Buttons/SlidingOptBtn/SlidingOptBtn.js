import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import styles from "./SlidingOptBtn.module.css";
import React from 'react';
import { faCheck } from "@fortawesome/free-solid-svg-icons";

function SlidingOptBtn({ options, setValue, value }) {
  return (
    <div className={styles.SlidingOptBtn}>
      <div className={styles.focusDisp} style={{ width: `calc(100% / ${Object.keys(options).length})`, left: `calc(100% / ${Object.keys(options).length} * ${value}) ` }} >
      </div>
      <div className={styles.optionsWrapper}>
        {Object.keys(options).map((option, i) => {
          return (
            <div className={styles.option} key={i} onClick={() => { setValue(option) }}>
              <i className={`${option === value ? styles.on : ''} ${styles.check}`}>
              <FontAwesomeIcon icon={faCheck} />
              </i>
              <p>{options[option]}</p>
            </div>
          )
        })}
      </div>
    </div>
  )
};

export default SlidingOptBtn;