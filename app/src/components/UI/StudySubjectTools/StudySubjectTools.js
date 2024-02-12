import { useRef } from "react";
import styles from "./StudySubjectTools.module.css";
import Draggable from "react-draggable";
import StudySubjectTool from "../StudySubjectTool/StudySubjectTool";
function StudySubjectTools({ element, isDisp, startPos }) {
    const ref = useRef();
    const toolResults = [1, 2, 2, 3];
    return (
        <div>
            {
                toolResults.map((tool, i) => {
                    return (
                        <Draggable key={i} positionOffset={{ x: startPos.x, y: startPos.y }} nodeRef={ref}>
                            <div
                                ref={ref}
                                className={`${styles.StudyModalContainer} ${isDisp ? styles.visible : ""}`}
                            >
                                <div className={styles.inner}>
                                    <StudySubjectTool toolType = {tool}></StudySubjectTool>
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
