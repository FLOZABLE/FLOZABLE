import React, { useEffect, useRef } from "react";
import styles from "./StudyModalContainer.module.css";
import Draggable from "react-draggable";

function StudyModalContainer({ element, isDisp, startPos = {x: 0, y: 0}, onDragEnd }) {
  const ref = useRef();
  
  useEffect(() => {
    //console.log(startPos);
  }, [startPos]);

  return (
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
  );
}

export default StudyModalContainer;
