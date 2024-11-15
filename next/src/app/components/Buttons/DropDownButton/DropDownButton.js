"use client";

import React, { useEffect, useState } from "react";
import styles from "./DropDownButton.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCaretDown } from "@fortawesome/free-solid-svg-icons";

function DropDownButton({ options, setValue, onClick = () => {}, value }) {
  const [clicked, setClicked] = useState(false);
  const [disp, setDisp] = useState(null);

  useEffect(() => {
    const disp = options.find((option) => option.value === value);
    if (!disp) return;
    setDisp(disp.name);
  }, [value, options]);

  return (
    <div
      className={`${styles.DropDownButton} ${clicked ? styles.clicked : ""}`}
      onClick={() => {
        setClicked(!clicked);
      }}
    >
      <div className={styles.disp}>
        {disp}
        <i>
          <FontAwesomeIcon icon={faCaretDown} />
        </i>
      </div>
      <ul className={`${styles.options} hiddenScroll overflowDot`}>
        {options.map((option, i) => {
          return (
            <li
              key={i}
              onClick={() => {
                setValue(option.value);
                setClicked(false);
                onClick();
              }}
              className={`${styles.option} overflowDot`}
            >
              {option.name}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export default DropDownButton;
