import Draggable from "react-draggable";
import styles from "./DraggableModal.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark } from "@fortawesome/free-solid-svg-icons";
import { useRef } from "react";

export default function DraggableModal({
  children,
  isOpen,
  setIsOpen,
  top = "12.5rem",
}) {
  const ref = useRef(null);
  return (
    <Draggable nodeRef={ref} handle=".header">
      <div
        className={`modal ${styles.DraggableModal} ${isOpen ? "open" : ""}`}
        ref={ref}
        style={{ top: isOpen ? top : "31.25rem" }}
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
