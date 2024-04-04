//import { Alert, Article, Book, Coding, Globe, IconCalculator, IconFileBarGraphFill, IconPeriodicTable, IconWhiteboard, Microscope, Workout, WritePen } from "@/utils/Svg";
import React from 'react';
import { Alert, Article, Book, Coding, Globe, Microscope, Workout, WritePen } from './Svg';

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

const coldColorsList = [
  "#57b9ff",
  "#0085FF",
  "#1c41fd",
];

const warmColorsList = [
  "#fff9eb",
  "#fe8912",
  "#f9c051",
]

const subjectIcons = {
  "Book": <Book />,
  "Coding": <Coding />,
  "Microscope": <Microscope />,
  "WritePen": <WritePen />,
  "Article": <Article />,
  "Globe": <Globe />,
  "Workout": <Workout />,
  "Alert": <Alert />
};

const toolsInfo = [
  /* {
    name: "Scientific Calculator",
    icon: <IconCalculator />
  },
  {
    name: "Graphing Calculator",
    icon: <IconFileBarGraphFill />
  },
  {
    name: "Periodic Table of Elements",
    icon: <IconPeriodicTable />
  },
  {
    name: "Whiteboard",
    icon: <IconWhiteboard />
  }, */
];

const colorPaletteOptions = [
  {
    name: 'Mustard',
    colors: ['#FFD151', '#FFEAAF', '#FFE190', '#FFD970']
  },
  {
    name: 'NamGH',
    colors: ['#9999FF', '#AAC4FF', '#D2DAFF', '#EEF1FF']
  },
  {
    name: 'Summer',
    colors: ['#FFF5E4', '#FFE3E1', '#FFD1D1', '#FF9494']
  },
  {
    name: 'Winter',
    colors: ['#E3FDFD', '#CBF1F5', '#A6E3E9', '#71C9CE']
  },
  {
    name: 'Fall',
    colors: ['#7D5A50', '#B4846C', '#E5B299', '#FCDEC0']
  },
  {
    name: 'Rainbow',
    colors: ['#F38181', '#FCE38A', '#EAFFD0', '#95E1D3']
  },
];

export { colorsList, subjectIcons, toolsInfo, coldColorsList, warmColorsList, colorPaletteOptions };