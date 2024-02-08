import React from "react";
import styles from "./SubjectsManager.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck, faXmark } from "@fortawesome/free-solid-svg-icons";
import SubjectManager from "../SubjectManager/SubjectManager";

function SubjectsManager({ subjects }) {
    return (
        <div className={styles.SubjectsManager}>
            {
                subjects.map((subject, i) => {
                    return (
                        <SubjectManager key={i} subject = {subject}/>
                    )
                })
            }
        </div>
    );
}

export default SubjectsManager;