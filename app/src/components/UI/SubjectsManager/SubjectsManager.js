import React from "react";
import { useState, useEffect } from 'react';
import styles from "./SubjectsManager.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck, faXmark } from "@fortawesome/free-solid-svg-icons";
import SubjectManager from "../SubjectManager/SubjectManager";
import EditSubjectModal from "../EditSubjectModal/EditSubjectModal";
import { WritePen, Book, Microscope, Article, Coding, Globe, Workout, Alert } from "../../../utils/svgs";

const subjectIcons = {
    "Book": <Book width={"40px"} height={"40px"} fill={"#000"} opt1={"#000"} />,
    "Coding": <Coding width={"40px"} height={"40px"} fill={"#000"} opt1={"#000"} />,
    "Microscope": <Microscope width={"40px"} height={"40px"} fill={"#000"} opt1={"#000"} />,
    "WritePen": <WritePen width={"40px"} height={"40px"} fill={"#000"} opt1={"#000"} />,
    "Article": <Article width={"40px"} height={"40px"} fill={"#000"} opt1={"#000"} />,
    "Globe": <Globe width={"40px"} height={"40px"} fill={"#000"} opt1={"#000"} />,
    "Workout": <Workout width={"40px"} height={"40px"} fill={"#000"} opt1={"#000"} />,
    "Alert": <Alert width={"40px"} height={"40px"} fill={"#000"} opt1={"#000"} />
};

function SubjectsManager({ subjects, setSubjects, setResponse }) {
    const [isEditSubjectModal, setisEditSubjectModal] = useState(true);
    const [selectedSubject, setSelectedSubject] = useState(null);
    const [editModal, setEditModal] = useState(<div></div>);

    useEffect(() => {
        if (!selectedSubject) return;

        console.log(selectedSubject.color);

        setisEditSubjectModal(true);

        setEditModal(
            <EditSubjectModal
                subject={selectedSubject}
                subjects={subjects}
                setSubjects={setSubjects}
                setResponse={setResponse}
                isEditSubjectModal={isEditSubjectModal}
                setisEditSubjectModal={setisEditSubjectModal}
                defaultColor={selectedSubject.color}
                defaultIcon={{ name: selectedSubject.icon, el: subjectIcons[selectedSubject.icon] }}
            />
        );

    }, [selectedSubject])

    return (
        <div className={styles.SubjectsManager}>
            {editModal}
            {
                subjects.map((subject, i) => {
                    return (
                        <SubjectManager key={i} subject={subject} setSelectedSubject={setSelectedSubject} />
                    )
                })
            }
        </div>
    );
}

export default SubjectsManager;