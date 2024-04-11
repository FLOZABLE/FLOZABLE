import React, { useEffect } from "react";
import { useState } from "react";
import styles from "./SubjectManager.module.css";
import LineInput from "../../Inputs/LineInput/LineInput";
import SelectIcon from "../../Inputs/SelectIcon/SelectIcon";
import ColorPalette from "../../Inputs/ColorPalette/ColorPalette";
import BlobBtn from "../../Buttons/BlobBtn/BlobBtn";
import SelectTool from "../../Inputs/SelectTool.js/SelectTool";

function SubjectManager({ subject, setSelectedSubject, selectedSubject, deleteSubject }) {

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
    console.log(subject);
    const tools = Array.isArray(subject.tools) ? subject.tools : subject.tools.length ? subject.tools.split(",") : [];
    setSelectedTool(tools);
    setName(name);
  }, [subject]);

  useEffect(() => {
    if (isSelectColor || isSelectIcon || isSelectTool) {
      setSelectedSubject(prev => ({ ...prev, id: subject.id }));
    }
  }, [isSelectColor, isSelectIcon, isSelectTool]);

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
    };
  }, [isSelectColor]);

  useEffect(() => {
    if (isSelectIcon) {
      setIsSelectColor(false);
      setIsSelectTool(false);
    };
  }, [isSelectIcon]);

  useEffect(() => {
    if (isSelectTool) {
      setIsSelectIcon(false);
      setIsSelectColor(false);
    };
  }, [isSelectTool]);

  return (
    <div className={styles.SubjectManager}>
      <div className={styles.title}>
        <div>
          <LineInput
            title={""}
            value={name}
            setValue={(name) => { setName(name); setSelectedSubject(prev => ({ ...prev, id: subject.id })); }}
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
      {
        deleteConfirm ?
          <div className={styles.confirmDelete}>
            <p>Note: Deleted subjects will still be visible in stats if you've studied the subject today</p>
            <br />
          </div>
          :
          null
      }
      <div className={styles.actionButtons}>
        <button
          className={styles.cancelButton}
          onClick={() => setSelectedSubject({ submit: false, color: null, icon: null, name: null, id: null, tools: [] })}
        >
          Cancel
        </button>
        <BlobBtn name={"SUBMIT"} setClicked={() => { setSelectedSubject({ color: selectedColor, icon: selectedIcon.name, id: subject.id, name, tools: selectedTool, submit: true }) }} />
        {
          deleteConfirm ?
            <BlobBtn name={"Confirm"} setClicked={() => { deleteSubject(subject.id) }} color2="red" />
            :
            <BlobBtn name={"DELETE"} setClicked={() => { setDeleteConfirm(true) }} color2="red" />
        }
      </div>
    </div>
  );
}

export default SubjectManager;