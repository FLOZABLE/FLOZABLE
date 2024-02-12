import React from "react";
import { useState } from "react";
import styles from "./SubjectManager.module.css";
import SubjectToolManager from "../SubjectToolManager/SubjectToolManager";
import SubjectIcon from "../SubjectIcon/SubjectIcon";

function SubjectManager({ subject, setSelectedSubject, setIsEditSubjectModal, setResponse }) {

    const [isSubjectToolManager, setIsSubjectToolManager] = useState(false);

    return (
        <div className={styles.SubjectManager}>
            <table className={styles.table}>
                <tbody>
                    <tr className={styles.tableRow}>
                        <td style={{ color: subject.color }}>
                            {subject.name}
                            <p className={styles.editButton} onClick={() => { setSelectedSubject(subject); setIsEditSubjectModal(true) }}>
                                Edit
                            </p>
                        </td>
                        <td>
                            <div className={styles.iconWrapper}>
                                <SubjectIcon name={subject.icon} width="40px" height="40px" fill={subject.color} opt1={subject.color} />
                            </div>
                        </td>
                        <td>
                            <p className={styles.toggleToolsText} onClick={() => { setIsSubjectToolManager(!isSubjectToolManager) }}>
                                Manage Tools
                            </p>
                            <SubjectToolManager subject={subject} isSubjectToolManager={isSubjectToolManager} setIsSubjectToolManager={setIsEditSubjectModal} setResponse={setResponse} />
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    );
}

export default SubjectManager;