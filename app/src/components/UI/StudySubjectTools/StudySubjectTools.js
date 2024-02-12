import { useRef, useState, useEffect } from "react";
import styles from "./StudySubjectTools.module.css";
import Draggable from "react-draggable";
import StudySubjectTool from "../StudySubjectTool/StudySubjectTool";
function StudySubjectTools({ isDisp, startPos, subject }) {
    const refArr = useRef(new Array())
    const [toolResults, setToolResults] = useState([]);

    useEffect(() => {
        if (!subject) return;
        if (subject.tools.length) {
            setToolResults(subject.tools.split(","));
        }
        else{
            setToolResults(["-1"]);
        }
    }, [subject]);

    return (
        <div>
            {
                toolResults.map((tool, i) => {
                    return (
                        <Draggable key={i} positionOffset={{ x: startPos.x, y: startPos.y }} nodeRef={(element) => refArr.current.push(element)}>
                            <div
                                ref={(element) => refArr.current.push(element)}
                                className={`${styles.StudyModalContainer} ${isDisp ? styles.visible : ""}`}
                            >
                                <div className={styles.inner}>
                                    <StudySubjectTool toolType={tool}></StudySubjectTool>
                                </div>
                            </div>
                        </Draggable>
                    )
                })
            }
        </div>
    );
}

export default StudySubjectTools;
