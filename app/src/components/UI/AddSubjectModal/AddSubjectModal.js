import React, { useEffect, useState } from "react";
import styles from "./AddSubjectModal.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBook, faXmark } from "@fortawesome/free-solid-svg-icons";
import CustomInput from "../CustomInput/CustomInput";
import ColorPalette from "../ColorPalette/ColorPalette";
import BlobBtn from "../BlobBtn/BlobBtn";
import SelectIcon from "../SelectIcon/SelectIcon";
import { sortNewSubject } from "../../../utils/timelineSorting";

const serverOrigin = process.env.REACT_APP_ORIGIN;

function AddSubjectModal(props) {
  const { isAddSubjectModal, setIsAddSubjectModal, setAddSubjectResponse, subjects, setSubjects, setSubject } = props;

  const [name, setName] = useState('');
  const [selectedColor, setSelectedColor] = useState(null);
  const [isSelectColor, setIsSelectColor] = useState(false);
  const [selectedIcon, setSelectedIcon] = useState({ name: null, el: null });
  const [isSelectIcon, setIsSelectIcon] = useState(false);
  const [isSubmit, setIsSubmit] = useState(false);

  const handleNameInput = (e) => {
    setName(e.target.value);
  };

  useEffect(() => {
    /* props.setSubjects([]); */
    if (isSubmit) {
      fetch(`${serverOrigin}/api/study/add-subject`,
      {
        method: 'post',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({name: name, color: selectedColor, icon: selectedIcon.name})
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
          setSubject(newSubject);
        }
      })
      .catch((error) => console.error(error));
    };
  }, [isSubmit]);
  
  return (
    <div className={`${styles.AddSubjectModal} modal ${isAddSubjectModal ? 'open' : ''}`}>
      <div className={styles.header}>
        <i onClick={() => {setIsAddSubjectModal(false)}}>
          <FontAwesomeIcon icon={faXmark} />
        </i>
      </div>
      <div className={styles.content}>
        <div className={styles.inputWrapper}>
        <CustomInput input={name} handleInput={handleNameInput} icon={faBook} placeHolder={"Subject Name"} type={"text"} />
        </div>
        <SelectIcon selectedIcon={selectedIcon} setSelectedIcon={setSelectedIcon} isSelectIcon={isSelectIcon} setIsSelectIcon={setIsSelectIcon} setIsSelectColor={setIsSelectColor} />
        <ColorPalette setSelectedColor={setSelectedColor} selectedColor={selectedColor} isSelectColor={isSelectColor} setIsSelectColor={setIsSelectColor} setIsSelectIcon={setIsSelectIcon} />
        <div className={styles.submit}>
        <BlobBtn name={'SUBMIT'} setClicked={setIsSubmit} />
        </div>
      </div>
    </div>
  )
};

export default AddSubjectModal;