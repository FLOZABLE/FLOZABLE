import React, { useEffect } from "react";
import { useState } from "react";
import styles from "./SubjectManager.module.css";
import SubjectToolManager from "../SubjectToolManager/SubjectToolManager";
import SubjectIcon from "../SubjectIcon/SubjectIcon";
import LineInput from "../LineInput/LineInput";
import SelectIcon from "../SelectIcon/SelectIcon";
import ColorPalette from "../ColorPalette/ColorPalette";
import { subjectIcons } from "../../../constant";
import BlobBtn from "../BlobBtn/BlobBtn";
import SelectTool from "../SelectTool.js/SelectTool";

function SubjectManager({ subject, setSelectedSubject, selectedSubject }) {

  const [selectedColor, setSelectedColor] = useState(null);
  const [isSelectColor, setIsSelectColor] = useState(false);
  const [selectedIcon, setSelectedIcon] = useState({ el: null });
  const [isSelectIcon, setIsSelectIcon] = useState(false);
  const [selectedTool, setSelectedTool] = useState([]);
  const [isSelectTool, setIsSelectTool] = useState(false);

  const [name, setName] = useState("");

  useEffect(() => {
    if (!subject) return;
    const { icon, name, color } = subject;
    setSelectedIcon({ el: subjectIcons[icon], name: icon });
    setSelectedColor(color);
    setName(name);
  }, [subject]);

  useEffect(() => {
    if (isSelectColor || isSelectIcon) {
      setSelectedSubject(prev => ({ ...prev, id: subject.id }));
    }
  }, [isSelectColor, isSelectIcon]);

  return (
    <div className={styles.SubjectManager}>
      <div className={styles.title}>
        <LineInput
          title={"Name"}
          value={name}
          setValue={(name) => { setName(name); setSelectedSubject(prev => ({ ...prev, id: subject.id })); }}
          type={"text"}
        />
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
      {selectedSubject?.id === subject?.id ?
        <BlobBtn name={"SUBMIT"} setClicked={() => { setSelectedSubject({ color: selectedColor, icon: selectedIcon.name, id: subject.id, name, submit: true }) }} />
        : null
      }
    </div>
  );
}

export default SubjectManager;