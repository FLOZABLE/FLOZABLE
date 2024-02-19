import React from "react";
import styles from "./SelectTool.module.css";
import {
  IconCalculator,
  IconFileBarGraphFill,
  IconPeriodicTable,
} from "../../../utils/svgs";
import { toolsInfo } from "../../../constant";

function SelectTool({
  selectedTool,
  setSelectedTool,
  isSelectTool,
  setIsSelectTool,
  setIsSelectColor,
}) {

  return (
    <div className={styles.selectTool}>
      <div className={styles.header}>
        <button
          onClick={() => {
            setIsSelectTool(!isSelectTool);
            setIsSelectColor(false);
          }}
        >
          <div>
            {!selectedTool.length ? (
              <p>Select Subject's Tools!</p>
            ) : (
              <p>Selected Tools : </p>          
            )}
          </div>
          
        </button>
        {selectedTool.map((tool, i) => {
          const toolInfo = toolsInfo[tool];
          if (!toolInfo) return;

          return (
            <div className={styles.selectedTool}
              onClick={() => {
                setIsSelectTool(!isSelectTool);
                setIsSelectColor(false);
              }}
              key={i}
            >
              {toolInfo.icon}
              <div className={styles.hoverDisp}>
                {toolInfo.name}
              </div>
            </div>
          )
        })}
      </div>
      <div className={`${styles.icons} ${isSelectTool ? styles.open : ""}`}>
        {toolsInfo.map((tool, i) => {
          return (
            <div
              className={styles.iconWrapper}
              onClick={() => {
                if (!selectedTool.includes(i.toString())) {
                  setSelectedTool(prev => ([...prev, i.toString()]));
                } else {
                  setSelectedTool(prev => prev.filter(item => item !== i.toString()));
                }
              }}
              key={i}
            >
              {tool.icon}
              <div className={styles.hoverDisp}>
                {tool.name}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  );
}

export default SelectTool;
