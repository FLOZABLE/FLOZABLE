import React, { useCallback, useEffect, useRef, useState } from "react";
import Draggable from "react-draggable";
import styles from "./AddSubjectModal.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBook, faXmark } from "@fortawesome/free-solid-svg-icons";
import CustomInput from "../CustomInput/CustomInput";
import ColorPalette from "../ColorPalette/ColorPalette";
import BlobBtn from "../BlobBtn/BlobBtn";
import SelectIcon from "../SelectIcon/SelectIcon";
import { sortNewSubject } from "../../../utils/timelineSorting";
import { useSearchParams, useLocation } from "react-router-dom";

const serverOrigin = process.env.REACT_APP_ORIGIN;

function AddSubjectModal({
  isAddSubjectModal,
  setIsAddSubjectModal,
  setAddSubjectResponse,
  subjects,
  setSubjects,
  tutorialBoxRef,
  tutorialTextRef,
}) {
  const [name, setName] = useState("");
  const [selectedColor, setSelectedColor] = useState(null);
  const [isSelectColor, setIsSelectColor] = useState(false);
  const [selectedIcon, setSelectedIcon] = useState({ name: null, el: null });
  const [isSelectIcon, setIsSelectIcon] = useState(false);
  const location = useLocation();

  const [searchParams, setSearchParams] = useSearchParams();
  const addSubjectModalRef = useRef(null);

  useEffect(() => {
    if (location.search.includes('tutorial')) return;
    setIsAddSubjectModal(false);
  }, [location]);

  useEffect(() => {
    if (!searchParams) return;

    const tutorial = searchParams.get("tutorial");
    if (tutorial && parseInt(tutorial) === 4) {

      setTimeout(() => {
        const { width, top, left, height, bottom } = addSubjectModalRef.current.getBoundingClientRect();
        tutorialBoxRef.current.style.left = left + 'px';
        tutorialBoxRef.current.style.top = top - 25 + 'px';
        tutorialBoxRef.current.style.width = 0;
        tutorialBoxRef.current.style.height = height + 'px';

        tutorialTextRef.current.style.top = top - 50 + 'px';
        tutorialTextRef.current.style.left = left + 'px';
        tutorialTextRef.current.innerText = "Enter the subject details!";
      }, 500);
    }
  }, [searchParams]);

  const handleNameInput = (e) => {
    setName(e.target.value);
  };

  const submit = useCallback(() => {
    fetch(`${serverOrigin}/study/add-subject`, {
      method: "post",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: name,
        color: selectedColor,
        icon: selectedIcon.name,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        setAddSubjectResponse(data);
        if (data.success) {
          const newSubject = sortNewSubject(subjects, data.info.subjectInfo);
          setIsAddSubjectModal(false);
          setSubjects((prevSubjects) => {
            const newState = [...prevSubjects];
            newState.push(newSubject);
            newState.daily = prevSubjects.daily;
            newState.monthly = prevSubjects.monthly;
            newState.weekly = prevSubjects.weekly;

            return newState;
          });
          //clear new subject info from modal
          setSelectedColor(null);
          setSelectedIcon({ name: null, el: null });
          setName("");
          const tutorial = searchParams.get("tutorial");
          if (tutorial === "4") {
            setSearchParams({ ...searchParams, tutorial: 5 })
          }
        }
      })
      .catch((error) => console.error(error));
  }, [selectedColor, selectedIcon, name, searchParams]);

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
            <BlobBtn name={"SUBMIT"} setClicked={submit} id="tutorial-4" />
          </div>
        </div>
      </div>
    </Draggable>
  );
}

export default AddSubjectModal;