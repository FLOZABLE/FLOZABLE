import React, { useRef, useState, useEffect } from "react";
import styles from "./StudySubjectTool.module.css";
import Draggable from "react-draggable";
function StudySubjectTool({ toolType }) {
  const [toolEl, setToolEl] = useState(<div></div>);
  const remRatio = parseFloat(getComputedStyle(document.documentElement).fontSize);
  useEffect(() => {
    if (toolType === "-1") {
      setToolEl(<div>No tools for current subject</div>);
    }
    else if (toolType === "0") {
      setToolEl(<iframe src="https://www.desmos.com/scientific" height={21.875 * remRatio} width={25 * remRatio} allowfullscreen></iframe>)
    }
    else if (toolType === "1") {
      setToolEl(<iframe src="https://www.desmos.com/calculator" height={25 * remRatio} width={46.875 * remRatio} allowfullscreen></iframe>)
    }
    else if (toolType === "2") {
      setToolEl(<iframe src="https://pubchem.ncbi.nlm.nih.gov/periodic-table/#view=table&embed=true" height={34.375 * remRatio} width={46.874 * remRatio}></iframe>);
    }
    else if (toolType === "3") {
      setToolEl(<iframe src="https://www.web-whiteboard.io" height={34.375 * remRatio} width={46.874 * remRatio}></iframe>);
    }
    else if (toolType === "4") {
      setToolEl(<div>Tool 2</div>);
    }
    else if (toolType === "5") {
      setToolEl(<div>Tool 3</div>);
    }
  }, [toolType]);

  return (
    <div className={styles.StudySubjectTool}>
      {toolEl}
    </div>
  );
}

export default StudySubjectTool;
