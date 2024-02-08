import React, { useCallback, useEffect, useState } from "react";
import styles from "./EditSubjectModal.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBook, faXmark } from "@fortawesome/free-solid-svg-icons";
import CustomInput from "../CustomInput/CustomInput";
import ColorPalette from "../ColorPalette/ColorPalette";
import BlobBtn from "../BlobBtn/BlobBtn";
import SelectIcon from "../SelectIcon/SelectIcon";
import { sortNewSubject } from "../../../utils/timelineSorting";

const serverOrigin = process.env.REACT_APP_ORIGIN;

function EditSubjectModal(props) {
    const {
        isEditSubjectModal,
        setisEditSubjectModal,
        subjects,
        setSubjects,
        subject,
        defaultColor,
        defaultIcon,
        setResponse
    } = props;

    const [name, setName] = useState("");
    const [selectedColor, setSelectedColor] = useState(defaultColor);
    const [isSelectColor, setIsSelectColor] = useState(false);
    const [selectedIcon, setSelectedIcon] = useState(defaultIcon);
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
                    setisEditSubjectModal(false);
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
        console.log(selectedColor, selectedIcon);
    }, [selectedColor, selectedIcon])

    return (
        <div
            className={`${styles.EditSubjectModal} modal ${isEditSubjectModal ? "open" : ""
                }`}
        >
            <div className={styles.header}>
                <i
                    onClick={() => {
                        setisEditSubjectModal(false);
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
                        placeHolder={subject.name}
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