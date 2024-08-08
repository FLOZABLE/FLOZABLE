"use client";

import { useContext, useEffect, useRef, useState } from "react";
import styles from "./SubjectsModal.module.css";
import { ModalsContext, SubjectsContext } from "@/app/utils/Contexts";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBook,
  faShare,
  faTrashCan,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";
import DraggableModal from "../DraggableModal/DraggableModal";
import SubjectsManager from "../../Subjects/SubjectsManager/SubjectsManager";
import CustomInput from "../../Inputs/CustomInput/CustomInput";
import ColorPalette from "../../Inputs/ColorPalette/ColorPalette";
import { BackArrow } from "@/app/utils/Svg";
import BlobBtn from "../../Buttons/BlobBtn/BlobBtn";
import Draggable from "react-draggable";

export default function SubjectsModal() {
  const { isSubjectsModal, setIsSubjectsModal } = useContext(ModalsContext);
  const { subjects } = useContext(SubjectsContext);

  const [subject, setSubject] = useState({
    name: "",
    color: null,
    subject_id: null,
  });
  const [isSelectColor, setIsSelectColor] = useState(false);

  const modalRef = useRef(null);

  useEffect(() => {
    if (!isSubjectsModal?.subject_id || !subjects) return;

    const subject = subjects.find(
      (subject) => subject.subject_id === isSubjectsModal.subject_id
    );

    if (!subject) return;

    const { name, color, subject_id } = subject;
    setSubject({ name, color, subject_id });
  }, [isSubjectsModal, subjects]);

  return (
    <Draggable nodeRef={modalRef} handle=".header">
      <div
        className={`modal ${styles.SubjectsModal} ${
          isSubjectsModal?.opened ? "open" : ""
        }`}
        ref={modalRef}
      >
        <div className={`${styles.header} header`}>
          <i>
            <BackArrow />
          </i>
          <i
            onClick={() => {
              setIsSubjectsModal(false);
            }}
          >
            <FontAwesomeIcon icon={faXmark} />
          </i>
        </div>
        <div className={`customScroll ${styles.contents}`}>
          {/* <div className={styles.SubjectsManager}>
            <SubjectsManager />
          </div> */}
          <div className={styles.editSubject}>
            <CustomInput
              input={subject.name}
              handleInput={(e) =>
                setSubject((prev) => ({ ...prev, name: e.target.value }))
              }
              icon={faBook}
              placeHolder={"Subject Name"}
              type={"text"}
            />
            <ColorPalette
              setSelectedColor={(color) => {
                setSubject((prev) => ({ ...prev, color }));
              }}
              selectedColor={subject.color}
              isSelectColor={isSelectColor}
              setIsSelectColor={setIsSelectColor}
            />
          </div>
        </div>
      </div>
      {/* <div className={`${styles.SubjectsModal}`}>
        <div className={styles.SubjectsManager}>
          <SubjectsManager />
        </div>
        <div className={styles.editSubject}>
          <div className={styles.header}>
            <div
              className={styles.button}
              onClick={() => {
                setIsSubjectsModal((prev) => ({ ...prev, subject_id: null }));
              }}
            >
              <BackArrow />
            </div>
          </div>
          <div className={styles.contents}>
            <CustomInput
              input={subject.name}
              handleInput={(e) =>
                setSubject((prev) => ({ ...prev, name: e.target.value }))
              }
              icon={faBook}
              placeHolder={"Subject Name"}
              type={"text"}
            />
            <ColorPalette
              setSelectedColor={(color) => {
                setSubject((prev) => ({ ...prev, color }));
              }}
              selectedColor={subject.color}
              isSelectColor={isSelectColor}
              setIsSelectColor={setIsSelectColor}
            />
          </div>
          <div className={styles.buttons}>
            <BlobBtn>
              <FontAwesomeIcon icon={faShare} />
            </BlobBtn>
            <BlobBtn>Save</BlobBtn>
            <BlobBtn>
              <FontAwesomeIcon icon={faTrashCan} />
            </BlobBtn>
          </div>
        </div>
      </div> */}
    </Draggable>
  );
}
