import React, { useCallback, useContext } from "react";
import { useState, useEffect } from "react";
import styles from "./SubjectsManager.module.css";
import SubjectManager from "../SubjectManager/SubjectManager";
import config from "@/app/utils/config";
import { ResponseContext } from "@/app/utils/Contexts";
import { subjectIcons } from "@/app/utils/Constant";
import { Alert } from "@/app/utils/Svg";
import BlobBtn from "../../Buttons/BlobBtn/BlobBtn";
import { useSubjects } from "@/Hooks/subjectsHooks";

function SubjectsManager() {
  const { subjects, setSubjects, useSubjectsRefetch } = useSubjects();
  const { setResponse } = useContext(ResponseContext);

  const [selectedSubject, setSelectedSubject] = useState({
    submit: false,
    color: null,
    icon: null,
    name: null,
    id: null,
    tools: [],
  });

  useEffect(() => {
    if (!selectedSubject || !selectedSubject.submit) return;

    const { id, icon, color, name, tools } = selectedSubject;
    fetch(`${config.server}/subjects`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name,
        color,
        icon,
        id,
        tools,
      }),
      credentials: "include",
    })
      .then((response) => response.json())
      .then((data) => {
        setResponse(data);
        if (data.success) {
          let tempState = [...subjects];
          let updatedSubject = tempState.find(
            (subject) => subject.id === data.subjectInfo.id
          );
          tempState = tempState.filter(
            (subject) => subject.id !== data.subjectInfo.id
          );
          updatedSubject = {
            ...updatedSubject,
            color: data.subjectInfo.color,
            icon: data.subjectInfo.icon,
            name: data.subjectInfo.name,
            tools: data.subjectInfo.tools,
          };
          let newState = subjects;
          // Using {...subjects} results in an error because it would then be an object
          // and no longer have the .reduce() function from Array
          tempState.push(updatedSubject);
          for (let i = 0; i < tempState.length; i++) {
            newState[i] = tempState[i];
          }
          setSubjects(newState);
        }
        setSelectedSubject((prev) => ({ ...prev, submit: false }));
      })
      .catch((error) => console.error(error));
  }, [selectedSubject]);

  const deleteSubject = useCallback(() => {
    fetch(`${config.server}/subjects`, {
      method: "delete",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        subjectId: selectedSubject.id,
      }),
      credentials: "include",
    })
      .then((response) => response.json())
      .then((data) => {
        setResponse(data);
        setSelectedSubject({
          submit: false,
          color: null,
          icon: null,
          name: null,
          id: null,
          tools: [],
        });
        if (data.success) {
          useSubjectsRefetch();
        }
      });
  }, [selectedSubject]);

  return (
    <div className={`customScroll ${styles.SubjectsManager}`}>
      {selectedSubject.id !== null ? (
        <SubjectManager
          subject={selectedSubject}
          setSelectedSubject={setSelectedSubject}
          selectedSubject={selectedSubject}
          deleteSubject={deleteSubject}
        />
      ) : (
        <div className={styles.subjectSelector}>
          {subjects.map((subject, i) => {
            let icon = subjectIcons[subject.icon];

            if (!icon) {
              icon = <Alert />;
            }

            return (
              <div key={i} className={styles.subject}>
                <BlobBtn
                  color2={subject.color}
                  onClick={() => {
                    setSelectedSubject(subject);
                  }}
                  style={{
                    width: "100%",
                    display: "flex",
                    justifyContents: "center",
                  }}
                >
                  <i>{icon}</i>
                  <div className={`overflowDot ${styles.name}`}>
                    {subject.name}
                  </div>
                </BlobBtn>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default SubjectsManager;
