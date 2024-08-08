"use client";

import { useCallback, useContext, useEffect, useRef, useState } from "react";
import styles from "./SubjectsModal.module.css";
import {
  ModalsContext,
  ResponseContext,
  SubjectsContext,
} from "@/app/utils/Contexts";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBook,
  faShare,
  faTrashCan,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";
import SubjectsManager from "../../Subjects/SubjectsManager/SubjectsManager";
import CustomInput from "../../Inputs/CustomInput/CustomInput";
import ColorPalette from "../../Inputs/ColorPalette/ColorPalette";
import { BackArrow } from "@/app/utils/Svg";
import BlobBtn from "../../Buttons/BlobBtn/BlobBtn";
import Draggable from "react-draggable";
import { deleteSubjectsSubject, patchSubjectsSubject } from "@/Api/subjectsApi";

export default function SubjectsModal() {
  const { isSubjectsModal, setIsSubjectsModal } = useContext(ModalsContext);
  const { subjects, setSubjects } = useContext(SubjectsContext);
  const { setResponse } = useContext(ResponseContext);

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

  const onShare = useCallback(() => {}, []);

  const onSave = useCallback(
    (subject) => {
      (async () => {
        const { subject_id, name, color } = subject;
        const data = await patchSubjectsSubject({
          subjectId: subject_id,
          name,
          color,
        });

        setResponse(data);

        if (data.success) {
          const subjectIndex = subjects.findIndex(
            (subject) => subject.subject_id === subject_id
          );

          if (subjectIndex === -1) return;
          const newSubjects = JSON.parse(JSON.stringify(subjects));
          newSubjects[subjectIndex] = {
            ...newSubjects[subjectIndex],
            ...data.subject,
          };

          setSubjects(newSubjects);
        }
      })();
    },
    [subjects]
  );

  const onDelete = useCallback(
    (subject) => {
      const subjectId = subject.subject_id;
      (async () => {
        const data = await deleteSubjectsSubject(subjectId);
        setResponse(data);

        if (data.success) {
          setIsSubjectsModal((prev) => ({ ...prev, subject_id: null }));
          const subjectIndex = subjects.findIndex(
            (subject) => subject.subject_id === subjectId
          );

          if (subjectIndex === -1) return;
          const newSubjects = JSON.parse(JSON.stringify(subjects)).filter(
            (subject) => subject.subject_id !== subjectId
          );
          const deletedSubject = subjects.find(
            (subject) => subject.subject_id === subjectId
          );

          const otherSubjectIndex = newSubjects.findIndex(
            (subject) => subject.name === "others"
          );
          if (otherSubjectIndex !== -1 && deletedSubject) {
            newSubjects[otherSubjectIndex].daily.total.map(
              (value, i) => (value.data += deletedSubject.daily.total[i].data)
            );
            newSubjects[otherSubjectIndex].weekly.total.map(
              (value, i) => (value.data += deletedSubject.weekly.total[i].data)
            );
            newSubjects[otherSubjectIndex].monthly.total.map(
              (value, i) => (value.data += deletedSubject.monthly.total[i].data)
            );

            newSubjects[otherSubjectIndex].daily.timeline.map((value, i) => {
              value.data.push(...deletedSubject.daily.timeline[i].data);
              value.data.sort((a, b) => a[0] - b[0]);
            });
            newSubjects[otherSubjectIndex].weekly.timeline.map((value, i) => {
              value.data.push(...deletedSubject.weekly.timeline[i].data);
              value.data.sort((a, b) => a[0] - b[0]);
            });
            newSubjects[otherSubjectIndex].monthly.timeline.map((value, i) => {
              value.data.push(...deletedSubject.monthly.timeline[i].data);
              value.data.sort((a, b) => a[0] - b[0]);
            });

            newSubjects[otherSubjectIndex].weekly.focus.map((value, i) => {
              const deletedSubjectFocus = deletedSubject.weekly.focus[i].data;
              value.data =
                value.data > deletedSubjectFocus
                  ? value.data
                  : deletedSubjectFocus;
            });
            newSubjects[otherSubjectIndex].monthly.focus.map((value, i) => {
              const deletedSubjectFocus = deletedSubject.monthly.focus[i].data;
              value.data =
                value.data > deletedSubjectFocus
                  ? value.data
                  : deletedSubjectFocus;
            });

            newSubjects[otherSubjectIndex].timeline.push(
              ...deletedSubject.timeline
            );
            newSubjects[otherSubjectIndex].timeline.sort((a, b) => a[0] - b[0]);
          }
          setSubjects(newSubjects);
        }
      })();
    },
    [subjects]
  );

  return (
    <Draggable nodeRef={modalRef} handle=".header">
      <div
        className={`modal ${styles.SubjectsModal} ${
          isSubjectsModal?.opened ? "open" : ""
        }`}
        ref={modalRef}
      >
        <div className={`${styles.header} header`}>
          <i
            onClick={() => {
              setIsSubjectsModal((prev) => ({ ...prev, subject_id: null }));
            }}
          >
            <BackArrow />
          </i>
          <i
            onClick={() => {
              setIsSubjectsModal({ opened: false, subject_id: null });
            }}
          >
            <FontAwesomeIcon icon={faXmark} />
          </i>
        </div>
        <div className={`${styles.contents}`}>
          <div className={`customScroll ${styles.SubjectsManager}`}>
            <SubjectsManager />
          </div>
          <div
            className={`customScroll ${styles.editSubject} ${
              isSubjectsModal?.subject_id ? styles.opened : null
            }`}
          >
            <div className={styles.inputs}>
              <CustomInput
                input={subject.name}
                handleInput={(e) =>
                  setSubject((prev) => ({ ...prev, name: e.target.value }))
                }
                placeHolder={"Subject Name"}
                type={"text"}
              >
                <FontAwesomeIcon icon={faBook} />
              </CustomInput>
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
              <BlobBtn
                onClick={() => {
                  onShare(subject);
                }}
              >
                <FontAwesomeIcon icon={faShare} />
              </BlobBtn>
              <BlobBtn
                onClick={() => {
                  onSave(subject);
                }}
              >
                Save
              </BlobBtn>
              <BlobBtn
                onClick={() => {
                  onDelete(subject);
                }}
              >
                <FontAwesomeIcon icon={faTrashCan} />
              </BlobBtn>
            </div>
          </div>
        </div>
      </div>
    </Draggable>
  );
}
