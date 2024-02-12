import React from "react";
import styles from "./SelectTool.module.css";
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

function SelectTool({
  selectedTool,
  setSelectedTool,
  isSelectTool,
  setIsSelectTool,
  setIsSelectColor,
}) {

  function handleSelect(iconInfo) {
    setSelectedTool(prev => ([...prev, iconInfo]));

    //setIsSelectTool(false);
  }

  return (
    <div className={styles.selectIcon}>
      <div className={styles.header}>
        <button
          onClick={() => {
            setIsSelectTool(!isSelectTool);
            setIsSelectColor(false);
          }}
        >
          {!selectedTool.el ? (
            <p>Select Subject's Tools!</p>
          ) : (
            <p>Selected Tools: </p>
          )}
        </button>
        <div className={styles.selectedTool}
          onClick={() => {
            setIsSelectTool(!isSelectTool);
            setIsSelectColor(false);
          }}
        >{selectedTool}</div>
      </div>
      <div className={`${styles.icons} ${isSelectTool ? styles.open : ""}`}>
        <div
          className={styles.iconWrapper}
          onClick={() => {
            /* handleSelect({
              name: "WritePen",
              el: (
                <WritePen
                  width={"40px"}
                  height={"40px"}
                  fill={"#000"}
                  opt1={"#000"}
                />
              ),
            }); */
            setSelectedTool(prev => ([...prev, "WritePen"]));
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
            /* handleSelect({
              name: "Book",
              el: (
                <Book
                  width={"40px"}
                  height={"40px"}
                  fill={"#000"}
                  opt1={"#000"}
                />
              ),
            }); */
            setSelectedTool(prev => ([...prev, "Book"]));
          }}
        >
          <Book width={"40px"} height={"40px"} fill={"#000"} opt1={"#000"} />
        </div>
        <div
          className={styles.iconWrapper}
          onClick={() => {
            /* handleSelect({
              name: "Microscope",
              el: (
                <Microscope
                  width={"40px"}
                  height={"40px"}
                  fill={"#000"}
                  opt1={"#000"}
                />
              ),
            }); */
            setSelectedTool(prev => ([...prev, "Microscope"]));
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
            /* handleSelect({
              name: "Article",
              el: (
                <Article
                  width={"40px"}
                  height={"40px"}
                  fill={"#000"}
                  opt1={"#000"}
                />
              ),
            }); */
            setSelectedTool(prev => ([...prev, "Article"]));
          }}
        >
          <Article width={"40px"} height={"40px"} fill={"#000"} opt1={"#000"} />
        </div>
        <div
          className={styles.iconWrapper}
          onClick={() => {
            /* handleSelect({
              name: "Coding",
              el: (
                <Coding
                  width={"40px"}
                  height={"40px"}
                  fill={"#000"}
                  opt1={"#000"}
                />
              ),
            }); */
            setSelectedTool(prev => ([...prev, "Coding"]));
          }}
        >
          <Coding width={"40px"} height={"40px"} fill={"#000"} opt1={"#000"} />
        </div>
        <div
          className={styles.iconWrapper}
          onClick={() => {
            /* handleSelect({
              name: "Globe",
              el: (
                <Globe
                  width={"40px"}
                  height={"40px"}
                  fill={"#000"}
                  opt1={"#000"}
                />
              ),
            }); */
            setSelectedTool(prev => ([...prev, "Globe"]));
          }}
        >
          <Globe width={"40px"} height={"40px"} fill={"#000"} opt1={"#000"} />
        </div>
        <div
          className={styles.iconWrapper}
          onClick={() => {
            /* handleSelect({
              name: "Workout",
              el: (
                <Workout
                  width={"40px"}
                  height={"40px"}
                  fill={"#000"}
                  opt1={"#000"}
                />
              ),
            }); */
            setSelectedTool(prev => ([...prev, "Workout"]));
          }}
        >
          <Workout width={"40px"} height={"40px"} fill={"#000"} opt1={"#000"} />
        </div>
        <div
          className={styles.iconWrapper}
          onClick={() => {
            /* handleSelect({
              name: "Alert",
              el: (
                <Alert
                  width={"40px"}
                  height={"40px"}
                  fill={"#000"}
                  opt1={"#000"}
                />
              ),
            }); */
            setSelectedTool(prev => ([...prev, "Alert"]));
          }}
        >
          <Alert width={"40px"} height={"40px"} fill={"#000"} opt1={"#000"} />
        </div>
      </div>
    </div>
  );
}

export default SelectTool;
