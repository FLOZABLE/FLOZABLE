"use client";

import React, {
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import styles from "./AddSubjectModal.module.css";
import { faBook } from "@fortawesome/free-solid-svg-icons";
import {
  ModalsContext,
  SubjectsContext,
  TutorialsContext,
  WorkersContext,
} from "@/app/utils/Contexts";
import CustomInput from "@/app/components/Inputs/CustomInput/CustomInput";
import ColorPalette from "@/app/components/Inputs/ColorPalette/ColorPalette";
import BlobBtn from "@/app/components/Buttons/BlobBtn/BlobBtn";
/* import { sortNewSubject } from "@/app/utils/timelineSorting"; */
import { socket } from "@/app/utils/socket";
import DraggableModal from "../DraggableModal/DraggableModal";
import { sortNewSubject } from "@/app/utils/timelineSorting";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { putSubjectsSubject } from "@/Api/subjectsApi";

function AddSubjectModal({}) {
  const { subjects, setSubjects } = useContext(SubjectsContext);

  const { isAddSubjectModal, setIsAddSubjectModal } = useContext(ModalsContext);
  const { tutorialBoxRef, tutorialTextRef, tutorial, setTutorial } =
    useContext(TutorialsContext);
  const { subjectsTimerWorkerRef } = useContext(WorkersContext);

  const [subject, setSubject] = useState({
    name: "",
    color: null,
  });
  const [isSelectColor, setIsSelectColor] = useState(false);

  const addSubjectModalRef = useRef(null);

  useEffect(() => {
    if (isAddSubjectModal) {
      const subjectId = subjectsTimerWorkerRef?.current?.subjectId;
      if (subjectId) {
        subjectsTimerWorkerRef?.current?.postMessage({
          command: "stopSubjectTimer",
        });
        socket.emit("stop", subjectId);
      }
    }
  }, [isAddSubjectModal]);

  useEffect(() => {
    if (tutorial === 4) {
      setTimeout(() => {
        const { top, left, height, width } =
          addSubjectModalRef.current.getBoundingClientRect();
        tutorialBoxRef.current.style.left = left - 20 + "px";
        tutorialBoxRef.current.style.top = top - 40 + "px";
        tutorialBoxRef.current.style.width = width + 40 + "px";
        tutorialBoxRef.current.style.height = height + 60 + "px";

        tutorialTextRef.current.style.top = top - 100 + "px";
        tutorialTextRef.current.style.left = left + "px";
        tutorialTextRef.current.innerText = "Enter the subject details!";
      }, 500);
    }
  }, [tutorial]);

  const onSubmit = useCallback(
    (subject) => {
      (async () => {
        const response = await putSubjectsSubject(subject);
        if (!response.success) return;

        const newSubjects = sortNewSubject(
          JSON.parse(JSON.stringify(subjects)),
          response.data.subject
        );
        setSubjects(newSubjects);
        setIsSelectColor(false);
        setIsAddSubjectModal(false);
        setSubject({ name: "", color: null });
        if (tutorial === 4) {
          setTutorial(5);
        }
      })();
    },
    [tutorial, subjects]
  );

  //setTutorial(0)

  return (
    <div ref={addSubjectModalRef} className={styles.AddSubjectModal}>
      <DraggableModal
        isOpen={isAddSubjectModal}
        setIsOpen={setIsAddSubjectModal}
        top="15rem"
      >
        <div className={styles.inner}>
          <div className={styles.inputWrapper}>
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
          </div>
          <ColorPalette
            setSelectedColor={(color) => {
              setSubject((prev) => ({ ...prev, color }));
            }}
            selectedColor={subject.color}
            isSelectColor={isSelectColor}
            setIsSelectColor={setIsSelectColor}
            tutorial={4}
          />
          <div className={styles.submit}>
            <BlobBtn
              onClick={() => {
                onSubmit(subject);
              }}
              data-tutorial="4"
            >
              SAVE
            </BlobBtn>
          </div>
        </div>
      </DraggableModal>
    </div>
  );
}

export default AddSubjectModal;
