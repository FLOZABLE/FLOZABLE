import { useContext } from "react";
import styles from "./EditSubjectModal.module.css";
import { ModalsContext } from "@/app/utils/Contexts";

export default function EditSubjectModal() {
  const {isSubjectsModal, setIsSubjectsModal} = useContext(ModalsContext);
  
  return (
    <div className={`${styles.EditSubjectModal} modal`}>
      sdfsdf
    </div>
  );
};