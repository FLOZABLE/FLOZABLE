import React, { useEffect } from "react";
import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
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

function SubjectIcon({ name, width, height, fill, opt1 }) {
  const [iconEl, setIconEl] = useState(<div></div>);

  useEffect(() => {
    if (name === "Book") {
      setIconEl(<Book width={width} height={height} fill={fill} opt1={opt1} />);
    }
    else if (name === "Coding") {
      setIconEl(<Coding width={width} height={height} fill={fill} opt1={opt1} />);
    }
    else if (name === "Microscope") {
      setIconEl(<Microscope width={width} height={height} fill={fill} opt1={opt1} />);
    }
    else if (name === "WritePpen") {
      setIconEl(<WritePen width={width} height={height} fill={fill} opt1={opt1} />);
    }
    else if (name === "Article") {
      setIconEl(<Article width={width} height={height} fill={fill} opt1={opt1} />);
    }
    else if (name === "Globe") {
      setIconEl(<Globe width={width} height={height} fill={fill} opt1={opt1} />);
    }
    else if (name === "Workout") {
      setIconEl(<Workout width={width} height={height} fill={fill} opt1={opt1} />);
    }
    else if (name === "Alert") {
      setIconEl(<Alert width={width} height={height} fill={fill} opt1={opt1} />);
    }
  }, [name, width, height, fill, opt1]);

  return iconEl;
}

export default SubjectIcon;