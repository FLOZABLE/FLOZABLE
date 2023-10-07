import React from "react";
import styles from "./ToolBoxModal.module.css";
import {useDrop} from "react-dnd";

function ToolBoxModal (props) {
  const {onDrop} = props;
  
  const [{ isOver }, drop] = useDrop({
    accept: 'ITEM',
    drop: (item) => onDrop(item.name),
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  });

  return (
    <div className={styles.ToolBoxModal}>
      <div className={styles.dropBox} ref={drop}></div>
    </div>
  );
};

export default ToolBoxModal;