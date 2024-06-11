"use client";

import React, {
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import Draggable from "react-draggable";
import styles from "./AddSubjectModal.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBook, faXmark } from "@fortawesome/free-solid-svg-icons";
import {
  ModalsContext,
  ResponseContext,
  SubjectsContext,
  TutorialsContext,
  WorkersContext
} from "@/app/utils/Contexts";
import { useRouter } from "next/navigation";
import CustomInput from "@/app/components/Inputs/CustomInput/CustomInput";
import SelectIcon from "@/app/components/Inputs/SelectIcon/SelectIcon";
import ColorPalette from "@/app/components/Inputs/ColorPalette/ColorPalette";
import BlobBtn from "@/app/components/Buttons/BlobBtn/BlobBtn";
import config from "@/app/utils/config";
import { sortNewSubject } from "@/app/utils/timelineSorting";
import { socket } from "@/app/utils/socket";

function AddSubjectModal({ }) {
  const { subjects, setSubjects } = useContext(SubjectsContext);
  const { setResponse } = useContext(ResponseContext);
  const { isAddSubjectModal, setIsAddSubjectModal } = useContext(ModalsContext);
  const { tutorialBoxRef, tutorialTextRef, tutorial, setTutorial } = useContext(TutorialsContext);
  const { subjectsTimerWorkerRef } = useContext(WorkersContext);

  const [name, setName] = useState("");
  const [selectedColor, setSelectedColor] = useState(null);
  const [isSelectColor, setIsSelectColor] = useState(false);
  const [selectedIcon, setSelectedIcon] = useState({ name: null, el: null });
  const [isSelectIcon, setIsSelectIcon] = useState(false);
  const router = useRouter();

  const addSubjectModalRef = useRef(null);

  useEffect(() => {
    if (isAddSubjectModal) {
      const subjectId = subjectsTimerWorkerRef?.current?.subjectId;
      if (subjectId) {
        subjectsTimerWorkerRef?.current?.postMessage({ command: "stopSubjectTimer" });
        socket.emit("stop", subjectId);
      }
    }
  }, [isAddSubjectModal]);

  useEffect(() => {
    if (tutorial === 4) {
      setTimeout(() => {
        const { top, left, height } =
          addSubjectModalRef.current.getBoundingClientRect();
        tutorialBoxRef.current.style.left = left + "px";
        tutorialBoxRef.current.style.top = top - 25 + "px";
        tutorialBoxRef.current.style.width = 0;
        tutorialBoxRef.current.style.height = height + "px";

        tutorialTextRef.current.style.top = top - 50 + "px";
        tutorialTextRef.current.style.left = left + "px";
        tutorialTextRef.current.innerText = "Enter the subject details!";
      }, 500);
    }
  }, [tutorial]);

  const handleNameInput = (e) => {
    setName(e.target.value);
  };

  const submit = useCallback(() => {
    fetch(`${config.server}/subjects`, {
      method: "put",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: name,
        color: selectedColor,
        icon: selectedIcon.name,
      }),
      credentials: "include",
    })
      .then((response) => response.json())
      .then((data) => {
        setResponse(data);
        if (data.success) {
          const newSubject = sortNewSubject(subjects, data.info.subjectInfo);
          setIsAddSubjectModal(false);

          let newState;
          newState = [...subjects];
          newState.push(newSubject);
          newState.daily = subjects.daily;
          newState.monthly = subjects.monthly;
          newState.weekly = subjects.weekly;
          setSubjects(newState);

          //clear new subject info from modal
          setSelectedColor(null);
          setSelectedIcon({ name: null, el: null });
          setName("");
          if (tutorial === 4) {
            setTutorial(5);
          }
        }
      })
      .catch((error) => console.error(error));
  }, [selectedColor, selectedIcon, name, tutorial, subjects]);

  return (
    <Draggable nodeRef={addSubjectModalRef} handle=".header">
      <div
        className={`${styles.AddSubjectModal} modal ${isAddSubjectModal ? "open" : ""
          }`}
        ref={addSubjectModalRef}
      >
        <div className={`${styles.header} header`}>
          <i
            onClick={() => {
              setIsAddSubjectModal(false);
            }}
          >
            <FontAwesomeIcon icon={faXmark} />
          </i>
        </div>
        <div className={styles.content}>
          <div className={styles.inputWrapper}>
            <CustomInput
              input={name}
              handleInput={handleNameInput}
              icon={faBook}
              placeHolder={"Subject Name"}
              type={"text"}
            />
          </div>
          <SelectIcon
            selectedIcon={selectedIcon}
            setSelectedIcon={setSelectedIcon}
            isSelectIcon={isSelectIcon}
            setIsSelectIcon={setIsSelectIcon}
            setIsSelectColor={setIsSelectColor}
            id="tutorial-4"
          />
          <ColorPalette
            setSelectedColor={setSelectedColor}
            selectedColor={selectedColor}
            isSelectColor={isSelectColor}
            setIsSelectColor={setIsSelectColor}
            setIsSelectIcon={setIsSelectIcon}
            id="tutorial-4"
          />
          <div className={styles.submit}>
            <BlobBtn onClick={submit} id="tutorial-4">
              SUBMIT
            </BlobBtn>
          </div>
        </div>
      </div>
    </Draggable>
  );
}

export default AddSubjectModal;
