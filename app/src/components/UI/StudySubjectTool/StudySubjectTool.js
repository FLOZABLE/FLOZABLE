import { useRef, useState, useEffect } from "react";
import styles from "./StudySubjectTool.module.css";
import Draggable from "react-draggable";
function StudySubjectTool({ toolType }) {
    const [toolEl, setToolEl] = useState(<div></div>);
    useEffect(() => {
        if (toolType === 1) {
            setToolEl(<iframe src="https://www.desmos.com/calculator" height="400px" width="750px" allowfullscreen></iframe>)
        }
        else if (toolType === 2) {
            setToolEl(<iframe src="https://www.desmos.com/scientific" height="350px" width="400px" allowfullscreen></iframe>)
        }
        else if (toolType === 3) {
            setToolEl(<iframe src="https://pubchem.ncbi.nlm.nih.gov/periodic-table/#view=table&embed=true" height="550px" width="750px"></iframe>);
        }
    }, [toolType])
    return (
        <div>
            {toolEl}
        </div>
    );
}

export default StudySubjectTool;
