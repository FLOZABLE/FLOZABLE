import React, { useEffect } from "react";
import { useState } from "react";
import styles from "./SubjectManager.module.css";
import LineInput from "../../Inputs/LineInput/LineInput";
import SelectIcon from "../../Inputs/SelectIcon/SelectIcon";
import ColorPalette from "../../Inputs/ColorPalette/ColorPalette";
import BlobBtn from "../../Buttons/BlobBtn/BlobBtn";
import SelectTool from "../../Inputs/SelectTool.js/SelectTool";
import { subjectIcons } from "@/app/utils/Constant";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrashCan } from "@fortawesome/free-solid-svg-icons";

function SubjectManager({
  subject,
  setSelectedSubject,
  selectedSubject,
  deleteSubject,
}) {
  const [selectedColor, setSelectedColor] = useState(null);
  const [isSelectColor, setIsSelectColor] = useState(false);
  const [selectedIcon, setSelectedIcon] = useState({ el: null });
  const [isSelectIcon, setIsSelectIcon] = useState(false);
  const [selectedTool, setSelectedTool] = useState([]);
  const [isSelectTool, setIsSelectTool] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  const [name, setName] = useState("");

  useEffect(() => {
    if (!subject) return;
    const { icon, name, color } = subject;
    setSelectedIcon({ el: subjectIcons[icon], name: icon });
    setSelectedColor(color);
    const tools = Array.isArray(subject.tools)
      ? subject.tools
      : subject.tools.length
      ? subject.tools.split(",")
      : [];
    setSelectedTool(tools);
    setName(name);
  }, [subject]);

  useEffect(() => {
    if (isSelectColor || isSelectIcon || isSelectTool || name) {
      setSelectedSubject((prev) => ({
        ...prev,
        color: selectedColor,
        icon: selectedIcon.name,
        tools: selectedTool,
        id: subject.id,
        name: name,
      }));
    }
  }, [isSelectColor, isSelectIcon, isSelectTool, name]);

  useEffect(() => {
    if (!selectedSubject || selectedSubject.id !== subject.id) {
      setIsSelectIcon(false);
      setIsSelectTool(false);
      setIsSelectColor(false);
    }
  }, [selectedSubject]);

  useEffect(() => {
    if (isSelectColor) {
      setIsSelectIcon(false);
      setIsSelectTool(false);
    }
  }, [isSelectColor]);

  useEffect(() => {
    if (isSelectIcon) {
      setIsSelectColor(false);
      setIsSelectTool(false);
    }
  }, [isSelectIcon]);

  useEffect(() => {
    if (isSelectTool) {
      setIsSelectIcon(false);
      setIsSelectColor(false);
    }
  }, [isSelectTool]);

  return (
    <div className={styles.SubjectManager}>
      <div className={styles.title}>
        <div>
          <LineInput
            title={""}
            value={name}
            setValue={(name) => {
              setName(name);
            }}
            type={"text"}
          />
        </div>
      </div>
      <div className={styles.column}>
        <SelectIcon
          selectedIcon={selectedIcon}
          setSelectedIcon={setSelectedIcon}
          isSelectIcon={isSelectIcon}
          setIsSelectIcon={setIsSelectIcon}
          setIsSelectColor={setIsSelectColor}
        />
      </div>
      <div className={styles.column}>
        <SelectTool
          setSelectedTool={setSelectedTool}
          selectedTool={selectedTool}
          isSelectTool={isSelectTool}
          setIsSelectColor={setIsSelectColor}
          setIsSelectIcon={setIsSelectIcon}
          setIsSelectTool={setIsSelectTool}
        />
      </div>
      <div className={styles.column}>
        <ColorPalette
          setSelectedColor={setSelectedColor}
          selectedColor={selectedColor}
          isSelectColor={isSelectColor}
          setIsSelectColor={setIsSelectColor}
          setIsSelectIcon={setIsSelectIcon}
        />
      </div>
      {deleteConfirm ? (
        <div className={styles.confirmDelete}>
          <p>Confirm? This action cannot be undone</p>
          <br />
        </div>
      ) : null}
      <div className={styles.actionButtons}>
        <button
          className={styles.cancelButton}
          onClick={() =>
            setSelectedSubject({
              submit: false,
              color: null,
              icon: null,
              name: null,
              id: null,
              tools: [],
            })
          }
        >
          Cancel
        </button>
        <BlobBtn
          onClick={() => {
            setSelectedSubject({
              color: selectedColor,
              icon: selectedIcon.name,
              id: subject.id,
              name,
              tools: selectedTool,
              submit: true,
            });
          }}
        >
          SUBMIT
        </BlobBtn>
        {deleteConfirm ? (
          <BlobBtn
            onClick={() => {
              deleteSubject(subject.id);
            }}
          >
            Confirm
          </BlobBtn>
        ) : (
          <BlobBtn
            onClick={() => {
              setDeleteConfirm(true);
            }}
          >
            <FontAwesomeIcon icon={faTrashCan} className={styles.deleteIcon} />
          </BlobBtn>
        )}
      </div>
    </div>
  );
}

export default SubjectManager;
