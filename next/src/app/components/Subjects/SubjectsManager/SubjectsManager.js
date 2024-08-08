import React, { useCallback, useContext } from "react";
import styles from "./SubjectsManager.module.css";
import { ModalsContext, SubjectsContext } from "@/app/utils/Contexts";
import BlobBtn from "../../Buttons/BlobBtn/BlobBtn";

function SubjectsManager() {
  const { subjects } = useContext(SubjectsContext);
  const { setIsSubjectsModal } = useContext(ModalsContext);

  return (
    <div className={styles.SubjectsManager}>
      {subjects.map((subject, i) => {
        return (
          <div className={styles.subject} key={i}>
            <BlobBtn
              onClick={() => {
                setIsSubjectsModal({
                  opened: true,
                  subject_id: subject.subject_id,
                });
              }}
            >
              <div className={`overflowDot ${styles.name}`}>{subject.name}</div>
            </BlobBtn>
          </div>
        );
      })}
    </div>
  );
}

export default SubjectsManager;
