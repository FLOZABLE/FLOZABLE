"use client";

import { useContext } from "react";
import styles from "./SubjectsModal.module.css";
import { ModalsContext } from "@/app/utils/Contexts";
import SubjectsManager from "../../Account/SubjectsManager/SubjectsManager";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark } from "@fortawesome/free-solid-svg-icons";
import DraggableModal from "../DraggableModal/DraggableModal";

export default function SubjectsModal() {
  const { isSubjectsModal, setIsSubjectsModal } = useContext(ModalsContext);

  return (
    <DraggableModal isOpen={isSubjectsModal} setIsOpen={setIsSubjectsModal}>
      <div className={`${styles.SubjectsModal}`}>
        <div className={styles.subjectsManager}>
          <SubjectsManager />
        </div>
      </div>
    </DraggableModal>
  );
}
