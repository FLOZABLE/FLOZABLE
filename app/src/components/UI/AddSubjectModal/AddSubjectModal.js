import React, {useState} from "react";
import styles from "./AddSubjectModal.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBook, faXmark } from "@fortawesome/free-solid-svg-icons";
import CustomInput from "../CustomInput/CustomInput";
import ColorPalette from "../ColorPalette/ColorPalette";

function AddSubjectModal(props) {
  const {isAddSubjectModal, setIsAddSubjectModal} = props;

  const [name, setName] = useState('');

  const handleNameInput = (e) => {
    setName(e.target.value);
  }
  return (
    <div className={`${styles.AddSubjectModal} ${isAddSubjectModal ? styles.open : ''}`}>
      <div className={styles.header}>
        <i>
        <FontAwesomeIcon icon={faXmark} />
        </i>
      </div>
      <div className={styles.content}>
        <CustomInput input={name} handleInput={handleNameInput} icon={faBook} placeHolder={"Subject Name"} type={"text"} />
        <ColorPalette />
      </div>

    </div>
  )
};

export default AddSubjectModal;