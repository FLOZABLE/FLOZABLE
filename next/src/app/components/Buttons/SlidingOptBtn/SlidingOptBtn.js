import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import styles from "./SlidingOptBtn.module.css";
import React from "react";
import { faCheck } from "@fortawesome/free-solid-svg-icons";

function SlidingOptBtn({ options, setValue, value, isCheck }) {
  return (
    <div className={styles.SlidingOptBtn}>
      <div
        className={styles.focusDisp}
        style={{
          width: `calc(100% / ${Object.keys(options).length})`,
          left: `calc(100% / ${Object.keys(options).length} * ${value}) `,
        }}
      ></div>
      <div className={styles.optionsWrapper}>
        {options.map((option, i) => {
          return (
            <div
              className={`${option.value === value ? styles.on : ""} ${
                styles.option
              }`}
              key={i}
              onClick={() => {
                setValue(option.value);
              }}
            >
              {isCheck ? (
                <i className={styles.check}>
                  <FontAwesomeIcon icon={faCheck} />
                </i>
              ) : null}
              <p>{option.name}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default SlidingOptBtn;
