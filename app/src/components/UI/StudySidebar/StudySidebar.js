import { useRef, useState, useCallback } from "react";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import update from 'immutability-helper';
import StudyTool from "../StudyToolWrapper/StudyToolWrapper";

import styles from "./StudySidebar.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHourglass } from "@fortawesome/free-solid-svg-icons";

function StudySidebar({ isTimerModal, isPlannerModal, isTemplateModal, isGroupModal, isVolumeModal }) {
  const handleItemClick = (itemId) => {
    setItems((prevItems) => {
      return prevItems.map((item) =>
        item.id === itemId ? { ...item, clicked: !item.clicked } : item
      );
    });
  };

  const [items, setItems] = useState([
    {
      id: 1,
      clicked: false,
      element:
        <div className={styles.studyTool} onClick={() => { handleItemClick(1) }}>
          <FontAwesomeIcon icon={faHourglass} style={{ color: "#fff" }} />
        </div>,
    },
    {
      id: 2,
      element: <div className={styles.iconWrapper} onClick={() => { console.log('d') }}>
        <FontAwesomeIcon icon={faHourglass} />
      </div>,
    },
    {
      id: 3,
      element:
        <div className={styles.studyTool} onClick={() => { handleItemClick(1) }}>
          <FontAwesomeIcon icon={faHourglass} style={{ color: "#fff" }} />
        </div>,
    },
    {
      id: 4,
      element: 'Create some examples',
    },
    {
      id: 5,
      element: 'Spam in Twitter and IRC to promote it (note that this element is taller than the others)',
    },
    {
      id: 6,
      element: '???',
    },
    {
      id: 7,
      element: 'PROFIT',
    },
  ]);
  const moveCard = useCallback((dragIndex, hoverIndex) => {
    setItems((prevItems) =>
      update(prevItems, {
        $splice: [
          [dragIndex, 1],
          [hoverIndex, 0, prevItems[dragIndex]],
        ],
      }),
    )
  }, [])
  const renderCard = useCallback((card, index, styles) => {
    return (
      <StudyTool
        key={card.id}
        index={index}
        id={card.id}
        element={card.element}
        moveCard={moveCard}
        styles={styles}
      />
    )
  }, [])
  return (
    <div className={styles.StudySidebar}>
      <DndProvider backend={HTML5Backend}>
        {items.map((card, i) => renderCard(card, i, styles))}
      </DndProvider>
    </div>
  );
};

export default StudySidebar;
