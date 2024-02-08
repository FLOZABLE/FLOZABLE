import React from "react";
import styles from "./SubjectManager.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck, faXmark } from "@fortawesome/free-solid-svg-icons";
import {
    WritePen,
    Book,
    Microscope,
    Article,
    Coding,
    Globe,
    Workout,
    Alert,
  } from "../../../utils/svgs";

function SubjectManager({ subject }) {

    const subjectIcons = {
        "Book": <Book width={"40px"} height={"40px"} fill={"#000"} opt1={"#000"} />,
        "Coding": <Coding width={"40px"} height={"40px"} fill={"#000"} opt1={"#000"} />,
        "Microscope": <Microscope width={"40px"} height={"40px"} fill={"#000"} opt1={"#000"} />,
        "WritePen": <WritePen width={"40px"} height={"40px"} fill={"#000"} opt1={"#000"}/>,
        "Article": <Article width={"40px"} height={"40px"} fill={"#000"} opt1={"#000"} />,
        "Globe": <Globe width={"40px"} height={"40px"} fill={"#000"} opt1={"#000"} />,
        "Workout": <Workout width={"40px"} height={"40px"} fill={"#000"} opt1={"#000"} />,
        "Alert": <Alert width={"40px"} height={"40px"} fill={"#000"} opt1={"#000"} />
    };

    return (
        <div className={styles.SubjectManager}>
            <table className={styles.table}>
                <tbody>
                    <tr className={styles.tableRow}>
                        <td style = {{color: subject.color}}>
                            {subject.name}
                        </td>
                        <td>
                            {subjectIcons[subject.icon]}
                        </td>
                        <td>Three</td>
                    </tr>
                </tbody>
            </table>
        </div>
    );
}

export default SubjectManager;