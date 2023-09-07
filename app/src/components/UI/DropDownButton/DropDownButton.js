import React, { useEffect, useState } from "react";
import styles from "./DropDownButton.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCaretDown } from "@fortawesome/free-solid-svg-icons";

function DropDownButton(props) {
  const [options, setOptions] = useState([]);
  const [index, setIndex] = useState(props.defaultIndex);
  const [clicked, setClicked] = useState(false);

  useEffect(() => {
    setOptions(props.options.map((option, i) => {
      return (
        <li key={i} onClick={() => {setIndex(i);setClicked(false);props.setValue(option.value)}} className={styles.option}>
          {option.name}
        </li>
      )
    }));
  }, [props.options]);

  /* useEffect(() => {
    setIndex()
  }, []) */

  return (
    <div className={styles.DropDownButton}>
      <button className={`${clicked ? styles.clicked : ''}`} onClick={() => {setClicked(!clicked)}}>
        {options[index]}
        <i>
          <FontAwesomeIcon icon={faCaretDown} />
        </i>
      </button>
      <ul className={`${styles.options} customScroll`}>
        {options}
      </ul>
    </div>
  );
};

export default DropDownButton;