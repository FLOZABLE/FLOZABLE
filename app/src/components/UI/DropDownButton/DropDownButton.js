import React, { useEffect, useState } from "react";
import styles from "./DropDownButton.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCaretDown } from "@fortawesome/free-solid-svg-icons";

function DropDownButton({ options, setValue, onClick = () => { }, value }) {
  const [clicked, setClicked] = useState(false);

  return (
    <div className={`${styles.DropDownButton} ${clicked ? styles.clicked : ''}`}
      onClick={() => {
        setClicked(!clicked);
      }}
    >
      <div className={styles.disp}>
        {options[value]}
        <i>
          <FontAwesomeIcon icon={faCaretDown} />
        </i>
      </div>
      <ul className={`${styles.options} hiddenScroll overflowDot`}>
        {Object.keys(options).map((option, i) => {
          return (
            <li
              key={i}
              onClick={() => {
                setValue(option);
                setClicked(false);
                onClick();
              }}
              className={`${styles.option} overflowDot`}
            >
              {options[option]}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export default DropDownButton;