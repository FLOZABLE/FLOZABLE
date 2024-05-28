"use client";

import { useContext } from "react";
import styles from "./SubjectsModal.module.css";
import { ModalsContext } from "@/app/utils/Contexts";

export default function SubjectsModal() {
  const {isSubjectsModal, setIsSubjectsModal} = useContext(ModalsContext);

  return (
    <div className={`${styles.SubjectsModal} modal ${isSubjectsModal ? "open" : ""}`}>
      
    </div>
  )
}