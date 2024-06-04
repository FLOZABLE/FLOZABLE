"use client";

import { useContext } from "react";
import styles from "./SubjectsModal.module.css";
import { ModalsContext } from "@/app/utils/Contexts";
import SubjectsManager from "../../Account/SubjectsManager/SubjectsManager";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark } from "@fortawesome/free-solid-svg-icons";

export default function SubjectsModal() {
  const { isSubjectsModal, setIsSubjectsModal } = useContext(ModalsContext);

  return (
    <div
      className={`${styles.SubjectsModal} modal ${
        isSubjectsModal ? "open" : ""
      }`}
    >
      <div className={styles.header}>
        <i
          onClick={() => {
            setIsSubjectsModal(!isSubjectsModal);
          }}
        >
          <FontAwesomeIcon icon={faXmark} />
        </i>
      </div>
      <div className={styles.subjectsManager}>
        <SubjectsManager />
      </div>
    </div>
  );
}
