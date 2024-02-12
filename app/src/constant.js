import { Alert, Article, Book, Coding, Globe, Microscope, Workout, WritePen } from "./utils/svgs";

const colorsList = [
  "#0395f9",
  "#3fc2ff",
  "#ff6844",
  "#82d795",
  "#705dc1",
  "#ffee65",
  "#beb9db",
  "#fdcce5",
  "#8bd3c7",
  "#e60049",
  "#0bb4ff",
  "#50e991",
  "#e6d800",
  "#9b19f5",
  "#ffa300",
  "#dc0ab4",
  "#b3d4ff",
  "#00bfa0",
];

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

export {colorsList, subjectIcons};