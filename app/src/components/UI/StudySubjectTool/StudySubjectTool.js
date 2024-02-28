import React, { useRef, useState, useEffect } from "react";
import styles from "./StudySubjectTool.module.css";
import Draggable from "react-draggable";
function StudySubjectTool({ toolType }) {
    const [toolEl, setToolEl] = useState(<div></div>);
    useEffect(() => {
        if (toolType === "-1") {
            setToolEl(<div>No tools for current subject</div>);
        }
        else if (toolType === "0") {
            setToolEl(<iframe src="https://www.desmos.com/scientific" height="21.875rem" width="25rem" allowfullscreen></iframe>)
        }
        else if (toolType === "1") {
            setToolEl(<iframe src="https://www.desmos.com/calculator" height="25rem" width="46.875rem" allowfullscreen></iframe>)
        }
        else if (toolType === "2") {
            setToolEl(<iframe src="https://pubchem.ncbi.nlm.nih.gov/periodic-table/#view=table&embed=true" height="34.375rem" width="46.875rem"></iframe>);
        }
        else if (toolType === "3") {
            setToolEl(<div>Tool 1</div>);
        }
        else if (toolType === "4") {
            setToolEl(<div>Tool 2</div>);
        }
        else if (toolType === "5") {
            setToolEl(<div>Tool 3</div>);
        }
    }, [toolType]);

    return (
        <div>
            {toolEl}
        </div>
    );
}

export default StudySubjectTool;
