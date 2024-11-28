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
import { AddSubjectsModalContext, WorkersContext } from "@/app/utils/Contexts";
import CustomInput from "@/app/components/Inputs/CustomInput/CustomInput";
import ColorPalette from "@/app/components/Inputs/ColorPalette/ColorPalette";
import BlobBtn from "@/app/components/Buttons/BlobBtn/BlobBtn";
/* import { sortNewSubject } from "@/app/utils/timelineSorting"; */
import { socket } from "@/app/utils/socket";
import DraggableModal from "../DraggableModal/DraggableModal";
import { sortNewSubject } from "@/app/utils/timelineSorting";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { putSubjectsSubject } from "@/Api/subjectsApi";
import { useSubjects } from "@/Hooks/subjectsHooks";
import { useDebounce } from "use-debounce";
import { useTour } from "@reactour/tour";
import { toast } from "react-toastify";

function AddSubjectModal({}) {
  const { currentStep, setCurrentStep } = useTour();
  const { subjects, updateSubjects } = useSubjects();

  const { isAddSubjectModal, setIsAddSubjectModal } = useContext(
    AddSubjectsModalContext
  );
  const { subjectsTimerWorkerRef } = useContext(WorkersContext);

  const [subject, setSubject] = useState({
    name: "",
    color: null,
  });
  const [isSelectColor, setIsSelectColor] = useState(false);

  const [debouncedName] = useDebounce(subject.name, 1000);
  const [debouncedColor] = useDebounce(subject.color, 1000);

  useEffect(() => {
    if (debouncedName === "" || currentStep !== 4) return;

    if (!/^[a-zA-Z0-9!?#@&()<>'[\],~".,/\p{Emoji}\s]+$/u.test(debouncedName)) {
      setIsSelectColor(true);
      toast.error("Invalid Characters");
      return;
    }

    setIsSelectColor(true);
    setTimeout(() => {
      setCurrentStep(5);
    }, 500);
  }, [debouncedName]);

  useEffect(() => {
    if (!debouncedColor) return;

    if (currentStep === 5) {
      setCurrentStep(6);
    }
  }, [debouncedColor]);

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

  const onSubmit = useCallback(
    async (subject) => {
      try {
        const response = await putSubjectsSubject(subject);

        if (!response.success) {
          setCurrentStep(4);
          return;
        }

        const newSubjects = sortNewSubject(
          structuredClone(subjects),
          response.data.subject
        );
        updateSubjects(newSubjects);
        setIsSelectColor(false);
        setIsAddSubjectModal(false);
        setSubject({ name: "", color: null });

        if (currentStep === 6) {
          setCurrentStep(7);
        }
      } catch (err) {
        console.log(err);
      }
    },
    [subjects, currentStep]
  );

  return (
    <div className={styles.AddSubjectModal}>
      <DraggableModal
        isOpen={isAddSubjectModal}
        setIsOpen={setIsAddSubjectModal}
        top="15rem"
      >
        <div className={styles.inner}>
          <div className={styles.inputWrapper} data-tutorial={4}>
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
            tutorial={5}
          />
          <div className={styles.submit} data-tutorial={6}>
            <BlobBtn
              onClick={() => {
                onSubmit(subject);
              }}
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
