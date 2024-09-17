import React, { useEffect, useRef } from "react";
import styles from "./StudyModalContainer.module.css";
import Draggable from "react-draggable";

function StudyModalContainer({ children, isDisp, style = {} }) {
  const ref = useRef();

  /* return (
    <Draggable
      positionOffset={{ x: startPos.x, y: startPos.y }}
      nodeRef={ref}
      onStop={onDragEnd}
    >
      <div
        ref={ref}
        className={`${styles.StudyModalContainer} ${isDisp ? styles.visible : ""
          }`}
      >
        <div className={styles.inner}>{element}</div>
      </div>
    </Draggable>
  ); */
  return (
    <div
      className={`${styles.StudyModalContainer} ${
        isDisp ? styles.visible : ""
      }`}
      style={style}
    >
      {children}
    </div>
  );
}

export default StudyModalContainer;
