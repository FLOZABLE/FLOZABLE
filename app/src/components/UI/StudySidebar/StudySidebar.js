import { useRef, useState, useCallback, useEffect } from "react";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import update from 'immutability-helper';
import StudyTool from "../StudyToolWrapper/StudyToolWrapper";

import styles from "./StudySidebar.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCamera, faClipboardCheck, faDownLeftAndUpRightToCenter, faHourglass, faImage, faMicrophone, faUpRightAndDownLeftFromCenter, faUsers, faVolumeHigh } from "@fortawesome/free-solid-svg-icons";

function StudySidebar({ isTimerModal, isPlannerModal, isTemplateModal, isGroupModal, isVolumeModal, isZoom, setIsTimerModal, setIsPlannerModal, setIsTemplateModal, setIsVolumeModal, setIsZoom, setIsViewGroups, setIsCam, setIsMic, isCam, isMic }) {
  const [isItemDragging, setIsItemDragging] = useState(false);

  const [items, setItems] = useState([
    {
      id: 1,
      element:
        <div className={`${styles.studyTool} ${isTimerModal ? styles.clicked : ''}`} onClick={() => { setIsTimerModal((prev) => !prev) }}>
          <i>
            <FontAwesomeIcon icon={faHourglass} />
          </i>
        </div>,
    },
    {
      id: 2,
      element:
        <div className={`${styles.studyTool} ${isPlannerModal ? styles.clicked : ''}`} onClick={() => { setIsPlannerModal((prev) => !prev) }}>
          <i>
            <FontAwesomeIcon icon={faClipboardCheck} />
          </i>
        </div>,
    },
    {
      id: 3,
      element:
        <div className={`${styles.studyTool} ${isCam ? styles.clicked : ''}`} onClick={() => { setIsCam((prev) => !prev) }}>
          <i>
            <FontAwesomeIcon icon={faCamera} />
          </i>
        </div>,
    },
    {
      id: 4,
      element:
        <div className={`${styles.studyTool} ${isMic ? styles.clicked : ''}`} onClick={() => { setIsMic((prev) => !prev) }}>
          <i>
            <FontAwesomeIcon icon={faMicrophone} />
          </i>
        </div>,
    },
    {
      id: 5,
      element:
        <div className={`${styles.studyTool} ${isTemplateModal ? styles.clicked : ''}`} onClick={() => { setIsTemplateModal((prev) => !prev) }}>
          <i>
            <FontAwesomeIcon icon={faImage} />
          </i>
        </div>,
    },
    {
      id: 6,
      element:
        <div className={`${styles.studyTool} ${isVolumeModal ? styles.clicked : ''}`} onClick={() => { setIsVolumeModal((prev) => !prev) }}>
          <i>
            <FontAwesomeIcon icon={faVolumeHigh} />
          </i>
        </div>,
    },
    {
      id: 7,
      element:
        <div className={`${styles.studyTool} ${isGroupModal ? styles.clicked : ''}`} onClick={() => { setIsViewGroups((prev) => !prev) }}>
          <i>
            <FontAwesomeIcon icon={faUsers} />
          </i>
        </div>,
    },
    {
      id: 8,
      element:
        <div className={`${styles.studyTool} ${isZoom ? styles.clicked : ''}`} onClick={() => { setIsZoom((prev) => !prev) }}>
          <i>
            <FontAwesomeIcon icon={ isZoom ? faUpRightAndDownLeftFromCenter : faDownLeftAndUpRightToCenter} />
          </i>
        </div>,
    },
  ]);

  useEffect(() => {
    console.log('zoom', isZoom)
  }, [isZoom])
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