import Draggable from "react-draggable";
import styles from "./DraggableModal.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark } from "@fortawesome/free-solid-svg-icons";
import { useRef } from "react";

export default function DraggableModal({
  children,
  style = {},
  refProp,
  isOpen,
  setIsOpen,
}) {
  return (
    <Draggable nodeRef={refProp} handle=".header">
      <div
        className={`modal ${styles.DraggableModal} ${isOpen ? "open" : ""}`}
        ref={refProp}
      >
        <div className={`${styles.header} header`}>
          <i
            onClick={() => {
              setIsOpen(false);
            }}
          >
            <FontAwesomeIcon icon={faXmark} />
          </i>
        </div>
        {children}
      </div>
    </Draggable>
  );
}