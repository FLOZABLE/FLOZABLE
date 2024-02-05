import React, { useEffect, useState } from "react";
import styles from "./DropDownButton.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCaretDown } from "@fortawesome/free-solid-svg-icons";

function DropDownButton({ options, setValue }) {
  const [clicked, setClicked] = useState(false);
  const [dispVal, setDispVal] = useState(null);

  useEffect(() => {
    if (dispVal === null && options && options[0]) {
      const { value, name } = options[0];
      setValue(value);
      setDispVal(name);
    }
  }, [options]);

  return (
    <div className={styles.DropDownButton}>
      <button
        className={`${clicked ? styles.clicked : ""}`}
        onClick={() => {
          setClicked(!clicked);
        }}
      >
        {dispVal}
        <i>
          <FontAwesomeIcon icon={faCaretDown} />
        </i>
      </button>
      <ul className={`${styles.options} customScroll overflowDot`}>
        {options.map((option, i) => {
          return (
            <li
              key={i}
              onClick={() => {
                console.log(option.value);
                setValue(option.value);
                setDispVal(option.name);
                setClicked(false);
              }}
              className={styles.option}
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