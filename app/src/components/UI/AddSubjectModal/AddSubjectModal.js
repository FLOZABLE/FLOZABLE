import React, { useCallback, useEffect, useRef, useState } from "react";
import styles from "./AddSubjectModal.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBook, faXmark } from "@fortawesome/free-solid-svg-icons";
import CustomInput from "../CustomInput/CustomInput";
import ColorPalette from "../ColorPalette/ColorPalette";
import BlobBtn from "../BlobBtn/BlobBtn";
import SelectIcon from "../SelectIcon/SelectIcon";
import { sortNewSubject } from "../../../utils/timelineSorting";
import { useSearchParams } from "react-router-dom";

const serverOrigin = process.env.REACT_APP_ORIGIN;

function AddSubjectModal({
  isAddSubjectModal,
  setIsAddSubjectModal,
  setAddSubjectResponse,
  subjects,
  setSubjects,
}) {
  const [name, setName] = useState("");
  const [selectedColor, setSelectedColor] = useState(null);
  const [isSelectColor, setIsSelectColor] = useState(false);
  const [selectedIcon, setSelectedIcon] = useState({ name: null, el: null });
  const [isSelectIcon, setIsSelectIcon] = useState(false);

  const [searchParams, setSearchParams] = useSearchParams();
  const addSubjectModalRef = useRef(null);

  useEffect(() => {
    if (!searchParams) return;

    const tutorial = searchParams.get("tutorial");
    if (tutorial && parseInt(tutorial) === 4) {
      const hole = document.getElementById("tutorialHole");
      const text = document.getElementById("tutorialText");

      setTimeout(() => {
        const { width, top, left, height, bottom } = addSubjectModalRef.current.getBoundingClientRect();
        hole.style.left = left + 'px';
        hole.style.top = top - 25 + 'px';
        hole.style.width = 0 + 'px';
        hole.style.height = 0 + 'px';
  
        text.style.top = top - 50 + 'px';
        text.style.left = left + 'px';
        text.innerText = "Enter information of the subject!";
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
          setSearchParams(prev => ({...prev, tutorial: 5}))
        }
      })
      .catch((error) => console.error(error));
  }, [selectedColor, selectedIcon, name]);

  return (
    <div
      className={`${styles.AddSubjectModal} modal ${
        isAddSubjectModal ? "open" : ""
      }`}
      ref={addSubjectModalRef}
    >
      <div className={styles.header}>
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
  );
}

export default AddSubjectModal;