import { useRef } from "react";
import styles from "./StudyModalContainer.module.css";
import Draggable from 'react-draggable';
function StudyModalContainer ({element, setIsDisp, isDisp}) {
  const ref = useRef();
  return (
    <Draggable nodeRef={ref}>
    <div ref={ref} className={`${styles.StudyModalContainer} ${isDisp ? styles.visible: ''}`}>
      <div className={styles.inner}>
        {element}
      </div>
    </div>
    </Draggable>
  )
};

export default StudyModalContainer;