import styles from "./SlidingOptBtn.module.css";
import React from 'react';

function SlidingOptBtn({ options, setValue, value }) {
  return (
    <div className={styles.SlidingOptBtn}>
      <div className={styles.focusDisp} style={{ width: `calc(100% / ${Object.keys(options).length})`, left: `calc(100% / ${Object.keys(options).length} * ${value}) ` }} >
      </div>
      <div className={styles.optionsWrapper}>
        {Object.keys(options).map((option, i) => {
          return (
            <div className={styles.option} key={i} onClick={() => { setValue(option) }}>
              <p>{options[option]}</p>
            </div>
          )
        })}
      </div>
    </div>
  )
};

export default SlidingOptBtn;