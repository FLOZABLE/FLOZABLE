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
            <p>Select Subject's Icon!</p>
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
        <div
          className={styles.iconWrapper}
          id={id}
          onClick={() => {
            handleSelect({
              name: "WritePen",
              el: (
                <WritePen
                  width={"2.5rem"}
                  height={"2.5rem"}
                  fill={"#000"}
                  opt1={"#000"}
                />
              ),
            });
          }}
        >
          <WritePen
            width={"2.5rem"}
            height={"2.5rem"}
            fill={"#000"}
            opt1={"#000"}
          />
        </div>
        <div
          className={styles.iconWrapper}
          id={id}
          onClick={() => {
            handleSelect({
              name: "Book",
              el: (
                <Book
                  width={"2.5rem"}
                  height={"2.5rem"}
                  fill={"#000"}
                  opt1={"#000"}
                />
              ),
            });
          }}
        >
          <Book
            width={"2.5rem"}
            height={"2.5rem"}
            fill={"#000"}
            opt1={"#000"}
          />
        </div>
        <div
          className={styles.iconWrapper}
          id={id}
          onClick={() => {
            handleSelect({
              name: "Microscope",
              el: (
                <Microscope
                  width={"2.5rem"}
                  height={"2.5rem"}
                  fill={"#000"}
                  opt1={"#000"}
                />
              ),
            });
          }}
        >
          <Microscope
            width={"2.5rem"}
            height={"2.5rem"}
            fill={"#000"}
            opt1={"#000"}
          />
        </div>
        <div
          className={styles.iconWrapper}
          id={id}
          onClick={() => {
            handleSelect({
              name: "Article",
              el: (
                <Article
                  width={"2.5rem"}
                  height={"2.5rem"}
                  fill={"#000"}
                  opt1={"#000"}
                />
              ),
            });
          }}
        >
          <Article
            width={"2.5rem"}
            height={"2.5rem"}
            fill={"#000"}
            opt1={"#000"}
          />
        </div>
        <div
          className={styles.iconWrapper}
          id={id}
          onClick={() => {
            handleSelect({
              name: "Coding",
              el: (
                <Coding
                  width={"2.5rem"}
                  height={"2.5rem"}
                  fill={"#000"}
                  opt1={"#000"}
                />
              ),
            });
          }}
        >
          <Coding
            width={"2.5rem"}
            height={"2.5rem"}
            fill={"#000"}
            opt1={"#000"}
          />
        </div>
        <div
          className={styles.iconWrapper}
          id={id}
          onClick={() => {
            handleSelect({
              name: "Globe",
              el: (
                <Globe
                  width={"2.5rem"}
                  height={"2.5rem"}
                  fill={"#000"}
                  opt1={"#000"}
                />
              ),
            });
          }}
        >
          <Globe
            width={"2.5rem"}
            height={"2.5rem"}
            fill={"#000"}
            opt1={"#000"}
          />
        </div>
        <div
          className={styles.iconWrapper}
          id={id}
          onClick={() => {
            handleSelect({
              name: "Workout",
              el: (
                <Workout
                  width={"2.5rem"}
                  height={"2.5rem"}
                  fill={"#000"}
                  opt1={"#000"}
                />
              ),
            });
          }}
        >
          <Workout
            width={"2.5rem"}
            height={"2.5rem"}
            fill={"#000"}
            opt1={"#000"}
          />
        </div>
        <div
          className={styles.iconWrapper}
          id={id}
          onClick={() => {
            handleSelect({
              name: "Alert",
              el: (
                <Alert
                  width={"2.5rem"}
                  height={"2.5rem"}
                  fill={"#000"}
                  opt1={"#000"}
                />
              ),
            });
          }}
        >
          <Alert
            width={"2.5rem"}
            height={"2.5rem"}
            fill={"#000"}
            opt1={"#000"}
          />
        </div>
      </div>
    </div>
  );
}

export default SelectIcon;