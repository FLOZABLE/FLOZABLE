import { faPen } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import styles from "./EditSubjectBtn.module.css";
import { useContext } from "react";
import { ModalsContext } from "@/app/utils/Contexts";

export default function EditSubjectBtn() {
  const { setIsSubjectsModal } = useContext(ModalsContext);

  return (
    <div
      className={styles.EditSubjectBtn}
      onClick={() => {
        setIsSubjectsModal((prev) => !prev);
      }}
    >
      <FontAwesomeIcon icon={faPen} />
      <div className={styles.hoverEl}>
        <p>Edit Subjects!</p>
      </div>
    </div>
  );
}
