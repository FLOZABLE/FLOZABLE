import React from "react";
import { useState, useEffect } from 'react';
import styles from "./SubjectsManager.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck, faXmark } from "@fortawesome/free-solid-svg-icons";
import SubjectManager from "../SubjectManager/SubjectManager";
import EditSubjectModal from "../EditSubjectModal/EditSubjectModal";
import { WritePen, Book, Microscope, Article, Coding, Globe, Workout, Alert } from "../../../utils/svgs";

function SubjectsManager({ subjects, setSubjects, setResponse }) {
  const [isEditSubjectModal, setIsEditSubjectModal] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState(null);

  return (
    <div className={styles.SubjectsManager}>
        <EditSubjectModal
          subject={selectedSubject}
          subjects={subjects}
          setSubjects={setSubjects}
          setResponse={setResponse}
          isEditSubjectModal={isEditSubjectModal}
          setIsEditSubjectModal={setIsEditSubjectModal}
        />
      {
        subjects.map((subject, i) => {
          return (
            <SubjectManager key={i} subject={subject} setSelectedSubject={setSelectedSubject} setIsEditSubjectModal={setIsEditSubjectModal} setResponse={setResponse} />
          )
        })
      }
    </div>
  );
}

export default SubjectsManager;