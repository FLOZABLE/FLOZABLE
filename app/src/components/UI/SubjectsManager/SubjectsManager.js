import React from "react";
import { useState, useEffect } from 'react';
import styles from "./SubjectsManager.module.css";
import SubjectManager from "../SubjectManager/SubjectManager";

const serverOrigin = process.env.REACT_APP_ORIGIN;

function SubjectsManager({ subjects, setSubjects, setResponse }) {
  const [selectedSubject, setSelectedSubject] = useState({
    submit: false,
    color: null,
    icon: null,
    name: null,
    id: null,
    tools: []
  });

  useEffect(() => {
    if (!selectedSubject || !selectedSubject.submit) return;

    const { id, icon, color, name, tools } = selectedSubject;
    fetch(`${serverOrigin}/study/modify-subject`, {
      method: "post",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name,
        color,
        icon,
        id,
        tools
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        setResponse(data);
        if (data.success) {
          /* let newState = [...subjects];
          newState = newState.filter((subject) => subject.id != data.subjectInfo.id);
          newState.push({ ...data.subjectInfo });
          setSubjects(newState); */
          //clear new subject info from modal
        };
        setSelectedSubject(prev => ({...prev, submit: false}))
      })
      .catch((error) => console.error(error));
  }, [selectedSubject]);

  return (
    <div className={`${styles.SubjectsManager} customScroll`}>
      {/* <EditSubjectModal
        subject={selectedSubject}
        subjects={subjects}
        setSubjects={setSubjects}
        setResponse={setResponse}
        isEditSubjectModal={isEditSubjectModal}
        setIsEditSubjectModal={setIsEditSubjectModal}
      /> */}
      {
        subjects.map((subject, i) => {
          return (
            <SubjectManager key={i} subject={subject} setSelectedSubject={setSelectedSubject} selectedSubject={selectedSubject} />
          )
        })
      }
    </div>
  );
}

export default SubjectsManager;