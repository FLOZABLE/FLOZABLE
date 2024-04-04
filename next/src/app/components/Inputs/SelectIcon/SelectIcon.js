import React from "react";
import styles from "./SelectIcon.module.css";
import { subjectIcons } from "@/utils/Constant";
/* import {
  WritePen,
  Book,
  Microscope,
  Article,
  Coding,
  Globe,
  Workout,
  Alert,
} from "../../../utils/svgs"; */

function SelectIcon({
  selectedIcon,
  setSelectedIcon,
  isSelectIcon,
  setIsSelectIcon,
  setIsSelectColor,
  id = ""
}) {
  function handleSelect(iconInfo) {
    setSelectedIcon(iconInfo);
    setIsSelectIcon(false);
  }

  return (
    <div className={styles.SelectIcon}>
      <div className={styles.header}>
        <button
          id={id}
          onClick={() => {
            setIsSelectIcon(!isSelectIcon);
            setIsSelectColor(false);
          }}
        >
          {!selectedIcon.el ? (
            <p>Select Subject&#39;s Icon!</p>
          ) : (
            <p>Selected Icon: </p>
          )}
        </button>
        <div
          className={styles.selectedIcon}
          id={id}
          onClick={() => {
            setIsSelectIcon(!isSelectIcon);
            setIsSelectColor(false);
          }}
        >
          {selectedIcon.el}
        </div>
      </div>
      <div className={`${styles.icons} ${isSelectIcon ? styles.open : ""}`}>
        {Object.keys(subjectIcons).map((subject, i) => {
          return (
            <div
              className={styles.iconWrapper}
              id={id}
              key={i}
              onClick={() => {
                handleSelect({
                  name: subject,
                  el: (
                    subjectIcons[subject]
                  ),
                });
              }}
            >
              {subjectIcons[subject]}
            </div>
          )
        })}
      </div>
    </div>
  );
}

export default SelectIcon;