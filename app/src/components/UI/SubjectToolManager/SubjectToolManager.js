import React from "react";
import { useState, useEffect } from 'react';
import styles from "./SubjectToolManager.module.css";
import { AllTools } from "../../../utils/SubjectTools";
import BlobBtn from "../BlobBtn/BlobBtn";

const serverOrigin = process.env.REACT_APP_ORIGIN;

function SubjectToolManager({ subject, isSubjectToolManager, setIsSubjectToolManager, setResponse }) {

  const [savedTools, setSavedTools] = useState([]);
  const [otherTools, setOtherTools] = useState([]);

  useEffect(() => {
    if (!subject.tools && subject.tools !== "") return;

    const subjectTools = subject.tools.split(",");
    let availableTools = [...AllTools];
    const tempTools = [];

    if (subjectTools.length && !!subjectTools[0]) {

      subjectTools.map((currentTool) => {
        tempTools.push(AllTools[parseInt(currentTool)]);
        availableTools = availableTools.filter((tool) => tool.split(",")[0] !== currentTool);
      });
    }

    setOtherTools(availableTools);
    setSavedTools(tempTools);
  }, [subject]);

  const addTool = (toolName) => {
    if (!toolName) return;
    const toolIndex = toolName.split(",")[0];
    setOtherTools(otherTools.filter((tool) => !tool.startsWith(toolIndex)));
    setSavedTools([...savedTools, AllTools[parseInt(toolIndex)]]);
  }

  const removeTool = (toolName) => {
    if (!toolName) return;
    const toolIndex = toolName.split(",")[0];
    setSavedTools(savedTools.filter((tool) => !tool.startsWith(toolIndex)));
    setOtherTools([...otherTools, AllTools[parseInt(toolIndex)]]);
  }

  const submit = () => {
    let subjectToolString = "";
    savedTools.map((tool) => {
      subjectToolString += tool.split(",")[0] + ",";
    })
    subjectToolString = subjectToolString.substring(0, subjectToolString.length - 1);

    fetch(`${serverOrigin}/study/modify-subject-tools`, {
      method: "post",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        tools: subjectToolString,
        id: subject.id,
        name: subject.name,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        setResponse(data);
        if (data.success) {
          setIsSubjectToolManager(false);
        };
      })
      .catch((error) => console.error(error));
  }

  return (
    <div className={styles.SubjectToolManager}>
      <div className={isSubjectToolManager ? styles.open : styles.hidden}>
        {
          savedTools.map((tool, i) => {
            return (
              <li
                className={styles.removeTool}
                onClick={() => { removeTool(tool) }}
                key={i}
              >
                - {tool.split(",")[1]}
              </li>
            );
          })
        }
        {
          savedTools.length > 0 ?
            <hr></hr>
            :
            <div />
        }
        {
          otherTools.map((tool, i) => {
            return (
              <li
                className={styles.addTool}
                onClick={() => { addTool(tool) }}
                key={i}
              >
                + {tool.split(",")[1]}
              </li>
            );
          })
        }
        <BlobBtn delay={-1} name="Save" setClicked={submit} />
      </div>
    </div>
  );
}

export default SubjectToolManager;