import React from "react";
import styles from "./SelectIcon.module.css";
import {
  WritePen,
  Book,
  Microscope,
  Article,
  Coding,
  Globe,
  Workout,
  Alert,
} from "../../../utils/svgs";

function SelectIcon({
  selectedIcon,
  setSelectedIcon,
  isSelectIcon,
  setIsSelectIcon,
  setIsSelectColor,
}) {
  function handleSelect(iconInfo) {
    setSelectedIcon(iconInfo);
    setIsSelectIcon(false);
  }

  return (
    <div className={styles.selectIcon}>
      <div className={styles.header}>
        <button
          onClick={() => {
            setIsSelectIcon(!isSelectIcon);
            setIsSelectColor(false);
          }}
        >
          {!selectedIcon.el ? (
            <p>Select Subject's Icon!</p>
          ) : (
            <p>Selected Icon: </p>
          )}
        </button>
        <div className={styles.selectedIcon}>{selectedIcon.el}</div>
      </div>
      <div className={`${styles.icons} ${isSelectIcon ? styles.open : ""}`}>
        <div
          className={styles.iconWrapper}
          onClick={() => {
            handleSelect({
              name: "WritePen",
              el: (
                <WritePen
                  width={"40px"}
                  height={"40px"}
                  fill={"#000"}
                  opt1={"#000"}
                />
              ),
            });
          }}
        >
          <WritePen
            width={"40px"}
            height={"40px"}
            fill={"#000"}
            opt1={"#000"}
          />
        </div>
        <div
          className={styles.iconWrapper}
          onClick={() => {
            handleSelect({
              name: "Book",
              el: (
                <Book
                  width={"40px"}
                  height={"40px"}
                  fill={"#000"}
                  opt1={"#000"}
                />
              ),
            });
          }}
        >
          <Book width={"40px"} height={"40px"} fill={"#000"} opt1={"#000"} />
        </div>
        <div
          className={styles.iconWrapper}
          onClick={() => {
            handleSelect({
              name: "Microscope",
              el: (
                <Microscope
                  width={"40px"}
                  height={"40px"}
                  fill={"#000"}
                  opt1={"#000"}
                />
              ),
            });
          }}
        >
          <Microscope
            width={"40px"}
            height={"40px"}
            fill={"#000"}
            opt1={"#000"}
          />
        </div>
        <div
          className={styles.iconWrapper}
          onClick={() => {
            handleSelect({
              name: "Article",
              el: (
                <Article
                  width={"40px"}
                  height={"40px"}
                  fill={"#000"}
                  opt1={"#000"}
                />
              ),
            });
          }}
        >
          <Article width={"40px"} height={"40px"} fill={"#000"} opt1={"#000"} />
        </div>
        <div
          className={styles.iconWrapper}
          onClick={() => {
            handleSelect({
              name: "Coding",
              el: (
                <Coding
                  width={"40px"}
                  height={"40px"}
                  fill={"#000"}
                  opt1={"#000"}
                />
              ),
            });
          }}
        >
          <Coding width={"40px"} height={"40px"} fill={"#000"} opt1={"#000"} />
        </div>
        <div
          className={styles.iconWrapper}
          onClick={() => {
            handleSelect({
              name: "Globe",
              el: (
                <Globe
                  width={"40px"}
                  height={"40px"}
                  fill={"#000"}
                  opt1={"#000"}
                />
              ),
            });
          }}
        >
          <Globe width={"40px"} height={"40px"} fill={"#000"} opt1={"#000"} />
        </div>
        <div
          className={styles.iconWrapper}
          onClick={() => {
            handleSelect({
              name: "Workout",
              el: (
                <Workout
                  width={"40px"}
                  height={"40px"}
                  fill={"#000"}
                  opt1={"#000"}
                />
              ),
            });
          }}
        >
          <Workout width={"40px"} height={"40px"} fill={"#000"} opt1={"#000"} />
        </div>
        <div
          className={styles.iconWrapper}
          onClick={() => {
            handleSelect({
              name: "Alert",
              el: (
                <Alert
                  width={"40px"}
                  height={"40px"}
                  fill={"#000"}
                  opt1={"#000"}
                />
              ),
            });
          }}
        >
          <Alert width={"40px"} height={"40px"} fill={"#000"} opt1={"#000"} />
        </div>
      </div>
    </div>
  );
}

export default SelectIcon;
