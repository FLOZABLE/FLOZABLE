import React from "react";
import styles from "./StudySidebar.module.css";
import { useDrop } from "react-dnd";
import Volume from "../StudySidebarOptions/Volume/Volume";

function StudySidebar(props) {
  const { items, moveItem } = props;
  const [, drop] = useDrop({
    accept: 'ITEM',
    hover: (draggedItem, monitor) => {
      const draggedIndex = draggedItem.index;
      const hoverIndex = monitor.getItem().index;

      if (draggedIndex !== hoverIndex) {
        moveItem(draggedIndex, hoverIndex);
        draggedItem.index = hoverIndex;
      }
    },
  });

  return (
    <aside className={styles.StudySidebar}>
      <div className={styles.dropBox} ref={drop}>
        {items.map((item, index) => (
          <Volume key={item.id} id={item.id} text={item.text} index={index} moveItem={moveItem} />
        ))}
      </div>
    </aside>
  );
}

export default StudySidebar;
