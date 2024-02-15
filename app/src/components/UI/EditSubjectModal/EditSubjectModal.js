import React, { useCallback, useEffect, useState } from "react";
import styles from "./EditSubjectModal.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBook, faXmark } from "@fortawesome/free-solid-svg-icons";
import CustomInput from "../CustomInput/CustomInput";
import ColorPalette from "../ColorPalette/ColorPalette";
import BlobBtn from "../BlobBtn/BlobBtn";
import SelectIcon from "../SelectIcon/SelectIcon";
import { WritePen, Book, Microscope, Article, Coding, Globe, Workout, Alert } from "../../../utils/svgs";

const subjectIcons = {
  "Book": <Book width={"40px"} height={"40px"} fill={"#000"} opt1={"#000"} />,
  "Coding": <Coding width={"40px"} height={"40px"} fill={"#000"} opt1={"#000"} />,
  "Microscope": <Microscope width={"40px"} height={"40px"} fill={"#000"} opt1={"#000"} />,
  "WritePen": <WritePen width={"40px"} height={"40px"} fill={"#000"} opt1={"#000"} />,
  "Article": <Article width={"40px"} height={"40px"} fill={"#000"} opt1={"#000"} />,
  "Globe": <Globe width={"40px"} height={"40px"} fill={"#000"} opt1={"#000"} />,
  "Workout": <Workout width={"40px"} height={"40px"} fill={"#000"} opt1={"#000"} />,
  "Alert": <Alert width={"40px"} height={"40px"} fill={"#000"} opt1={"#000"} />
};

const serverOrigin = process.env.REACT_APP_ORIGIN;

function EditSubjectModal({
  isEditSubjectModal,
  setIsEditSubjectModal,
  subjects,
  setSubjects,
  subject,
  setResponse
}) {
  const [name, setName] = useState("");
  const [selectedColor, setSelectedColor] = useState({el: null});
  const [isSelectColor, setIsSelectColor] = useState(false);
  const [selectedIcon, setSelectedIcon] = useState({el: null});
  const [isSelectIcon, setIsSelectIcon] = useState(false);

  const handleNameInput = (e) => {
    setName(e.target.value);
  };

  const submit = useCallback(() => {
    fetch(`${serverOrigin}/study/modify-subject`, {
      method: "post",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: name,
        color: selectedColor,
        icon: selectedIcon.name,
        id: subject.id,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        setResponse(data);
        if (data.success) {
          setIsEditSubjectModal(false);
          let newState = [...subjects];
          newState = newState.filter((subject) => subject.id != data.subjectInfo.id);
          newState.push({ ...data.subjectInfo });
          setSubjects(newState);
          //clear new subject info from modal
          setSelectedColor(null);
          setSelectedIcon({ name: null, el: null });
          setName("");
        };
      })
      .catch((error) => console.error(error));
  }, [selectedColor, selectedIcon, name]);

  useEffect(() => {
    if (!subject) return;
    const icon = subjectIcons[subject.icon];
    setSelectedIcon({el: icon, name: subject.icon});
    setSelectedColor(subject.color);
    setName(subject.name);
  }, [subject]);

  return (
    <div
      className={`${styles.EditSubjectModal} modal ${isEditSubjectModal ? "open" : ""
        }`}
    >
      <div className={styles.header}>
        <i
          onClick={() => {
            setIsEditSubjectModal(false);
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
            placeHolder={subject?.name}
            type={"text"}
          />
        </div>
        <SelectIcon
          selectedIcon={selectedIcon}
          setSelectedIcon={setSelectedIcon}
          isSelectIcon={isSelectIcon}
          setIsSelectIcon={setIsSelectIcon}
          setIsSelectColor={setIsSelectColor}
        />
        <ColorPalette
          setSelectedColor={setSelectedColor}
          selectedColor={selectedColor}
          isSelectColor={isSelectColor}
          setIsSelectColor={setIsSelectColor}
          setIsSelectIcon={setIsSelectIcon}
        />
        <div className={styles.submit}>
          <BlobBtn name={"SUBMIT"} setClicked={submit} />
        </div>
      </div>
    </div>
  );
}

export default EditSubjectModal;