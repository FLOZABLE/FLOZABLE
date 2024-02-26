import { useRef } from "react";
import styles from "./StudyModalContainer.module.css";
import Draggable from "react-draggable";

function StudyModalContainer({ element, isDisp, startPos }) {
  const ref = useRef();
  return (
    <Draggable positionOffset={{ x: startPos.x, y: startPos.y }} nodeRef={ref}>
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
